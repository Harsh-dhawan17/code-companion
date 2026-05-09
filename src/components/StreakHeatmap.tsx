import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props { userId: string; }

const DAY_MS = 86400000;

export default function StreakHeatmap({ userId }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const since = new Date(Date.now() - 365 * DAY_MS).toISOString();
    supabase
      .from("submissions")
      .select("created_at, status")
      .eq("user_id", userId)
      .eq("status", "Accepted")
      .gte("created_at", since)
      .then(({ data }) => {
        const map: Record<string, number> = {};
        (data || []).forEach((s: any) => {
          const day = s.created_at.slice(0, 10);
          map[day] = (map[day] || 0) + 1;
        });
        setCounts(map);
      });
  }, [userId]);

  // Build 53 weeks × 7 days, ending today.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDay = today.getDay(); // 0=Sun
  const daysBack = 52 * 7 + startDay;
  const start = new Date(today.getTime() - daysBack * DAY_MS);

  const weeks: { date: string; count: number }[][] = [];
  for (let w = 0; w < 53; w++) {
    const week: { date: string; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start.getTime() + (w * 7 + d) * DAY_MS);
      if (date > today) break;
      const key = date.toISOString().slice(0, 10);
      week.push({ date: key, count: counts[key] || 0 });
    }
    weeks.push(week);
  }

  const colorFor = (n: number) => {
    if (n === 0) return "bg-muted";
    if (n === 1) return "bg-primary/30";
    if (n <= 3) return "bg-primary/60";
    if (n <= 6) return "bg-primary/80";
    return "bg-primary";
  };

  const totalSolved = Object.values(counts).reduce((a, b) => a + b, 0);
  const activeDays = Object.keys(counts).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{totalSolved}</span> submissions on{" "}
          <span className="font-bold text-foreground">{activeDays}</span> active days in the last year
        </p>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map(d => (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.count} submission${d.count === 1 ? "" : "s"}`}
                  className={`h-3 w-3 rounded-sm ${colorFor(d.count)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground justify-end">
        <span>Less</span>
        <div className="h-3 w-3 rounded-sm bg-muted" />
        <div className="h-3 w-3 rounded-sm bg-primary/30" />
        <div className="h-3 w-3 rounded-sm bg-primary/60" />
        <div className="h-3 w-3 rounded-sm bg-primary/80" />
        <div className="h-3 w-3 rounded-sm bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
}
