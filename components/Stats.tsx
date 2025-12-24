"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { VisitedCountriesStats } from "@/hooks/useVisitedCountries";
import { CONTINENTS } from "@/lib/countries";

interface StatsProps {
  stats: VisitedCountriesStats;
  isDarkMode: boolean;
}

export default function Stats({ stats, isDarkMode }: StatsProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-md shadow-lg transition-colors ${
          isDarkMode
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-black/5 text-gray-800 hover:bg-black/10"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="font-semibold">{stats.count}</span>
        <span className="opacity-70">countries</span>
        <span className="opacity-50">•</span>
        <span className="opacity-70">{stats.percentage}%</span>
        <motion.svg
          className="w-4 h-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: showDetails ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeWidth="2" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full mt-2 left-0 right-0 p-4 rounded-xl backdrop-blur-md shadow-lg ${
              isDarkMode ? "bg-white/10 text-white" : "bg-white text-gray-800"
            }`}
          >
            <div className="space-y-2">
              {CONTINENTS.map((continent) => {
                const data = stats.byContinent[continent];
                const percentage =
                  data.total > 0
                    ? Math.round((data.visited / data.total) * 100)
                    : 0;
                return (
                  <div key={continent} className="flex items-center gap-3">
                    <span className="text-sm opacity-70 w-28">{continent}</span>
                    <div
                      className={`flex-1 h-2 rounded-full overflow-hidden ${
                        isDarkMode ? "bg-white/10" : "bg-gray-200"
                      }`}
                    >
                      <motion.div
                        className="h-full bg-globe-visited rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      />
                    </div>
                    <span className="text-xs opacity-50 w-16 text-right">
                      {data.visited}/{data.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
