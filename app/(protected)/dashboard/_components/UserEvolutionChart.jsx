"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/admin";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function UserEvolutionChart({ gestion }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiData = await adminService.getEvolucionUsuarios(gestion);

        // Transform API data (Chart.js format) to Recharts format
        // API: { labels: ["Enero", ...], datasets: [{ label: "Unit A", data: [1, 2...], borderColor: "..." }] }
        // Recharts: [{ name: "Enero", "Unit A": 1, ... }, ...]

        if (apiData && apiData.labels) {
          const transformedData = apiData.labels.map((label, index) => {
            const point = { name: label };
            apiData.datasets.forEach((dataset) => {
              point[dataset.label] = dataset.data[index];
            });
            return point;
          });
          setData({ chartData: transformedData, datasets: apiData.datasets });
        }
      } catch (error) {
        console.error("Error fetching evolution data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gestion]);

  if (loading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Evolución de Usuarios</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Evolución de Usuarios</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data.chartData}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--popover-foreground))",
              }}
            />
            <Legend />
            {data.datasets.map((dataset, index) => {
              const colors = [
                "#2563eb", // Blue
                "#16a34a", // Green
                "#dc2626", // Red
                "#d97706", // Amber
                "#9333ea", // Purple
                "#0891b2", // Cyan
                "#db2777", // Pink
                "#4f46e5", // Indigo
                "#ea580c", // Orange
                "#059669", // Emerald
              ];
              const color = colors[index % colors.length];

              return (
                <Line
                  key={dataset.label}
                  type="monotone"
                  dataKey={dataset.label}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 4, fill: color }}
                  activeDot={{ r: 8 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
