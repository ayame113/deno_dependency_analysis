import { unreachable } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import {
  difference,
  parse as parseSemver,
} from "https://deno.land/std@0.193.0/semver/mod.ts";
import { fetcher } from "./fetch.ts";
import { type ModuleDependency, parse } from "./parser.ts";
import type { VersionInfo } from "./types.d.ts";

export async function getVersionInfo(
  modules: string[],
): Promise<Record<string, { [key in keyof VersionInfo]: VersionInfo[key] }>> {
  return Object.fromEntries(
    await Promise.all(modules.map(async (module) => {
      const moduleInfo = parse(module);
      const latest = await getLatestVersion(moduleInfo);
      const versionInfo: VersionInfo = {
        src: moduleInfo.src,
        org: moduleInfo.org,
        pkg: moduleInfo.pkg,
        version: moduleInfo.ver,
        mod: moduleInfo.mod,
        latest,
        differenceFromLatest: moduleInfo.ver === latest
          ? "latest"
          : !moduleInfo.ver
          ? "not pinned"
          : moduleInfo.ver && latest
          ? semverDiffernce(moduleInfo.ver, latest)
          : undefined,
      };
      return [module, versionInfo];
    })),
  );
}

const getLatestVersion = (() => {
  const denoLatestVersionCache: Record<
    string,
    Promise<string | undefined> | undefined
  > = {};
  async function denoLatestVersion(
    { pkg }: ModuleDependency,
  ): Promise<string | undefined> {
    if (denoLatestVersionCache[pkg]) {
      return denoLatestVersionCache[pkg];
    }
    return await (denoLatestVersionCache[pkg] = (async () => {
      const res = await fetcher.fetch(
        `https://cdn.deno.land/${pkg}/meta/versions.json`,
      );
      const { latest } = await res.json();
      denoLatestVersionCache[pkg] = latest;
      return latest;
    })());
  }

  return async function getLatestVersion(info: ModuleDependency) {
    switch (info.src) {
      case "std":
      case "cdn.deno.land":
      case "deno.land/x":
        return await denoLatestVersion(info);
      case "aws-api":
        break;
      case "crux.land":
        break;
      case "denolib.com":
        break;
      case "denopkg.com":
        break;
      case "esm.sh":
        break;
      case "ghc.deno.dev":
        break;
      case "ghuc.cc":
        break;
      case "gist.github.com":
        break;
      case "github.com":
        break;
      case "googleapis":
        break;
      case "jsdeliver.net":
        break;
      case "jspm.dev":
        break;
      case "lib.deno.dev":
        break;
      case "nest.land":
        break;
      case "other":
        break;
      case "pax.deno.dev":
        break;
      case "skypack.dev":
        break;
      case "unpkg.com":
        break;
      default:
        info.src satisfies never;
        unreachable();
    }
  };
})();

function semverDiffernce(a: string, b: string) {
  try {
    return difference(parseSemver(a), parseSemver(b));
  } catch (e) {
    console.warn(e);
    return "unknown";
  }
}
