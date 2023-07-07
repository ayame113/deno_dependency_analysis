import { parse } from "./parser.ts";
import { getRepositoryDetails } from "./github.ts";
export { getSearchCount } from "./github.ts";
import { fetcher } from "./fetch.ts";
export async function getModuleDetails(specifier: string) {
  const { src, pkg, ver } = parse(specifier);
  if (src !== "deno.land/x") {
    return;
  }
  const res = await fetcher.fetch(
    `https://apiland.deno.dev/v2/pages/mod/info/${pkg}/${ver}`,
  );
  const data = await res.json();
  if (data.upload_options.type === "github") {
    const [owner, repo] = data.upload_options.repository.split("/");
    return await getRepositoryDetails(owner, repo);
  }
}
