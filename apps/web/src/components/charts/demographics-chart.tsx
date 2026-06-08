"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b", "#10b981", "#6366f1"];

export function DemographicsDonutChart({
  data,
}: {
  data: { value: string; count: number; percentage: number }[];
}) {
  const chartData = data.map((d) => ({
    name: d.value,
    value: d.count,
    percentage: d.percentage,
  }));

  return (
    <div className="h-[240px] w-full min-w-0 md:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={(props: { name?: string; percentage?: number }) =>
            `${props.name} ${props.percentage?.toFixed(1)}%`
          }
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DemographicsBarChart({
  data,
}: {
  data: { value: string; count: number; percentage: number }[];
}) {
  return (
    <div className="h-[200px] w-full min-w-0" style={{ minHeight: Math.max(200, data.length * 40) }}>
      <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="value" tick={{ fontSize: 11 }} width={56} />
        <Tooltip />
        <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
      </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
