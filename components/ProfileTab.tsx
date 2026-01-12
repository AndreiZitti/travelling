'use client';

import type { User } from '@supabase/supabase-js';
import type { VisitStats, SyncStatus as SyncStatusType } from '@/lib/types';
import SyncStatus from './SyncStatus';

interface ProfileTabProps {
  user: User | null;
  stats: VisitStats;
  syncStatus: SyncStatusType;
  onViewDetails: () => void;
  className?: string;
}

export default function ProfileTab({ user, stats, syncStatus, onViewDetails, className = '' }: ProfileTabProps) {
  return (
    <div className={`bg-been-bg p-4 space-y-4 overflow-y-auto dark-scroll ${className}`}>
      <h1 className="text-2xl font-bold text-been-text mb-6">Profile</h1>

      {/* User Info */}
      <div className="bg-been-card rounded-2xl p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-been-accent flex items-center justify-center">
          <span className="text-xl font-bold text-been-bg">
            {user?.email?.[0]?.toUpperCase() || "?"}
          </span>
        </div>
        <div>
          <p className="text-been-text font-medium">{user?.email || "Guest"}</p>
          <p className="text-been-muted text-sm">
            {stats.visitedCountries} countries visited
          </p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-been-card rounded-2xl overflow-hidden">
        <button
          onClick={onViewDetails}
          className="w-full p-4 flex items-center justify-between border-b border-been-bg/50"
        >
          <span className="text-been-text">View Detailed Stats</span>
          <svg className="w-5 h-5 text-been-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <a
          href="/settings"
          className="w-full p-4 flex items-center justify-between block"
        >
          <span className="text-been-text">Settings</span>
          <svg className="w-5 h-5 text-been-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* Sync Status */}
      <div className="bg-been-card rounded-2xl p-4 flex items-center justify-between">
        <span className="text-been-text">Sync Status</span>
        <SyncStatus status={syncStatus} />
      </div>
    </div>
  );
}
