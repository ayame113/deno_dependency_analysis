import type { ReleaseType } from "https://deno.land/std@0.190.0/semver/mod.ts";
import type { DependencySources } from "./parser.ts";

export interface DepsInfo {
  /** 依存関係ツリー */
  deps: Record<string, string[]>;
  /** データ取得時刻 */
  timestamp: number;
}

export interface ModulesInfo extends DepsInfo {
  versions: Record<string, VersionInfo>;
  module_details?: {
    archived: boolean;
    description: string | null;
    forks_count: number;
    full_name: string;
    homepage: string | null;
    html_url: string;
    language: string | null;
    open_issues_count: number;
    pushed_at: string;
    stargazers_count: number;
    subscribers_count: number;
    topics?: string[] | undefined;
  };
  search_count: number;
}

export interface VersionInfo {
  src: DependencySources;
  org: string | undefined;
  pkg: string;
  version: string | undefined;
  mod: string | undefined;
  latest: string | undefined;
  differenceFromLatest:
    | ReleaseType
    | "latest"
    | "not pinned"
    | "unknown"
    | null
    | undefined;
}

export type Result<T> = SuccessResult<T> | ErrorResult;

export interface SuccessResult<T> {
  success: true;
  value: T;
  reason?: undefined;
  status?: 200;
}

export interface ErrorResult {
  success: false;
  value?: undefined;
  reason: string;
  status?: number;
}
