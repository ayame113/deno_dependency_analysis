// Note: logic was copy from denoland/apiland

export function parse(specifier: string): ModuleDependency {
  for (
    const [src, urlPatterns] of Object.entries(patterns) as [
      keyof typeof patterns,
      URLPattern[],
    ][]
  ) {
    for (const pattern of urlPatterns) {
      const match = pattern.exec(specifier);
      if (match) {
        const { org, pkg = "std", ver, mod } = match.pathname.groups;
        return { src, org, pkg, ver, mod };
      }
    }
  }
  return { src: "other", pkg: specifier };
}

// copied from https://github.com/denoland/apiland/blob/8e083087f99e10c5ed27d19d306cb802abdbcd2c/consts.ts
/** A set of URL patterns that are used to parse specifiers to determine their
 * source. */
const patterns = {
  /** Modules that or external to the current module, but hosted on
   * `deno.land/x`. */
  "deno.land/x": [
    new URLPattern({
      protocol: "https",
      hostname: "deno.land",
      pathname: "/x/:pkg{@:ver}?/:mod*",
      search: "*",
      hash: "*",
    }),
  ],
  /** Modules that are being read directly off the deno.land CDN. */
  "cdn.deno.land": [
    // https://cdn.deno.land/mimetypes/versions/v1.0.0/raw/mod.ts
    new URLPattern("https://cdn.deno.land/:pkg/versions/:ver/raw/:mod+"),
  ],
  /** Dependency that originates from the Deno `std` library. */
  "std": [
    new URLPattern({
      protocol: "https",
      hostname: "deno.land",
      pathname: "/std{@:ver}?/:mod*",
      search: "*",
      hash: "*",
    }),
  ],
  /** Modules/packages hosted on nest.land. */
  "nest.land": [new URLPattern("https://x.nest.land/:pkg@:ver/:mod*")],
  /** Modules hosted on crux.land. */
  "crux.land": [new URLPattern("https://crux.land/:pkg@:ver")],
  /** Content hosted on GitHub. */
  "github.com": [
    new URLPattern({
      protocol: "https",
      hostname: "raw.githubusercontent.com",
      pathname: "/:org/:pkg/:ver/:mod*",
      search: "*",
    }),
    // https://github.com/denoland/deno_std/raw/main/http/mod.ts
    new URLPattern(
      "https://github.com/:org/:pkg/raw/:ver/:mod*",
    ),
  ],
  /** Content that is hosted in a GitHub gist. */
  "gist.github.com": [
    new URLPattern(
      "https://gist.githubusercontent.com/:org/:pkg/raw/:ver/:mod*",
    ),
  ],
  /** Packages that are hosted on esm.sh. */
  "esm.sh": [
    new URLPattern({
      protocol: "http{s}?",
      hostname: "{cdn.}?esm.sh",
      pathname: "/:org(@[^/]+)?/:pkg{@:ver}?/:mod*",
      search: "*",
    }),
    // https://esm.sh/v92/preact@10.10.0/src/index.d.ts
    new URLPattern({
      protocol: "http{s}?",
      hostname: "{cdn.}?esm.sh",
      pathname: "/:regver(stable|v[0-9]+)/:org(@[^/]+)?/:pkg{@:ver}?/:mod*",
      search: "*",
    }),
  ],
  "denopkg.com": [
    new URLPattern({
      protocol: "https",
      hostname: "denopkg.com",
      pathname: "/:org(@[^/]+)?/:pkg{@:ver}?/:mod*",
      search: "*",
      hash: "*",
    }),
  ],
  "denolib.com": [
    new URLPattern({
      protocol: "https",
      hostname: "denolib.com",
      pathname: "/:org(@[^/]+)?/:pkg{@:ver}?/:mod*",
      search: "*",
      hash: "*",
    }),
  ],
  "lib.deno.dev": [
    new URLPattern({
      protocol: "https",
      hostname: "lib.deno.dev",
      pathname: "/x/:pkg{@:ver}?/:mod*",
      search: "*",
      hash: "*",
    }),
  ],
  /** a github proxy */
  "pax.deno.dev": [
    // https://pax.deno.dev/windchime-yk/deno-util@v1.1.1/file.ts
    new URLPattern("https://pax.deno.dev/:org/:pkg{@:ver}?/:mod*"),
  ],
  /** a github proxy */
  "ghuc.cc": [
    // https://ghuc.cc/qwtel/kv-storage-interface/index.d.ts
    new URLPattern("https://ghuc.cc/:org/:pkg{@:ver}?/:mod*"),
  ],
  "ghc.deno.dev": [
    // https://ghc.deno.dev/tbjgolden/deno-htmlparser2@1f76cdf/htmlparser2/Parser.ts
    new URLPattern("https://ghc.deno.dev/:org/:pkg{@:ver}?/:mod*"),
  ],
  /** jspm.dev and jspm.io packages */
  "jspm.dev": [
    // https://jspm.dev/@angular/compiler@11.0.5
    new URLPattern(
      "https://jspm.dev/:org((?:npm:)?@[^/]+)?/:pkg{@:ver([^!/]+)}?{(![^/]+)}?/:mod*",
    ),
    // https://dev.jspm.io/markdown-it@11.0.1
    new URLPattern(
      "https://dev.jspm.io/:org((?:npm:)?@[^/]+)?/:pkg{@:ver([^!/]+)}?{(![^/]+)}?/:mod*",
    ),
  ],
  /** Packages that are hosted on skypack.dev */
  "skypack.dev": [
    // このパターンを優先してキャプチャするようにする
    // https://cdn.skypack.dev/-/@firebase/firestore@v3.4.3-A3UEhS17OZ2Vgra7HCZF/dist=es2019,mode=types/dist/index.d.ts
    new URLPattern(
      "https://cdn.skypack.dev/-/:org(@[^/]+)?/:pkg@:ver([^-]+):hash/:mod*",
    ),
    new URLPattern({
      protocol: "https",
      hostname: "cdn.skypack.dev",
      pathname: "/:org(@[^/]+)?/:pkg{@:ver}?/:mod*",
      search: "*",
    }),
    // https://cdn.shopstic.com/pin/ajv-formats@v2.1.1-vcFtNZ2SctUV93FmiL2Q/dist=es2020,mode=types/dist/index.d.ts
    // this cdn simply redirects to skypack.dev
    new URLPattern({
      protocol: "https",
      hostname: "cdn.shopstic.com",
      pathname: "/pin/:org(@[^/]+)?/:pkg{@:ver([^-/]+)}:hash/:mod*",
      search: "*",
    }),
    // https://cdn.pika.dev/class-transformer@^0.2.3
    new URLPattern({
      protocol: "https",
      hostname: "cdn.pika.dev",
      pathname: "/:org(@[^/]+)?/:pkg{@:ver}?/:mod*",
      search: "*",
    }),
  ],
  /** Packages that are hosted on jsdeliver.net */
  "jsdeliver.net": [
    new URLPattern(
      "https://cdn.jsdelivr.net/npm/:org(@[^/]+)?/:pkg{@:ver}?/:mod*",
    ),
    new URLPattern(
      "https://cdn.jsdelivr.net/gh/:org/:pkg{@:ver}?/:mod*",
    ),
  ],
  /** Packages that are hosted on unpkg.com */
  "unpkg.com": [
    new URLPattern(
      "https://unpkg.com/:org(@[^/]+)?/:pkg{@:ver}?/:mod*",
    ),
  ],

  /** Not really a package/module host, but performs codegen for aws APIs. */
  "aws-api": [
    // https://aws-api.deno.dev/latest/services/sqs.ts
    new URLPattern({
      protocol: "https",
      hostname: "aws-api.deno.dev",
      pathname: "/:ver/services/:pkg{(\\.ts)}",
      search: "*",
    }),
  ],

  /** Not really a package/module host, but performs codegen for google cloud
   * APIs. */
  "googleapis": [
    new URLPattern({
      protocol: "https",
      hostname: "googleapis.deno.dev",
      pathname: "/v1/:pkg([^:]+){(:)}:ver{(\\.ts)}",
      search: "*",
    }),
  ],
};

// https://github.com/denoland/apiland/blob/8e083087f99e10c5ed27d19d306cb802abdbcd2c/types.d.ts
export type DependencySources = keyof typeof patterns | "other";
/** Stored as kind `module_dependency` in datastore. */
export interface ModuleDependency {
  /** The source for the module. If the module is not a recognized source, then
   * `"other"` is used and the `pkg` field will be set to the "raw" URL. */
  src: DependencySources;
  /** The optional "organization" associated with dependency. For example with
   * npm or GitHub style dependency, the organization that the `pkg` belongs
   * to. */
  org?: string;
  /** The package or module name associated with the dependency. */
  pkg: string;
  /** The optional version or tag associated with the dependency. */
  ver?: string;

  mod?: string;
}
