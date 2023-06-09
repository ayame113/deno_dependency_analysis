// DO NOT EDIT. This file is generated by fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import config from "./deno.json" assert { type: "json" };
import * as $0 from "./routes/_app.tsx";
import * as $1 from "./routes/_middleware.ts";
import * as $2 from "./routes/api/[...path].ts";
import * as $3 from "./routes/index.tsx";
import * as $4 from "./routes/view.tsx";
import * as $$0 from "./islands/Counter.tsx";
import * as $$1 from "./islands/DependencyInfo.tsx";
import * as $$2 from "./islands/Search.tsx";

const manifest = {
  routes: {
    "./routes/_app.tsx": $0,
    "./routes/_middleware.ts": $1,
    "./routes/api/[...path].ts": $2,
    "./routes/index.tsx": $3,
    "./routes/view.tsx": $4,
  },
  islands: {
    "./islands/Counter.tsx": $$0,
    "./islands/DependencyInfo.tsx": $$1,
    "./islands/Search.tsx": $$2,
  },
  baseUrl: import.meta.url,
  config,
};

export default manifest;
