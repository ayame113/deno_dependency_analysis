import { useEffect, useState } from "preact/hooks";

import { hc } from "$hono/mod.ts";
import type { AppType } from "../routes/api/[...path].ts";

export const client = hc<AppType>("/");

// deno-lint-ignore no-explicit-any
export function useHono<F extends (...args: any[]) => Promise<Response>>(
  endpoint: F,
  ...args: Parameters<F>
) {
  type Data = Awaited<ReturnType<Awaited<ReturnType<F>>["json"]>>;
  const [result, setResult] = useState<
    | { isLoading: true; error?: undefined; data?: undefined }
    | { isLoading: false; error?: undefined; data: Data }
    | { isLoading: false; error: Error; data?: undefined }
  >({ isLoading: true });

  useEffect(() => {
    endpoint(...args)
      .then((res) => res.json())
      .then((res) => setResult({ isLoading: false, data: res }))
      .catch((error: unknown) =>
        setResult({
          isLoading: false,
          error: error instanceof Error ? error : new Error(`${error}`),
        })
      );
  }, []);

  return result;
}
