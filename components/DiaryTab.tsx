'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getLocationById } from '@/lib/locations';
import type { Visit } from '@/lib/types';

interface DiaryTabProps {
  visits: Map<string, Visit>;
  onEntryTap: (locationId: string) => void;
  isWishlist?: boolean;
}

export default function DiaryTab({ visits, onEntryTap, isWishlist = false }: DiaryTabProps) {
  // Sort visits by most recent first
  const sortedVisits = useMemo(() => {
    return Array.from(visits.values())
      .sort((a, b) => {
        // Sort by most recent visit date, or createdAt if no dates
        const aDate = a.visitDates?.[0]?.startDate || a.createdAt;
        const bDate = b.visitDates?.[0]?.startDate || b.createdAt;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });
  }, [visits]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  // Get country flag emoji from country code
  const getFlagEmoji = (countryCode: string) => {
    // Handle special cases
    if (countryCode.includes('-')) {
      // US states, etc - use parent country
      countryCode = countryCode.split('-')[0];
    }
    // Convert country code to flag emoji
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  if (sortedVisits.length === 0) {
    return (
      <div className="h-full bg-been-bg flex flex-col items-center justify-center p-8">
        <div className={`w-20 h-20 rounded-full bg-been-card flex items-center justify-center mb-4`}>
          {isWishlist ? (
            <svg className="w-10 h-10 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg className="w-10 h-10 text-been-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <h2 className="text-xl font-bold text-been-text mb-2">
          {isWishlist ? "Your Wishlist" : "Your Diary"}
        </h2>
        <p className="text-been-muted text-center">
          {isWishlist
            ? "Add countries you want to visit to see them here!"
            : "Start adding countries to see your travel diary here!"}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-been-bg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-been-card">
        <h1 className={`text-2xl font-bold ${isWishlist ? "text-blue-500" : "text-been-text"}`}>
          {isWishlist ? "Wishlist" : "Diary"}
        </h1>
        <p className="text-been-muted text-sm mt-1">
          {sortedVisits.length} {sortedVisits.length === 1 ? (isWishlist ? "destination" : "entry") : (isWishlist ? "destinations" : "entries")}
        </p>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto dark-scroll p-4 space-y-3">
        {sortedVisits.map((visit) => {
          const location = getLocationById(visit.locationId);
          if (!location) return null;

          const hasDetails = visit.notes || visit.rating || visit.visitDates.length > 0 || visit.photos.length > 0;

          return (
            <motion.button
              key={visit.id}
              onClick={() => onEntryTap(visit.locationId)}
              className="w-full bg-been-card rounded-2xl p-4 text-left"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                {/* Flag */}
                <div className="text-3xl">
                  {getFlagEmoji(location.countryCode || location.id)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-been-text font-semibold truncate">{location.name}</h3>
                    {visit.rating && (
                      <span className="text-yellow-500 text-sm ml-2">
                        {'★'.repeat(visit.rating)}
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  {visit.visitDates.length > 0 && (
                    <p className="text-been-muted text-sm mt-0.5">
                      {formatDate(visit.visitDates[0].startDate)}
                      {visit.visitDates.length > 1 && ` + ${visit.visitDates.length - 1} more`}
                    </p>
                  )}

                  {/* Notes preview */}
                  {visit.notes && (
                    <p className="text-been-muted text-sm mt-2 line-clamp-2">
                      {visit.notes}
                    </p>
                  )}

                  {/* Places visited */}
                  {visit.placesVisited.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {visit.placesVisited.slice(0, 3).map((place, i) => (
                        <span
                          key={i}
                          className="text-xs bg-been-accent/20 text-been-accent px-2 py-0.5 rounded-full"
                        >
                          {place.name}
                        </span>
                      ))}
                      {visit.placesVisited.length > 3 && (
                        <span className="text-xs text-been-muted">
                          +{visit.placesVisited.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Photos indicator */}
                  {visit.photos.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-been-muted">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs">{visit.photos.length} photo{visit.photos.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {/* Empty state hint */}
                  {!hasDetails && (
                    <p className="text-been-muted/50 text-sm mt-1 italic">
                      Tap to add details...
                    </p>
                  )}
                </div>

                {/* Chevron */}
                <svg className="w-5 h-5 text-been-muted flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
