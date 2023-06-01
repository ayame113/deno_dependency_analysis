import { useEffect, useState } from "preact/hooks";

import { hc } from "$hono/mod.ts";
import type { AppType } from "../routes/api/[...path].ts";

const client = hc<AppType>("/");

async function getStatus() {
  client.api.dependency_tree.$get({
    query: {
      url: "",
      reload: undefined,
    },
  });
  const res = await client.api.status.$get();
  return await res.json();
}

export default function Hello() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    getStatus().then((data) => setMessage(data.status));
  }, []);

  return <div>{message}</div>;
}
