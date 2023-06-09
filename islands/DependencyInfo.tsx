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
