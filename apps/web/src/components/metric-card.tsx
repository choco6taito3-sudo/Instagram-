import { Card } from "./ui/card";
import { formatNumber, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export function MetricCard({
  title,
  value,
  suffix,
  change,
  format = "number",
}: {
  title: string;
  value: number;
  suffix?: string;
  change?: number;
  format?: "number" | "percent";
}) {
  const displayValue =
    format === "percent" ? formatPercent(value) : formatNumber(value);

  return (
    <Card>
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        {displayValue}
        {suffix && <span className="text-lg font-normal text-zinc-500">{suffix}</span>}
      </p>
      {change !== undefined && (
        <div
          className={`mt-2 flex items-center gap-1 text-sm ${
            change >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {change >= 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {change >= 0 ? "+" : ""}
          {change.toFixed(1)}% 前期比
        </div>
      )}
    </Card>
  );
}
