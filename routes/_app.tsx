import { Head } from "$fresh/runtime.ts";
import { AppProps } from "$fresh/src/server/types.ts";

import { Link } from "../components/Link.tsx";

export default function App({ Component }: AppProps) {
  return (
    <html data-custom="data">
      <Head>
        <title>Fresh</title>
      </Head>
      <body class="bodyClass">
        <header>
          <h1>Deno Dependency Analysis</h1>
        </header>
        <main>
          <Component />
        </main>
        <footer>
          <Link href="https://github.com/ayame113/deno_dependency_analysis">
            GitHub
          </Link>
        </footer>
      </body>
    </html>
  );
}
