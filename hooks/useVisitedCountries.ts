"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { COUNTRIES, TOTAL_COUNTRIES, CONTINENTS, type Continent } from "@/lib/countries";

const STORAGE_KEY = "visited-countries";

export interface VisitedCountriesStats {
  count: number;
  percentage: number;
  byContinent: Record<Continent, { visited: number; total: number }>;
}

export function useVisitedCountries() {
  const [visitedCountries, setVisitedCountries] = useState<Set<string>>(
    new Set()
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setVisitedCountries(new Set(parsed));
        }
      }
    } catch (e) {
      console.error("Failed to load visited countries:", e);
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(Array.from(visitedCountries))
        );
      } catch (e) {
        console.error("Failed to save visited countries:", e);
      }
    }
  }, [visitedCountries, isLoaded]);

  const toggleCountry = useCallback((countryId: string) => {
    setVisitedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(countryId)) {
        next.delete(countryId);
      } else {
        next.add(countryId);
      }
      return next;
    });
  }, []);

  const isVisited = useCallback(
    (countryId: string) => visitedCountries.has(countryId),
    [visitedCountries]
  );

  const clearAll = useCallback(() => {
    setVisitedCountries(new Set());
  }, []);

  const stats: VisitedCountriesStats = useMemo(() => {
    const count = visitedCountries.size;
    const percentage = Math.round((count / TOTAL_COUNTRIES) * 100);

    const byContinent = {} as Record<Continent, { visited: number; total: number }>;

    for (const continent of CONTINENTS) {
      const countriesInContinent = COUNTRIES.filter(
        (c) => c.continent === continent
      );
      const visitedInContinent = countriesInContinent.filter((c) =>
        visitedCountries.has(c.id)
      );
      byContinent[continent] = {
        visited: visitedInContinent.length,
        total: countriesInContinent.length,
      };
    }

    return { count, percentage, byContinent };
  }, [visitedCountries]);

  return {
    visitedCountries,
    toggleCountry,
    isVisited,
    clearAll,
    stats,
    isLoaded,
  };
}
