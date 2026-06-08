"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const periods = [
  { value: 7, label: "7日" },
  { value: 30, label: "30日" },
  { value: 90, label: "90日" },
];

export function AnalyticsPeriodSelector({ current }: { current: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setPeriod = (period: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", String(period));
    router.push(`/analytics?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      {periods.map((p) => (
        <Button
          key={p.value}
          size="sm"
          variant={current === p.value ? "default" : "outline"}
          onClick={() => setPeriod(p.value)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
