import { Handler } from "$fresh/server.ts";
import { Hono } from "$hono/mod.ts";
import { validator } from "$hono/validator/index.ts";

import { getAllDeps } from "../../utils/dependency.ts";
import { getVersionInfo } from "../../utils/version.ts";
import type { DepsInfo, ModulesInfo, Result } from "../../utils/types.d.ts";

const app = new Hono().basePath("/api");

const route = app
  .get("/status", (c) => c.jsonT({ status: "ok" }))
  .get(
    "/dependency_tree",
    validator("query", (value, c) => {
      if (!value.url) {
        return c.text("query parameter 'url' is required.", 500);
      }
      return {
        url: value.url,
        reload: value.reload,
      } as {
        url: string;
        reload?: string;
      };
    }),
    async (c) => {
      const { url, reload } = c.req.valid("query");
      const { success, value, reason, status } = await getAllDeps(url, {
        reload: reload === undefined ? false : true,
      });
      if (!success) {
        return c.jsonT({ success, value, reason }, status ?? 500);
      }
      return c.jsonT<Result<DepsInfo>>({
        success,
        value: { deps: value.deps, timestamp: value.timestamp },
        reason,
      });
    },
  )
  .get(
    "/dependency_info",
    validator("query", (value, c) => {
      if (!value.url) {
        return c.text("query parameter 'url' is required.", 500);
      }
      return {
        url: value.url,
        reload: value.reload,
      } as {
        url: string;
        reload?: string;
      };
    }),
    async (c) => {
      const { url, reload } = c.req.valid("query");
      const { success, value, reason, status } = await getAllDeps(url, {
        reload: reload === undefined ? false : true,
      });
      if (!success) {
        return c.jsonT({ success, value, reason }, status ?? 500);
      }
      const modules = Object.keys(value.deps);

      return c.jsonT<Result<ModulesInfo>>({
        success,
        value: {
          deps: value.deps,
          versions: await getVersionInfo(modules),
          timestamp: value.timestamp,
        },
        reason,
      });
    },
  );

export const handler: Handler = (req) => app.fetch(req);

export type AppType = typeof route;
