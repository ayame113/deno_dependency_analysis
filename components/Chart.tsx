export * from "https://esm.sh/chart.js@4.3.0";
import { Chart } from "https://esm.sh/chart.js@4.3.0";
import { useEffect, useRef } from "preact/hooks";
import { JSX } from "preact";

interface ChartJsChartProps extends JSX.HTMLAttributes<HTMLCanvasElement> {
  config: ConstructorParameters<typeof Chart>[1];
}

/**
 * ```ts ignore
 * import {
 *   CategoryScale,
 *   Chart,
 *   ChartJsChart,
 *   LinearScale,
 *   LineController,
 *   LineElement,
 *   PointElement,
 * } from "../components/Chart.tsx";
 *
 * Chart.register(
 *   LineController,
 *   LineElement,
 *   PointElement,
 *   CategoryScale,
 *   LinearScale,
 * );
 *
 * <ChartJsChart
 *   config={{
 *     type: "line",
 *     data: {
 *       labels: ["1", "2", "3"],
 *       datasets: [{
 *         label: "Sessions",
 *         data: [123, 234, 234],
 *         borderColor: "red",
 *         backgroundColor: "red",
 *         borderWidth: 1,
 *       }, {
 *         label: "Users",
 *         data: [346, 233, 123],
 *         borderColor: "blue",
 *         backgroundColor: "red",
 *         borderWidth: 1,
 *       }],
 *     },
 *     options: {
 *       devicePixelRatio: 1,
 *       scales: { yAxes: { beginAtZero: true } },
 *     },
 *   }}
 * />
 * ```
 */
export function ChartJsChart({ config, ...props }: ChartJsChartProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const chart = ref.current ? new Chart(ref.current, config) : undefined;
    return () => chart?.destroy();
  }, []);
  return <canvas ref={ref} {...props} />;
}
