"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CONTINENTS, COUNTRIES, getLocationById, type Continent } from "@/lib/locations";
import type { VisitStats } from "@/lib/types";

interface StatsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stats: VisitStats;
  darkMode?: boolean;
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

// Continent colors (light mode)
const CONTINENT_COLORS: Record<Continent, { bg: string; progress: string; text: string }> = {
  "Africa": { bg: "bg-amber-50", progress: "bg-amber-500", text: "text-amber-700" },
  "Antarctica": { bg: "bg-slate-50", progress: "bg-slate-500", text: "text-slate-700" },
  "Asia": { bg: "bg-rose-50", progress: "bg-rose-500", text: "text-rose-700" },
  "Europe": { bg: "bg-blue-50", progress: "bg-blue-500", text: "text-blue-700" },
  "North America": { bg: "bg-emerald-50", progress: "bg-emerald-500", text: "text-emerald-700" },
  "Oceania": { bg: "bg-cyan-50", progress: "bg-cyan-500", text: "text-cyan-700" },
  "South America": { bg: "bg-purple-50", progress: "bg-purple-500", text: "text-purple-700" },
};

// Continent colors (dark mode)
const CONTINENT_COLORS_DARK: Record<Continent, { bg: string; progress: string; text: string }> = {
  "Africa": { bg: "bg-amber-900/30", progress: "bg-amber-500", text: "text-amber-400" },
  "Antarctica": { bg: "bg-slate-800/50", progress: "bg-slate-400", text: "text-slate-300" },
  "Asia": { bg: "bg-rose-900/30", progress: "bg-rose-500", text: "text-rose-400" },
  "Europe": { bg: "bg-blue-900/30", progress: "bg-blue-500", text: "text-blue-400" },
  "North America": { bg: "bg-emerald-900/30", progress: "bg-emerald-500", text: "text-emerald-400" },
  "Oceania": { bg: "bg-cyan-900/30", progress: "bg-cyan-500", text: "text-cyan-400" },
  "South America": { bg: "bg-purple-900/30", progress: "bg-purple-500", text: "text-purple-400" },
};

