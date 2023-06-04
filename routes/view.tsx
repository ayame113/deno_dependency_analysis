import { Head } from "$fresh/runtime.ts";
import { Handler, PageProps } from "$fresh/server.ts";

import DependencyInfo from "../islands/DependencyInfo.tsx";

interface ViewProps {
  url?: string | null;
}

export const handler: Handler<ViewProps> = (req, ctx) => {
  const targetUrl = new URL(req.url).searchParams.get("url");
  return ctx.render({ url: targetUrl });
};

export default function View(props: PageProps<ViewProps>) {
  return (
    <>
      <Head>
        <title>Deno Dependency Analysis</title>
      </Head>
      <div>
        <div>{props.data.url}</div>
        <br />
        {props.data.url && urlCanParse(props.data.url)
          ? <DependencyInfo url={props.data.url} />
          : <div>url parse error</div>}
      </div>
    </>
  );
}

function urlCanParse(url: string) {
  // @ts-ignore: for wrong type
  return URL.canParse(url);
}
