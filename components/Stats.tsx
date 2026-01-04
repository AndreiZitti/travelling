"use client";

import { TOTAL_COUNTRIES } from "@/lib/locations";

interface LegacyStats {
  count: number;
  percentage: number;
  byContinent?: Record<string, { visited: number; total: number }>;
}

interface StatsProps {
  stats: LegacyStats;
  onViewDetails?: () => void;
}

export default function Stats({ stats, onViewDetails }: StatsProps) {
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

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {stats.percentage}% of the world explored
        </span>

        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
          >
            View Details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
