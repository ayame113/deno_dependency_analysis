import { Handler } from "$fresh/server.ts";
import { Hono } from "$hono/mod.ts";

import { getAllDeps } from "../../utils/dependency.ts";

const app = new Hono().basePath("/api");

const route = app
  .get("/status", (c) => c.jsonT({ status: "ok" }))
  .get("/dependency_tree", async (c) => {
    const url = c.req.query("url");
    console.log(url);
    return c.jsonT(await getAllDeps(url as string) as any);
  });

export const handler: Handler = (req) => app.fetch(req);

export type AppType = typeof route;
