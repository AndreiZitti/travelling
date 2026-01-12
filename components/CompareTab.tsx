'use client';

import { QRCodeSVG } from 'qrcode.react';
import type { VisitStats } from '@/lib/types';

interface CompareTabProps {
  visitedCountries: Set<string>;
  stats: VisitStats;
  className?: string;
}

export default function CompareTab({ visitedCountries, stats, className = '' }: CompareTabProps) {
  return (
    <div className={`bg-been-bg p-6 pb-8 overflow-y-auto dark-scroll ${className}`}>
      <h1 className="text-2xl font-bold text-been-text mb-6">Share & Compare</h1>

      {/* QR Code Section */}
      <div className="bg-been-card rounded-2xl p-6 flex flex-col items-center">
        <h2 className="text-lg font-semibold text-been-text mb-2">Your Travel QR Code</h2>
        <p className="text-been-muted text-sm text-center mb-4">
          Share this code with friends to compare travels
        </p>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-xl mb-4">
          <QRCodeSVG
            value={Array.from(visitedCountries).sort().join(",") || "empty"}
            size={200}
            level="M"
            includeMargin={false}
          />
        </div>

        {/* Stats below QR */}
        <div className="text-center">
          <p className="text-been-accent text-2xl font-bold">{stats.visitedCountries}</p>
          <p className="text-been-muted text-sm">countries encoded</p>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-4 bg-been-card rounded-2xl p-4">
        <h3 className="text-been-text font-medium mb-2">How it works</h3>
        <ul className="text-been-muted text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-been-accent">1.</span>
            <span>Screenshot or share your QR code</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-been-accent">2.</span>
            <span>Friends scan to see your visited countries</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-been-accent">3.</span>
            <span>Compare who&apos;s been to more places!</span>
          </li>
        </ul>
      </div>

      {/* Scan Section - Coming Soon */}
      <div className="mt-4 bg-been-card rounded-2xl p-4 opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-been-bg flex items-center justify-center">
            <svg className="w-5 h-5 text-been-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="7" y="7" width="10" height="10" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-been-text font-medium">Scan a friend&apos;s code</p>
            <p className="text-been-muted text-sm">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
