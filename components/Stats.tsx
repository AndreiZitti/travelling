"use client";

import type { VisitedCountriesStats } from "@/hooks/useVisitedCountries";
import { TOTAL_COUNTRIES } from "@/lib/countries";

interface StatsProps {
  stats: VisitedCountriesStats;
}

export default function Stats({ stats }: StatsProps) {
  return (
    <div className="space-y-3">
      {/* Main stat */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-indigo-600">{stats.count}</span>
        <span className="text-slate-500">/ {TOTAL_COUNTRIES} countries</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${stats.percentage}%` }}
        />
      </div>

      <div className="text-sm text-slate-500">
        {stats.percentage}% of the world explored
      </div>
    </div>
  );
}
