import { MiddlewareHandler } from "$fresh/server.ts";
import { BUILD_ID, DEBUG } from "$fresh/src/server/constants.ts";

const freshAssetPattern = new URLPattern({
  pathname: `/_frsh/js/${BUILD_ID}/:chunkName`,
});

export const handler: MiddlewareHandler[] = [
  async function (req, ctx) {
    const match = freshAssetPattern.exec(req.url);
    if (!match || !match.pathname.groups.chunkName) {
      return ctx.next();
    }
    console.log(match.pathname.groups);
    const { chunkName } = match.pathname.groups;
    const cacheData = await cache.get(chunkName);
    if (cacheData) {
      return new Response(cacheData.body, { headers: cacheData.headers });
    }
    // console.log(req, ctx);
    console.log(req.url);
    const res = await ctx.next();
    console.log(res);

    const data = await res.arrayBuffer();
    cache.set(chunkName, data, Object.fromEntries(res.headers.entries()));
    return new Response(data, {
      headers: res.headers,
      status: res.status,
    });
  },
];

const maxArrayBufferLength = 60000;
const KV_PREFIX = "__fresh_cache__";

class Cache {
  #kvPromise = Deno.openKv(DEBUG ? "./cache.sqlite" : undefined);
  #inMemoryCache: Record<
    string,
    { headers: Record<string, string>; body: ArrayBuffer } | undefined
  > = {};

  constructor() {
    this.initKv();
  }

  async initKv() {
    const kv = await this.#kvPromise;
    const buildIdInKv = (await kv.get<string>([KV_PREFIX, "buildId"])).value;
    if (buildIdInKv === BUILD_ID) {
      return;
    }
    if (buildIdInKv) {
      // clean cache
      const prefix = [KV_PREFIX];
      for await (const entry of kv.list<ArrayBuffer>({ prefix })) {
        kv.delete(entry.key); // don't await
      }
    }
    await kv.set([KV_PREFIX, "buildId"], BUILD_ID);
  }

  async set(
    chunkName: string,
    content: ArrayBuffer,
    headers: Record<string, string>,
  ) {
    console.log("set", chunkName);
    this.#inMemoryCache[chunkName] = { body: content, headers };
    const kv = await this.#kvPromise;
    const buffers = [];
    for (let i = 0; i < content.byteLength; i += maxArrayBufferLength) {
      buffers.push(content.slice(i, i + maxArrayBufferLength));
    }
    while (true) {
      let atomic = kv.atomic()
        .set([KV_PREFIX, "headers", BUILD_ID, chunkName], headers);
      for (const [i, buffer] of buffers.entries()) {
        console.log(buffer.byteLength);
        atomic = atomic.set(
          [KV_PREFIX, "buildOutput", BUILD_ID, chunkName, i],
          buffer,
        );
      }
      const res = await atomic.commit();
      if (res.ok) {
        break;
      }
    }
  }

  async get(chunkName: string) {
    console.log("get", chunkName);
    if (this.#inMemoryCache[chunkName]) {
      return this.#inMemoryCache[chunkName];
    }
    const kv = await this.#kvPromise;

    const cacheData: Record<string, ArrayBuffer[]> = {};
    const prefix = [KV_PREFIX, "buildOutput", BUILD_ID];
    for await (const entry of kv.list<ArrayBuffer>({ prefix })) {
      const [_, __, ___, chunkName] = entry.key;
      cacheData[chunkName as string] ??= [];
      cacheData[chunkName as string].push(entry.value);
    }

    const headersData: Record<string, Record<string, string>> = {};
    const headersPrefix = [KV_PREFIX, "headers", BUILD_ID];
    for await (
      const entry of kv.list<Record<string, string>>({ prefix: headersPrefix })
    ) {
      const [_, __, ___, chunkName] = entry.key;
      headersData[chunkName as string] = entry.value;
    }

    for (const [chunkName, buffers] of Object.entries(cacheData)) {
      this.#inMemoryCache[chunkName] = {
        body: await concatArrayBuffers(buffers),
        headers: headersData[chunkName],
      };
    }
    return this.#inMemoryCache[chunkName];
  }
}
const cache = new Cache();

async function concatArrayBuffers(buffers: ArrayBuffer[]) {
  const blob = new Blob(buffers);
  return await blob.arrayBuffer();
}
