import { AppProps } from "$fresh/src/server/types.ts";

import { Link } from "../components/Link.tsx";

export default function App({ Component }: AppProps) {
  return (
    <html>
      <body class="min-h-screen grid self-[start] grid-rows-[auto_1fr_auto] grid-cols-1 bg-neutral-50 dark:(bg-neutral-600 text-neutral-50)">
        <header class="p-4 text-xl border-t-4 border-teal-500 dark:border-teal-600">
          <h1>
            <a href="/">Deno Dependency Analysis</a>
          </h1>
        </header>
        <main class="bg-gray-200 shadow-inner p-1 [&>*]:(bg-neutral-50 p-4 my-6 rounded-lg mx-auto max-w-screen-sm shadow) dark:(bg-neutral-700 [&>*]:bg-neutral-600)">
          <Component />
        </main>
        <footer class="px-4 py-2 text-right">
          <Link href="https://github.com/ayame113/deno_dependency_analysis">
            GitHub
          </Link>
        </footer>
      </body>
    </html>
  );
}
