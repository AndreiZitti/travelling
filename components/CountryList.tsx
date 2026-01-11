"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import {
  COUNTRIES,
  CONTINENTS,
  getTerritoriesForCountry,
  getStatesForCountry,
  hasChildren,
  type Continent,
  type Location,
} from "@/lib/locations";
import type { Visit } from "@/lib/types";

interface CountryListProps {
  visitedCountries: Set<string>;
  onToggleCountry: (countryId: string) => void;
  isVisited: (countryId: string) => boolean;
  onCountryLongPress?: (countryId: string) => void;
  visits?: Map<string, Visit>;
  darkMode?: boolean;
  isWishlist?: boolean;
}

export default function CountryList({
  onToggleCountry,
  isVisited,
  onCountryLongPress,
  visits,
  darkMode = false,
  isWishlist = false,
}: CountryListProps) {
  const [search, setSearch] = useState("");
  const [selectedContinent, setSelectedContinent] = useState<Continent | "all">("all");
  const [expandedContinents, setExpandedContinents] = useState<Set<string>>(new Set(CONTINENTS));
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());

  const toggleContinent = (continent: string) => {
    setExpandedContinents((prev) => {
      const next = new Set(prev);
      if (next.has(continent)) {
        next.delete(continent);
      } else {
        next.add(continent);
      }
      return next;
    });
  };

  const toggleCountryExpand = (countryId: string) => {
    setExpandedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(countryId)) {
        next.delete(countryId);
      } else {
        next.add(countryId);
      }
      return next;
    });
  };

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter((country) => {
      const matchesSearch = country.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesContinent =
        selectedContinent === "all" || country.continent === selectedContinent;
      return matchesSearch && matchesContinent;
    });
  }, [search, selectedContinent]);

  const groupedCountries = useMemo(() => {
    const groups: Record<string, typeof filteredCountries> = {};
    for (const country of filteredCountries) {
      if (!groups[country.continent]) {
        groups[country.continent] = [];
      }
      groups[country.continent].push(country);
    }
    return groups;
  }, [filteredCountries]);

  // Long press handling for mobile
  const handleLongPress = (countryId: string) => {
    if (onCountryLongPress && isVisited(countryId)) {
      onCountryLongPress(countryId);
    }
  };

  // Get visit rating for display
  const getVisitRating = (locationId: string): number | undefined => {
    return visits?.get(locationId)?.rating;
  };

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-been-bg' : ''}`}>
      {/* Search */}
      <div className={`p-3 border-b ${darkMode ? 'border-been-card' : 'border-slate-200'}`}>
        <input
          type="text"
          placeholder="Search countries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 ${
            darkMode
              ? 'bg-been-card border-been-card text-been-text placeholder-been-muted focus:ring-been-accent'
              : 'bg-slate-50 border border-slate-200 focus:ring-indigo-500 focus:border-transparent'
          }`}
        />
      </div>

      {/* Filters */}
      <div className={`p-3 border-b ${darkMode ? 'border-been-card' : 'border-slate-200'}`}>
        <select
          value={selectedContinent}
          onChange={(e) => setSelectedContinent(e.target.value as Continent | "all")}
          className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 ${
            darkMode
              ? 'bg-been-card border-been-card text-been-text focus:ring-been-accent'
              : 'bg-slate-50 border border-slate-200 focus:ring-indigo-500'
          }`}
        >
          <option value="all">All continents</option>
          {CONTINENTS.map((continent) => (
            <option key={continent} value={continent}>
              {continent}
            </option>
          ))}
        </select>
      </div>

      {/* Country list */}
      <div className={`flex-1 overflow-y-auto ${darkMode ? 'dark-scroll' : ''}`}>
        {Object.entries(groupedCountries).map(([continent, countries]) => {
          const isExpanded = expandedContinents.has(continent);
          const visitedCount = countries.filter((c) => isVisited(c.id)).length;

          return (
            <div key={continent}>
              <button
                onClick={() => toggleContinent(continent)}
                className={`sticky top-0 w-full px-3 py-2 flex items-center justify-between transition-colors ${
                  darkMode
                    ? 'bg-been-card border-b border-been-bg hover:bg-been-card/80'
                    : 'bg-slate-50 border-b border-slate-100 hover:bg-slate-100'
                }`}
              >
                <span className={`text-xs font-semibold uppercase tracking-wide ${
                  darkMode ? 'text-been-muted' : 'text-slate-500'
                }`}>
                  {continent} ({visitedCount}/{countries.length})
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""} ${
                    darkMode ? 'text-been-muted' : 'text-slate-400'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isExpanded && countries.map((country) => (
                <CountryRow
                  key={country.id}
                  country={country}
                  visited={isVisited(country.id)}
                  rating={getVisitRating(country.id)}
                  isExpanded={expandedCountries.has(country.id)}
                  onToggle={() => onToggleCountry(country.id)}
                  onToggleExpand={() => toggleCountryExpand(country.id)}
                  onLongPress={() => handleLongPress(country.id)}
                  isVisited={isVisited}
                  onToggleChild={onToggleCountry}
                  onChildLongPress={onCountryLongPress}
                  getChildRating={getVisitRating}
                  darkMode={darkMode}
                  isWishlist={isWishlist}
                />
              ))}
            </div>
          );
        })}

        {filteredCountries.length === 0 && (
          <div className={`p-4 text-center text-sm ${darkMode ? 'text-been-muted' : 'text-slate-400'}`}>
            No countries found
          </div>
        )}
      </div>
    </div>
  );
}

