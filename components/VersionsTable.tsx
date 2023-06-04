import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

import type { VersionInfo } from "../utils/types.d.ts";

interface VersionTableProps {
  versionInfo: Record<string, VersionInfo>;
}

export function VersionTable(props: VersionTableProps) {
  return (
    <div class="overflow-scroll h-[80vh]">
      <table class="text-center leading-tight whitespace-nowrap">
        <tr class="text-white border-b-2 border-neutral-300 [&>*]:(bg-blue-800 p-1 sticky top-0 z-10 border-x-2 border-neutral-100)">
          <th>src</th>
          <th>org/pkg</th>
          <th>version</th>
          <th>latest</th>
          <th>update</th>
          <th>mod</th>
        </tr>
        {Object
          .entries(props.versionInfo)
          .sort(([a], [b]) => a > b ? 1 : a < b ? -1 : 0)
          .map(([_, info]) => {
            const isNotPinned = !info.version;
            return (
              <>
                <tr
                  class={`border-b-2 border-neutral-300 [&>*]:(px-1 pt-1 border-x-2 border-neutral-300 border-dashed)`}
                >
                  <td>{info.src}</td>
                  <td>
                    {info.org && info.pkg
                      ? `@${info.org}/${info.pkg}`
                      : info.org
                      ? `@${info.org}`
                      : info.pkg}
                  </td>
                  <td>
                    {info.version || "-"}
                  </td>
                  <td>{info.latest || "-"}</td>
                  <td class={isNotPinned ? "bg-red-600 text-white" : ""}>
                    {info.differenceFromLatest}
                  </td>
                  <td class="text-left">{info.mod}</td>
                </tr>
                {
                  /* <tr
                  class={`border-b-2 border-neutral-300 [&>*]:(pb-1 border-x-2 border-neutral-300 border-dashed)`}
                >
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td class={isNotPinned ? "bg-red-600 text-white" : ""}></td>
                  <td></td>
                </tr> */
                }
              </>
            );
          })}
      </table>
    </div>
  );
}