export default function StatsDrawer({ isOpen, onClose, stats, darkMode = false }: StatsDrawerProps) {
  const colorMap = darkMode ? CONTINENT_COLORS_DARK : CONTINENT_COLORS;

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
            className={`fixed bottom-0 left-0 right-0 md:left-auto md:right-0 md:top-0 md:w-96 rounded-t-2xl md:rounded-none shadow-2xl z-50 max-h-[85vh] md:max-h-full flex flex-col ${
              darkMode ? 'bg-been-card' : 'bg-white'
            }`}
          >
            {/* Handle (mobile) */}
            <div className="md:hidden flex justify-center py-2">
              <div className={`w-12 h-1.5 rounded-full ${darkMode ? 'bg-been-bg' : 'bg-slate-200'}`} />
            </div>

            {/* Header */}
            <div className={`px-4 py-3 md:py-4 border-b flex items-center justify-between ${
              darkMode ? 'border-been-bg' : 'border-slate-200'
            }`}>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-been-text' : 'text-slate-800'}`}>Travel Statistics</h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-been-bg' : 'hover:bg-slate-100'
                }`}
              >
                <svg className={`w-5 h-5 ${darkMode ? 'text-been-muted' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-xl p-4 ${darkMode ? 'bg-been-accent/20' : 'bg-indigo-50'}`}>
                  <div className={`text-3xl font-bold ${darkMode ? 'text-been-accent' : 'text-indigo-600'}`}>{stats.visitedCountries}</div>
                  <div className={`text-sm ${darkMode ? 'text-been-accent/70' : 'text-indigo-600/70'}`}>Countries</div>
                  <div className={`text-xs mt-1 ${darkMode ? 'text-been-accent/50' : 'text-indigo-500/60'}`}>of {stats.totalCountries}</div>
                </div>
                <div className={`rounded-xl p-4 ${darkMode ? 'bg-been-bg' : 'bg-slate-50'}`}>
                  <div className={`text-3xl font-bold ${darkMode ? 'text-been-text' : 'text-slate-700'}`}>{stats.percentageCountries}%</div>
                  <div className={`text-sm ${darkMode ? 'text-been-muted' : 'text-slate-500'}`}>World explored</div>
                </div>
                {stats.visitedTerritories > 0 && (
                  <div className={`rounded-xl p-4 ${darkMode ? 'bg-teal-900/30' : 'bg-teal-50'}`}>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>{stats.visitedTerritories}</div>
                    <div className={`text-sm ${darkMode ? 'text-teal-400/70' : 'text-teal-600/70'}`}>Territories</div>
                    <div className={`text-xs mt-1 ${darkMode ? 'text-teal-400/50' : 'text-teal-500/60'}`}>of {stats.totalTerritories}</div>
                  </div>
                )}
                {stats.visitedStates > 0 && (
                  <div className={`rounded-xl p-4 ${darkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>{stats.visitedStates}</div>
                    <div className={`text-sm ${darkMode ? 'text-orange-400/70' : 'text-orange-600/70'}`}>US States</div>
                    <div className={`text-xs mt-1 ${darkMode ? 'text-orange-400/50' : 'text-orange-500/60'}`}>of {stats.totalStates}</div>
                  </div>
                )}
              </div>

              {/* Extra Stats */}
              <div className="grid grid-cols-2 gap-3">
                {stats.averageRating !== null && (
                  <div className={`rounded-xl p-3 ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                    <div className="flex items-center gap-1">
                      <span className={`text-xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        {stats.averageRating.toFixed(1)}
                      </span>
                      <span className={darkMode ? 'text-yellow-400' : 'text-yellow-500'}>{"\u2605"}</span>
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-yellow-400/70' : 'text-yellow-600/70'}`}>Avg. rating</div>
                  </div>
                )}
                {stats.totalPlacesVisited > 0 && (
                  <div className={`rounded-xl p-3 ${darkMode ? 'bg-pink-900/30' : 'bg-pink-50'}`}>
                    <div className={`text-xl font-bold ${darkMode ? 'text-pink-400' : 'text-pink-600'}`}>{stats.totalPlacesVisited}</div>
                    <div className={`text-xs ${darkMode ? 'text-pink-400/70' : 'text-pink-600/70'}`}>Places visited</div>
                  </div>
                )}
              </div>

              {/* Continent Breakdown */}
              <div>
                <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-been-text' : 'text-slate-700'}`}>By Continent</h3>
                <div className="space-y-3">
                  {CONTINENTS.map((continent) => {
                    const continentStats = stats.byContinent[continent];
                    const colors = colorMap[continent];

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
                        <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-black/30' : 'bg-white/50'}`}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${continentStats.percentage}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className={`h-full ${colors.progress} rounded-full`}
                          />
                        </div>

                        <div className={`text-xs mt-1 ${darkMode ? 'text-been-muted' : 'text-slate-500'}`}>
                          {continentStats.percentage}% explored
                        </div>

                        {/* Visited countries in this continent */}
                        {continentStats.locations.length > 0 && (
                          <div className={`mt-2 pt-2 border-t ${darkMode ? 'border-black/20' : 'border-white/50'}`}>
                            <div className="flex flex-wrap gap-1">
                              {continentStats.locations.slice(0, 5).map((locId) => {
                                const loc = getLocationById(locId);
                                return (
                                  <span
                                    key={locId}
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                                      darkMode ? 'bg-black/30 text-been-text' : 'bg-white/70 text-slate-600'
                                    }`}
                                  >
                                    {loc?.name}
                                  </span>
                                );
                              })}
                              {continentStats.locations.length > 5 && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                                  darkMode ? 'bg-black/20 text-been-muted' : 'bg-white/50 text-slate-500'
                                }`}>
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
                  <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-been-text' : 'text-slate-700'}`}>Highlights</h3>
                  <div className="space-y-2">
                    {stats.mostVisitedContinent && (
                      <div className={`flex items-center justify-between py-2 border-b ${darkMode ? 'border-been-bg' : 'border-slate-100'}`}>
                        <span className={`text-sm ${darkMode ? 'text-been-muted' : 'text-slate-500'}`}>Most explored</span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-been-text' : 'text-slate-700'}`}>
                          {CONTINENT_EMOJI[stats.mostVisitedContinent]} {stats.mostVisitedContinent}
                        </span>
                      </div>
                    )}
                    {stats.leastVisitedContinent && stats.byContinent[stats.leastVisitedContinent].visited > 0 && (
                      <div className={`flex items-center justify-between py-2 border-b ${darkMode ? 'border-been-bg' : 'border-slate-100'}`}>
                        <span className={`text-sm ${darkMode ? 'text-been-muted' : 'text-slate-500'}`}>Least explored</span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-been-text' : 'text-slate-700'}`}>
                          {CONTINENT_EMOJI[stats.leastVisitedContinent]} {stats.leastVisitedContinent}
                        </span>
                      </div>
                    )}
                    {stats.firstVisit && (
                      <div className={`flex items-center justify-between py-2 border-b ${darkMode ? 'border-been-bg' : 'border-slate-100'}`}>
                        <span className={`text-sm ${darkMode ? 'text-been-muted' : 'text-slate-500'}`}>First tracked</span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-been-text' : 'text-slate-700'}`}>
                          {getLocationById(stats.firstVisit.locationId)?.name}
                        </span>
                      </div>
                    )}
                    {stats.mostRecentVisit && (
                      <div className="flex items-center justify-between py-2">
                        <span className={`text-sm ${darkMode ? 'text-been-muted' : 'text-slate-500'}`}>Most recent</span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-been-text' : 'text-slate-700'}`}>
                          {getLocationById(stats.mostRecentVisit.locationId)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Countries to go */}
              <div>
                <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-been-text' : 'text-slate-700'}`}>Countries to Go</h3>
                <div className="grid grid-cols-2 gap-2">
                  {CONTINENTS.map((continent) => {
                    const remaining = stats.byContinent[continent].total - stats.byContinent[continent].visited;
                    if (remaining === 0) return null;

                    return (
                      <div
                        key={continent}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                          darkMode ? 'bg-been-bg' : 'bg-slate-50'
                        }`}
                      >
                        <span className={`text-xs ${darkMode ? 'text-been-muted' : 'text-slate-500'}`}>{continent}</span>
                        <span className={`text-sm font-semibold ${darkMode ? 'text-been-text' : 'text-slate-700'}`}>{remaining}</span>
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
