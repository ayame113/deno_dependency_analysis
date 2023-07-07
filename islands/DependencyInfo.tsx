import { client, useHono } from "../hooks/hono.ts";
import { VersionTable } from "../components/VersionsTable.tsx";
import {
  ArcElement,
  Chart,
  ChartJsChart,
  DoughnutController,
  LinearScale,
  Tooltip,
} from "../components/Chart.tsx";

Chart.register(DoughnutController, ArcElement, LinearScale, Tooltip);

interface DependencyInfoProps {
  url: string;
}

export default function DependencyInfo({ url }: DependencyInfoProps) {
  const { isLoading, error, data } = useHono(client.api.dependency_info.$get, {
    query: { url },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data.success) {
    return <div>Error: {data.reason}</div>;
  }

  const chartDataset: Record<string, number> = {};
  for (const version of Object.values(data.value.versions)) {
    if (version.src === "other") {
      chartDataset.other ??= 0;
      chartDataset.other++;
    } else if (version.differenceFromLatest) {
      chartDataset[version.differenceFromLatest] ??= 0;
      chartDataset[version.differenceFromLatest]++;
    } else {
      chartDataset.unknown ??= 0;
      chartDataset.unknown++;
    }
  }
  const labels = [];
  const dataSet = [];
  for (const [key, value] of Object.entries(chartDataset)) {
    labels.push(key);
    dataSet.push(value);
  }

  return (
    <div>
      GitHub上の利用者数: {data.value.search_count}件<br />
      リポジトリ名: {data.value.module_details?.full_name ?? "-"}
      <br />
      ホームページ: {data.value.module_details?.homepage ?? "-"}
      <br />
      リポジトリ: {data.value.module_details?.html_url ?? "-"}
      <br />
      アーカイブされているかどうか:
      {data.value.module_details?.archived ? "はい" : "いいえ"}
      <br />
      説明: {data.value.module_details?.description ?? "-"}
      <br />
      最終更新日: {data.value.module_details?.pushed_at ?? "-"}
      <br />
      GitHub スター数:
      {data.value.module_details?.stargazers_count ?? "-"}
      <br />
      開いているissue数: {data.value.module_details?.open_issues_count ?? "-"}
      <br />
      フォーク数: {data.value.module_details?.forks_count ?? "-"}
      <br />
      Watchしている人の数: {data.value.module_details?.subscribers_count ?? "-"}
      <br />
      関連トピック: {data.value.module_details?.topics?.join(", ") ?? "-"}
      <br />
      使用言語: {data.value.module_details?.language ?? "-"}
      <br />
      ダウンロードサイズ: xxxx MB<br />
      外部依存関係情報:<br />
      <div class="max-w-[20em] h-[20em]">
        <ChartJsChart
          config={{
            type: "doughnut",
            data: {
              labels,
              datasets: [{
                data: dataSet,
                backgroundColor: [
                  "rgb(255, 99, 132)",
                  "rgb(54, 162, 235)",
                  "rgb(255, 205, 86)",
                ],
                hoverOffset: 4,
              }],
            },
            options: {
              devicePixelRatio: 1,
              scales: { yAxes: { beginAtZero: true } },
            },
          }}
        />
      </div>
      <VersionTable versionInfo={data.value.versions} />
    </div>
  );
}
