import { client, useHono } from "../hooks/hono.ts";
import { VersionTable } from "../components/VersionsTable.tsx";

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

  return (
    <div>
      <VersionTable versionInfo={data.value.versions} />
    </div>
  );
}
