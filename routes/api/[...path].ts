import { Handler } from "$fresh/server.ts";
import { Hono } from "$hono/mod.ts";

const app = new Hono().basePath("/api");

const route = app
  .get("/status", (c) => c.jsonT({ status: "ok" }))
  .get("/hello", (c) => c.jsonT({ hello: "world" }));

export const handler: Handler = (req) => app.fetch(req);

export type AppType = typeof route;
