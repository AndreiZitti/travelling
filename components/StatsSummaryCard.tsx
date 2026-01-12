'use client';

import { motion } from 'framer-motion';

interface StatsSummaryCardProps {
  percentage: number;
  visited: number;
  total: number;
  onTap?: () => void;
}

export default function StatsSummaryCard({ percentage, visited, total, onTap }: StatsSummaryCardProps) {
  // Calculate stroke dash for circular progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.button
      onClick={onTap}
      className="w-full bg-been-card rounded-2xl p-5 text-left"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-been-text font-semibold text-lg">In Total</h3>
        {onTap && (
          <svg className="w-5 h-5 text-been-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </div>

      <div className="flex items-center justify-between">
        {/* Percentage */}
        <div className="flex flex-col items-center">
          <span className="text-4xl font-bold text-been-accent">{percentage}<span className="text-2xl">%</span></span>
          <span className="text-been-muted text-sm">World</span>
        </div>

        {/* Circular Progress */}
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#3a3a3c"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              style={{ stroke: "var(--been-accent)" }}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          </svg>
        </div>

        {/* Country count */}
        <div className="flex flex-col items-center">
          <span className="text-4xl font-bold text-been-accent">{visited}</span>
          <span className="text-been-muted text-sm">Countries</span>
        </div>
      </div>

      <p className="text-been-muted text-sm text-center mt-3">
        Out of {total} UN Countries
      </p>
    </motion.button>
  );
}
