"use client";

import { DAYS_JP } from "@/lib/utils";

export function OnlineHeatmap({
  data,
}: {
  data: { dayOfWeek: number; hour: number; count: number }[];
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const getColor = (count: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.8) return "bg-purple-600";
    if (intensity > 0.6) return "bg-purple-500";
    if (intensity > 0.4) return "bg-purple-400";
    if (intensity > 0.2) return "bg-purple-300";
    if (intensity > 0) return "bg-purple-100";
    return "bg-zinc-100";
  };

  const getCount = (day: number, hour: number) =>
    data.find((d) => d.dayOfWeek === day && d.hour === hour)?.count ?? 0;

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex gap-1">
          <div className="flex w-8 flex-col gap-1 pt-6">
            {DAYS_JP.map((day) => (
              <div key={day} className="flex h-4 items-center text-xs text-zinc-500">
                {day}
              </div>
            ))}
          </div>
          <div>
            <div className="mb-1 flex gap-1">
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="w-4 text-center text-[10px] text-zinc-400">
                  {h % 3 === 0 ? h : ""}
                </div>
              ))}
            </div>
            {DAYS_JP.map((_, day) => (
              <div key={day} className="flex gap-1">
                {Array.from({ length: 24 }, (_, hour) => {
                  const count = getCount(day, hour);
                  return (
                    <div
                      key={hour}
                      className={`h-4 w-4 rounded-sm ${getColor(count)}`}
                      title={`${DAYS_JP[day]} ${hour}時: ${count}人`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
          <span>低</span>
          <div className="flex gap-0.5">
            {["bg-purple-100", "bg-purple-300", "bg-purple-400", "bg-purple-500", "bg-purple-600"].map(
              (c) => (
                <div key={c} className={`h-3 w-3 rounded-sm ${c}`} />
              )
            )}
          </div>
          <span>高</span>
        </div>
      </div>
    </div>
  );
}
