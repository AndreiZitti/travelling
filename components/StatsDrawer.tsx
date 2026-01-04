"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CONTINENTS, COUNTRIES, getLocationById, type Continent } from "@/lib/locations";
import type { VisitStats } from "@/lib/types";

interface StatsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stats: VisitStats;
}

// Continent emoji mapping
const CONTINENT_EMOJI: Record<Continent, string> = {
  "Africa": "\uD83C\uDF0D",
  "Antarctica": "\u2744\uFE0F",
  "Asia": "\uD83C\uDF0F",
  "Europe": "\uD83C\uDF0D",
  "North America": "\uD83C\uDF0E",
  "Oceania": "\uD83C\uDF0F",
  "South America": "\uD83C\uDF0E",
};

// Continent colors
const CONTINENT_COLORS: Record<Continent, { bg: string; progress: string; text: string }> = {
  "Africa": { bg: "bg-amber-50", progress: "bg-amber-500", text: "text-amber-700" },
  "Antarctica": { bg: "bg-slate-50", progress: "bg-slate-500", text: "text-slate-700" },
  "Asia": { bg: "bg-rose-50", progress: "bg-rose-500", text: "text-rose-700" },
  "Europe": { bg: "bg-blue-50", progress: "bg-blue-500", text: "text-blue-700" },
  "North America": { bg: "bg-emerald-50", progress: "bg-emerald-500", text: "text-emerald-700" },
  "Oceania": { bg: "bg-cyan-50", progress: "bg-cyan-500", text: "text-cyan-700" },
  "South America": { bg: "bg-purple-50", progress: "bg-purple-500", text: "text-purple-700" },
};

export default function StatsDrawer({ isOpen, onClose, stats }: StatsDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:left-auto md:right-0 md:top-0 md:w-96 bg-white rounded-t-2xl md:rounded-none shadow-2xl z-50 max-h-[85vh] md:max-h-full flex flex-col"
          >
            {/* Handle (mobile) */}
            <div className="md:hidden flex justify-center py-2">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 py-3 md:py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Travel Statistics</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-50 rounded-xl p-4">
                  <div className="text-3xl font-bold text-indigo-600">{stats.visitedCountries}</div>
                  <div className="text-sm text-indigo-600/70">Countries</div>
                  <div className="text-xs text-indigo-500/60 mt-1">of {stats.totalCountries}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-3xl font-bold text-slate-700">{stats.percentageCountries}%</div>
                  <div className="text-sm text-slate-500">World explored</div>
                </div>
                {stats.visitedTerritories > 0 && (
                  <div className="bg-teal-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-teal-600">{stats.visitedTerritories}</div>
                    <div className="text-sm text-teal-600/70">Territories</div>
                    <div className="text-xs text-teal-500/60 mt-1">of {stats.totalTerritories}</div>
                  </div>
                )}
                {stats.visitedStates > 0 && (
                  <div className="bg-orange-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-orange-600">{stats.visitedStates}</div>
                    <div className="text-sm text-orange-600/70">US States</div>
                    <div className="text-xs text-orange-500/60 mt-1">of {stats.totalStates}</div>
                  </div>
                )}
              </div>

              {/* Extra Stats */}
              <div className="grid grid-cols-2 gap-3">
                {stats.averageRating !== null && (
                  <div className="bg-yellow-50 rounded-xl p-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-bold text-yellow-600">
                        {stats.averageRating.toFixed(1)}
                      </span>
                      <span className="text-yellow-500">{"\u2605"}</span>
                    </div>
                    <div className="text-xs text-yellow-600/70">Avg. rating</div>
                  </div>
                )}
                {stats.totalPlacesVisited > 0 && (
                  <div className="bg-pink-50 rounded-xl p-3">
                    <div className="text-xl font-bold text-pink-600">{stats.totalPlacesVisited}</div>
                    <div className="text-xs text-pink-600/70">Places visited</div>
                  </div>
                )}
              </div>

              {/* Continent Breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">By Continent</h3>
                <div className="space-y-3">
                  {CONTINENTS.map((continent) => {
                    const continentStats = stats.byContinent[continent];
                    const colors = CONTINENT_COLORS[continent];

                    return (
                      <div
                        key={continent}
                        className={`${colors.bg} rounded-xl p-3`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span>{CONTINENT_EMOJI[continent]}</span>
                            <span className={`font-medium ${colors.text}`}>{continent}</span>
                          </div>
                          <span className={`text-sm font-semibold ${colors.text}`}>
                            {continentStats.visited}/{continentStats.total}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${continentStats.percentage}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className={`h-full ${colors.progress} rounded-full`}
                          />
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          {continentStats.percentage}% explored
                        </div>

                        {/* Visited countries in this continent */}
                        {continentStats.locations.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/50">
                            <div className="flex flex-wrap gap-1">
                              {continentStats.locations.slice(0, 5).map((locId) => {
                                const loc = getLocationById(locId);
                                return (
                                  <span
                                    key={locId}
                                    className="inline-flex items-center px-2 py-0.5 bg-white/70 rounded-full text-xs text-slate-600"
                                  >
                                    {loc?.name}
                                  </span>
                                );
                              })}
                              {continentStats.locations.length > 5 && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-white/50 rounded-full text-xs text-slate-500">
                                  +{continentStats.locations.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Highlights */}
              {(stats.mostVisitedContinent || stats.firstVisit) && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Highlights</h3>
                  <div className="space-y-2">
                    {stats.mostVisitedContinent && (
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Most explored</span>
                        <span className="text-sm font-medium text-slate-700">
                          {CONTINENT_EMOJI[stats.mostVisitedContinent]} {stats.mostVisitedContinent}
                        </span>
                      </div>
                    )}
                    {stats.leastVisitedContinent && stats.byContinent[stats.leastVisitedContinent].visited > 0 && (
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Least explored</span>
                        <span className="text-sm font-medium text-slate-700">
                          {CONTINENT_EMOJI[stats.leastVisitedContinent]} {stats.leastVisitedContinent}
                        </span>
                      </div>
                    )}
                    {stats.firstVisit && (
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">First tracked</span>
                        <span className="text-sm font-medium text-slate-700">
                          {getLocationById(stats.firstVisit.locationId)?.name}
                        </span>
                      </div>
                    )}
                    {stats.mostRecentVisit && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-slate-500">Most recent</span>
                        <span className="text-sm font-medium text-slate-700">
                          {getLocationById(stats.mostRecentVisit.locationId)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Countries to go */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Countries to Go</h3>
                <div className="grid grid-cols-2 gap-2">
                  {CONTINENTS.map((continent) => {
                    const remaining = stats.byContinent[continent].total - stats.byContinent[continent].visited;
                    if (remaining === 0) return null;

                    return (
                      <div
                        key={continent}
                        className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"
                      >
                        <span className="text-xs text-slate-500">{continent}</span>
                        <span className="text-sm font-semibold text-slate-700">{remaining}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
