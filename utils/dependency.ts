import { init, parse } from "https://esm.sh/es-module-lexer@1.2.1";
import { fetcher, RateLimitError } from "./fetch.ts";
import { SUPPORTED_DOMAIN_LIST } from "./const.ts";
import type { DepsInfo, Result } from "./types.d.ts";

// key                                  | value
// ["cache", "all_deps", url]           | { [url]: [deps1, deps2, deps3, ...] }
// ["cache", "date", year, month, date] | Set { url1, url2, url3, ... }

// avoid tla
const kvPromise = Deno.openKv(
  Deno.env.get("DENO_DEPLOYMENT_ID") ? undefined : "./tmp.sqlite",
);

interface LoadOptions {
  readonly reload?: boolean;
}

/** get all dependency tree */
export async function getAllDeps(
  url: string,
  { reload = false }: LoadOptions = {},
): Promise<Result<DepsInfo>> {
  const { hostname } = new URL(url);
  if (SUPPORTED_DOMAIN_LIST.every((e) => !hostname.endsWith(e))) {
    return { success: false, reason: `unsupported domain: ${hostname}` };
  }
  if (reload) {
    await deleteCache(url);
  } else {
    const cache = await getDepsFromCache(url);
    if (cache) {
      return { success: true, value: cache };
    }
  }
  try {
    const deps = await getDepsFromSource(url, { reload });
    saveDepsToCache(url, deps);
    return { success: true, value: deps };
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { success: false, reason: `rate limit exceeded.`, status: 429 };
    } else {
      throw error;
    }
  }
}

/** load dependency data from cache. */
async function getDepsFromCache(url: string) {
  const kv = await kvPromise;
  const res = await kv.get<DepsInfo>(["cache", "all_deps", url]);
  return res.value;
}

/** load dependency data from network. */
async function getDepsFromSource(url: string, { reload }: LoadOptions) {
  const urls = new Set([url]);
  const res: Record<string, string[]> = {};
  let timestamp = Date.now();
  for (const url of urls) {
    if (!reload) {
      const cache = await getDepsFromCache(url);
      if (cache) {
        assignDependency(res, cache.deps);
        timestamp = Math.min(timestamp, cache.timestamp);
        continue;
      }
    }
    const deps = await fetchAndParse(url);
    for (const dep of deps) {
      urls.add(dep);
      (res[url] ??= []).push(dep);
      res[dep] ??= [];
    }
  }
  return { deps: res, timestamp };
}

/** delete dependency data from cache. */
async function deleteCache(url: string) {
  const kv = await kvPromise;
  await kv.delete(["cache", "all_deps", url]);
}

/** save dependency data to cache. */
async function saveDepsToCache(url: string, deps: DepsInfo) {
  const kv = await kvPromise;
  const date = new Date(deps.timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  while (true) {
    const cacheDate = await kv.get<Set<string>>(
      ["cache", "date", year, month, day],
    );
    const newCacheDate = (cacheDate.value ?? new Set()).add(url);
    const res = await kv.atomic()
      .check(cacheDate)
      .set(["cache", "all_deps", url], deps)
      .set(["cache", "date", year, month, day], newCacheDate)
      .commit();
    if (res.ok) {
      break;
    }
  }
}

/** load and parse file */
async function fetchAndParse(url: string): Promise<string[]> {
  new URL(url); // throw if not url
  const res = await fetcher.fetch(url);
  const text = await res.text();
  const imports = await getAllImports(text, url);
  return imports
    .map((specifier) => {
      try {
        const urlWithSpecifier = new URL(specifier, url);
        if (
          urlWithSpecifier.protocol === "http:" ||
          urlWithSpecifier.protocol === "https:"
        ) {
          return urlWithSpecifier.toString();
        }
      } catch (error) {
        console.error("failed to parse url:", specifier, "in", url, error);
      }
    })
    .filter(<T>(v: T): v is NonNullable<T> => !!v);
}

/** parse and detect import statement */
async function getAllImports(code: string, moduleName: string) {
  await init;
  try {
    const [imports] = parse(code);
    return imports
      .map((v) => v.n)
      .filter(<T>(v: T): v is NonNullable<T> => !!v);
  } catch (e) {
    console.error("failed to parse:", moduleName, e);
    return [];
  }
}

/** merge deps2 to deps1 */
function assignDependency(deps1: DepsInfo["deps"], deps2: DepsInfo["deps"]) {
  for (const key in deps2) {
    if (!Object.hasOwn(deps2, key)) {
      continue;
    }
    if (Array.isArray(deps1[key])) {
      deps1[key].push(...deps2[key]);
    } else {
      deps1[key] = deps2[key];
    }
  }
}
