import "https://deno.land/std@0.193.0/dotenv/load.ts";

import { deadline } from "https://deno.land/std@0.193.0/async/deadline.ts";

type OctokitRestApi =
  import("npm:@octokit/plugin-rest-endpoint-methods/dist-types/types").Api;

import { App } from "https://esm.sh/octokit@2.1.0";

const app = new App({
  appId: Deno.env.get("GITHUB_APP_ID")!,
  privateKey: Deno.env.get("GITHUB_APP_PRIVATE_KEY")!,
  oauth: {
    clientId: Deno.env.get("GITHUB_APP_CLIENT_ID")!,
    clientSecret: Deno.env.get("GITHUB_APP_CLIENT_SECRET")!,
  },
});

const octokit = await app.getInstallationOctokit(
  +Deno.env.get("GITHUB_APP_INSTALLATION_ID")!,
);

export async function getRepositoryDetails(owner: string, repo: string) {
  const res = await octokit.rest.repos.get({ owner, repo });
  const {
    archived,
    description,
    forks_count,
    full_name,
    homepage,
    html_url,
    language,
    open_issues_count,
    pushed_at,
    stargazers_count,
    subscribers_count,
    topics,
  } = res.data;
  return {
    archived,
    description,
    forks_count,
    full_name,
    homepage,
    html_url,
    language,
    open_issues_count,
    pushed_at,
    stargazers_count,
    subscribers_count,
    topics,
  };
}

/** 検索に何件ひっかかるか */
export async function getSearchCount(url: string) {
  const res = await deadline(octokit.rest.search.code({ q: `${url}` }), 5000);

  return res.data.total_count;
}