// Separate component for country row with expandable children
interface CountryRowProps {
  country: Location;
  visited: boolean;
  rating?: number;
  isExpanded: boolean;
  onToggle: () => void;
  onToggleExpand: () => void;
  onLongPress: () => void;
  isVisited: (id: string) => boolean;
  onToggleChild: (id: string) => void;
  onChildLongPress?: (id: string) => void;
  getChildRating: (id: string) => number | undefined;
  darkMode?: boolean;
  isWishlist?: boolean;
}

function CountryRow({
  country,
  visited,
  rating,
  isExpanded,
  onToggle,
  onToggleExpand,
  onLongPress,
  isVisited,
  onToggleChild,
  onChildLongPress,
  getChildRating,
  darkMode = false,
  isWishlist = false,
}: CountryRowProps) {
  const territories = getTerritoriesForCountry(country.id);
  const states = country.id === "US" ? getStatesForCountry(country.id) : [];
  const children = [...territories, ...states];
  const hasChildLocations = children.length > 0;

  // Count visited children
  const visitedChildCount = children.filter(c => isVisited(c.id)).length;

  // Use refs for long press handling to persist across renders
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressFiredRef = useRef(false);

  const handlePointerDown = useCallback(() => {
    // Only enable long press for visited countries
    if (!visited) return;

    longPressFiredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      onLongPress();
    }, 500);
  }, [visited, onLongPress]);

  const handlePointerUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    // Don't toggle if long press was fired
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    onToggle();
  }, [onToggle]);

  return (
    <div>
      <div
        className={`w-full px-3 py-2 flex items-center gap-3 transition-colors ${
          darkMode
            ? visited ? (isWishlist ? "bg-blue-500/10 hover:bg-blue-500/20" : "bg-been-accent/10 hover:bg-been-accent/20") : "hover:bg-been-card"
            : visited ? "bg-indigo-50 hover:bg-slate-50" : "hover:bg-slate-50"
        }`}
      >
        {/* Expand button for countries with children */}
        {hasChildLocations ? (
          <button
            onClick={onToggleExpand}
            className={`w-5 h-5 flex items-center justify-center ${
              darkMode ? 'text-been-muted hover:text-been-text' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Main toggle button */}
        <button
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex-1 flex items-center gap-3 text-left"
        >
          <span
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              darkMode
                ? visited ? (isWishlist ? "bg-blue-500 border-blue-500" : "bg-been-accent border-been-accent") : "border-been-muted"
                : visited ? "bg-indigo-500 border-indigo-500" : "border-slate-300"
            }`}
          >
            {visited && (
              <svg
                className={`w-3 h-3 ${darkMode ? 'text-been-bg' : 'text-white'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </span>
          <span
            className={`text-sm flex-1 ${
              darkMode
                ? visited ? (isWishlist ? "text-blue-500 font-medium" : "text-been-accent font-medium") : "text-been-text"
                : visited ? "text-indigo-700 font-medium" : "text-slate-700"
            }`}
          >
            {country.name}
          </span>

          {/* Rating stars */}
          {visited && rating && (
            <span className="text-yellow-500 text-xs">
              {"\u2605".repeat(rating)}
            </span>
          )}

          {/* Child count badge */}
          {hasChildLocations && visitedChildCount > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              darkMode
                ? isWishlist ? 'bg-blue-500/20 text-blue-500' : 'bg-been-accent/20 text-been-accent'
                : 'bg-indigo-100 text-indigo-600'
            }`}>
              {visitedChildCount}/{children.length}
            </span>
          )}
        </button>
      </div>

      {/* Children (territories/states) */}
      {isExpanded && hasChildLocations && (
        <div className={darkMode ? 'bg-been-card/30' : 'bg-slate-50/50'}>
          {children.map((child) => (
            <ChildLocationRow
              key={child.id}
              child={child}
              isVisited={isVisited(child.id)}
              rating={getChildRating(child.id)}
              onToggle={() => onToggleChild(child.id)}
              onLongPress={onChildLongPress ? () => onChildLongPress(child.id) : undefined}
              darkMode={darkMode}
              isWishlist={isWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Separate component for child rows to properly handle refs
interface ChildLocationRowProps {
  child: Location;
  isVisited: boolean;
  rating?: number;
  onToggle: () => void;
  onLongPress?: () => void;
  darkMode?: boolean;
  isWishlist?: boolean;
}

function ChildLocationRow({
  child,
  isVisited,
  rating,
  onToggle,
  onLongPress,
  darkMode = false,
  isWishlist = false,
}: ChildLocationRowProps) {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressFiredRef = useRef(false);

  const handlePointerDown = useCallback(() => {
    if (!isVisited || !onLongPress) return;

    longPressFiredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      onLongPress();
    }, 500);
  }, [isVisited, onLongPress]);

  const handlePointerUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    onToggle();
  }, [onToggle]);

  return (
    <button
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`w-full pl-12 pr-3 py-2 flex items-center gap-3 transition-colors text-left ${
        darkMode
          ? isVisited ? (isWishlist ? "bg-blue-500/5 hover:bg-blue-500/10" : "bg-been-accent/5 hover:bg-been-accent/10") : "hover:bg-been-card/50"
          : isVisited ? "bg-indigo-50/50 hover:bg-slate-100" : "hover:bg-slate-100"
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
          darkMode
            ? isVisited ? (isWishlist ? "bg-blue-500/80 border-blue-500/80" : "bg-been-accent/80 border-been-accent/80") : "border-been-muted"
            : isVisited ? "bg-indigo-400 border-indigo-400" : "border-slate-300"
        }`}
      >
        {isVisited && (
          <svg
            className={`w-2.5 h-2.5 ${darkMode ? 'text-been-bg' : 'text-white'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </span>
      <span
        className={`text-xs flex-1 ${
          darkMode
            ? isVisited ? (isWishlist ? "text-blue-500 font-medium" : "text-been-accent font-medium") : "text-been-text"
            : isVisited ? "text-indigo-600 font-medium" : "text-slate-600"
        }`}
      >
        {child.name}
        {child.type === "territory" && (
          <span className={darkMode ? "ml-1 text-been-muted" : "ml-1 text-slate-400"}>(territory)</span>
        )}
        {child.type === "state" && (
          <span className={darkMode ? "ml-1 text-been-muted" : "ml-1 text-slate-400"}>(state)</span>
        )}
      </span>

      {/* Rating */}
      {isVisited && rating && (
        <span className="text-yellow-400 text-xs">
          {"\u2605".repeat(rating)}
        </span>
      )}
    </button>
  );
}
