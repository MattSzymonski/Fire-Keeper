import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@heroui/react";

type ContainerInfo = {
  key: string;
  name: string;
  status: string;
  id: string;
};

const columns = [
  { key: "name", label: "NAME" },
  { key: "status", label: "STATUS" },
  { key: "id", label: "ID" },
];

const getStatusColor = (status: string) => {
  if (status.includes("Exited")) return "bg-red";
  if (status.includes("Paused") || status.includes("unhealthy")) return "bg-yellow";
  if (status.includes("Up")) return "bg-green";
  return "bg-gray";
};

export default function DockerContainersStatus() {
  const [rows, setRows] = useState<ContainerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/docker-containers-status");
        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        const formatted = data.containers.map((c: any, i: number) => ({
          key: String(i),
          name: c.name,
          status: c.status,
          id: c.id,
        }));
        setRows(formatted);
      } catch (err) {
        console.error("Failed to load containers:", err);
        setError((err as Error).message || "Failed to load containers");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading || error) {
    // Create 3 skeleton items with keys
    const skeletonItems = [
      { key: "skeleton-1" },
      { key: "skeleton-2" },
      { key: "skeleton-3" },
    ];
  
    return (
      <div>
        <Table aria-label="Docker Containers Status (Loading)">
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={skeletonItems}>
            {(item) => (
              <TableRow key={item.key}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4 mx-auto" />
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Table aria-label="Docker Containers Status">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={rows}>
          {(item) => (
            <TableRow key={item.key}>
              {(columnKey) => (
              <TableCell>
              {columnKey === "status" ? (
                <div className="flex items-center gap-2" >
                  <span className={`min-w-2.5 min-h-2.5 rounded-full ${getStatusColor(item.status)}`}/>
                  {item.status}
                </div>
              ) : (
                getKeyValue(item, columnKey)
              )}
            </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
