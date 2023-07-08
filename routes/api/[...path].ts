import { Handler } from "$fresh/server.ts";
import { Hono } from "$hono/mod.ts";
import { validator } from "$hono/validator/index.ts";
import { logger } from "$hono/middleware.ts";

import { getAllDeps } from "../../utils/dependency.ts";
import { getVersionInfo } from "../../utils/version.ts";
import type { DepsInfo, ModulesInfo, Result } from "../../utils/types.d.ts";
import {
  getModuleDetails,
  getSearchCount,
} from "../../utils/module_details.ts";

const app = new Hono().basePath("/api");

const route = app.use("*", logger())
  .get("/status", (c) => c.jsonT({ status: "ok" }))
  .get(
    "/dependency_tree",
    validator("query", (value, c) => {
      if (!value.url) {
        return c.text("query parameter 'url' is required.", 400);
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
        return c.jsonT<Result<DepsInfo>>(
          { success, value, reason },
          status ?? 500,
        );
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
        return c.text("query parameter 'url' is required.", 400);
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
        return c.jsonT<Result<ModulesInfo>>(
          { success, value, reason },
          status ?? 500,
        );
      }
      const modules = Object.keys(value.deps);

      let versions, module_details, search_count;
      try {
        [versions, module_details, search_count] = await Promise.all([
          getVersionInfo(modules),
          getModuleDetails(url),
          getSearchCount(url),
        ]);
      } catch (e) {
        console.error(e);
        throw e;
      }

      const res: Result<ModulesInfo> = {
        success,
        value: {
          deps: value.deps,
          versions,
          timestamp: value.timestamp,
          module_details,
          search_count,
        },
      };
      return c.jsonT<Result<ModulesInfo>>(res);
    },
  );

export const handler: Handler = (req) => app.fetch(req);

export type AppType = typeof route;
