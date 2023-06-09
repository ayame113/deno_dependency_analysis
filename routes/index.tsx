import { Head } from "$fresh/runtime.ts";
import Search from "../islands/Search.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Deno Dependency Analysis</title>
      </Head>
      <div>
        <h2>Usage</h2>
        <ol class="list-decimal ml-6">
          <li>input target url below</li>
          <li>click [search] button</li>
        </ol>
        <Search />
      </div>
    </>
  );
}
