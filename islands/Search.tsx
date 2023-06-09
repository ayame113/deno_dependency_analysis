import { useState } from "preact/hooks";

export default function Search() {
  const [url, setUrl] = useState<URL | null>(null);
  return (
    <div class="flex">
      <input
        class="border-2 flex-grow p-1 m-1 rounded"
        type="text"
        onInput={(e) => {
          if (!isUrl(e.currentTarget.value)) {
            setUrl(null);
            return;
          }
          const url = new URL("/view", location.href);
          url.searchParams.set("url", e.currentTarget.value);
          setUrl(url);
        }}
        placeholder="https://deno.land/x/oak@v12.5.0/mod.ts"
      />
      <a
        class={`p-1 m-1 rounded text-white ${
          url === null ? "pointer-events-none bg-blue-400" : "bg-blue-600"
        }`}
        href={url?.href}
      >
        Search
      </a>
    </div>
  );
}

function isUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}
