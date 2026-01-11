'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { VisitStats } from '@/lib/types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: VisitStats;
}

const continentOrder = [
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'Oceania',
  'South America',
  'Antarctica',
] as const;

export default function StatsModal({ isOpen, onClose, stats }: StatsModalProps) {
  // Calculate stroke dash for circular progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.percentageCountries / 100) * circumference;

  // Count visited continents
  const visitedContinents = continentOrder.filter(
    continent => stats.byContinent[continent]?.visited > 0
  ).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-been-bg"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-been-card">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-been-card flex items-center justify-center">
                <svg className="w-5 h-5 text-been-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-been-text font-semibold text-lg">Statistics</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-been-card transition-colors"
            >
              <svg className="w-6 h-6 text-been-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto h-[calc(100%-60px)] dark-scroll">
            <div className="p-4 space-y-4">
              {/* In Total Card */}
              <div className="bg-been-card rounded-2xl p-5">
                <h3 className="text-been-text font-semibold text-lg mb-4">In Total</h3>

                <div className="flex items-center justify-between">
                  {/* Percentage */}
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-bold text-been-accent">
                      {stats.percentageCountries}<span className="text-2xl">%</span>
                    </span>
                    <span className="text-been-muted text-sm">World</span>
                  </div>

                  {/* Circular Progress */}
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="#3a3a3c"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="#F5A623"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                      />
                    </svg>
                  </div>

                  {/* Country count */}
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-bold text-been-accent">{stats.visitedCountries}</span>
                    <span className="text-been-muted text-sm">Countries</span>
                  </div>
                </div>

                <p className="text-been-muted text-sm text-center mt-3">
                  Out of {stats.totalCountries} UN Countries
                </p>
              </div>

              {/* Continents Card */}
              <div className="bg-been-card rounded-2xl p-5">
                <h3 className="text-been-text font-semibold text-lg mb-2">Continents</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-been-accent">{visitedContinents}</span>
                  <span className="text-3xl text-been-muted">/ 7</span>
                </div>
                <p className="text-been-muted text-sm text-center mt-2">
                  Including Antarctica
                </p>
              </div>

              {/* Countries Card */}
              <div className="bg-been-card rounded-2xl p-5">
                <h3 className="text-been-text font-semibold text-lg mb-2">Countries</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-been-accent">{stats.visitedCountries}</span>
                  <span className="text-3xl text-been-muted">/ {stats.totalCountries}</span>
                </div>
                <p className="text-been-muted text-sm text-center mt-2">
                  Countries recognized by the UN
                </p>
              </div>

              {/* Per-Continent Cards */}
              {continentOrder.map((continent) => {
                const continentStats = stats.byContinent[continent];
                if (!continentStats) return null;

                const isAntarctica = continent === 'Antarctica';

                return (
                  <div key={continent} className="bg-been-card rounded-2xl p-5">
                    <h3 className="text-been-text font-semibold text-lg mb-2">{continent}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-been-accent">
                        {continentStats.visited}
                      </span>
                      <span className="text-3xl text-been-muted">/ {continentStats.total}</span>
                    </div>
                    <p className="text-been-muted text-sm text-center mt-2">
                      {isAntarctica ? 'All territories' : 'Countries recognized by the UN'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
