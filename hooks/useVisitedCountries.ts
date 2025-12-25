"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES, TOTAL_COUNTRIES, CONTINENTS, type Continent } from "@/lib/countries";
import type { User } from "@supabase/supabase-js";

const STORAGE_KEY = "visited-countries";
const ONBOARDING_KEY = "has-seen-onboarding";
const SYNC_DEBOUNCE_MS = 3000;

export type SyncStatus = "idle" | "saving" | "saved" | "error";

export interface VisitedCountriesStats {
  count: number;
  percentage: number;
  byContinent: Record<Continent, { visited: number; total: number }>;
}

export function useVisitedCountries() {
  const [visitedCountries, setVisitedCountries] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [showOnboarding, setShowOnboarding] = useState(false);

  const supabase = createClient();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSyncRef = useRef<Set<string> | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Check if we should show onboarding for first-time visitors
  useEffect(() => {
    if (isLoaded) {
      const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY);
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [isLoaded]);

  const dismissOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  }, []);

  // Load visited countries from Supabase or localStorage
  useEffect(() => {
    const loadCountries = async () => {
      if (user) {
        // Load from Supabase for logged-in users (new JSONB schema)
        try {
          const { data, error } = await supabase
            .from('visited_countries')
            .select('countries')
            .eq('user_id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows found, which is fine for new users
            console.error("Failed to load from Supabase:", error);
            loadFromLocalStorage();
          } else if (data?.countries) {
            // Convert JSONB object to Set of country codes
            const countryIds = new Set(Object.keys(data.countries));
            setVisitedCountries(countryIds);
            // Also save to localStorage as cache
            localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(countryIds)));
          } else {
            // No data yet, check localStorage for migration
            loadFromLocalStorage();
          }
        } catch (e) {
          console.error("Failed to load countries:", e);
          loadFromLocalStorage();
        }
      } else {
        // Load from localStorage for non-logged-in users
        loadFromLocalStorage();
      }
      setIsLoaded(true);
    };

    const loadFromLocalStorage = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setVisitedCountries(new Set(parsed));
          }
        }
      } catch (e) {
        console.error("Failed to load from localStorage:", e);
      }
    };

    loadCountries();
  }, [user, supabase]);

  // Sync to Supabase with debounce
  const syncToSupabase = useCallback(async (countries: Set<string>) => {
    if (!user) return;

    setSyncStatus("saving");

    try {
      // Convert Set to JSONB object
      const countriesObj: Record<string, boolean> = {};
      Array.from(countries).forEach((countryId) => {
        countriesObj[countryId] = true;
      });

      const { error } = await supabase
        .from('visited_countries')
        .upsert({
          user_id: user.id,
          countries: countriesObj,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error("Failed to sync to Supabase:", error);
        setSyncStatus("error");
      } else {
        setSyncStatus("saved");
        // Reset to idle after showing "saved" briefly
        setTimeout(() => setSyncStatus("idle"), 2000);
      }
    } catch (e) {
      console.error("Supabase sync error:", e);
      setSyncStatus("error");
    }
  }, [user, supabase]);

  // Debounced sync trigger
  const scheduleSyncToSupabase = useCallback((countries: Set<string>) => {
    if (!user) return;

    // Store the latest state to sync
    pendingSyncRef.current = countries;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Schedule new sync
    debounceTimerRef.current = setTimeout(() => {
      if (pendingSyncRef.current) {
        syncToSupabase(pendingSyncRef.current);
        pendingSyncRef.current = null;
      }
    }, SYNC_DEBOUNCE_MS);
  }, [user, syncToSupabase]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        // Sync immediately on unmount if there are pending changes
        if (pendingSyncRef.current && user) {
          syncToSupabase(pendingSyncRef.current);
        }
      }
    };
  }, [user, syncToSupabase]);

  // Toggle country visited status
  const toggleCountry = useCallback((countryId: string) => {
    setVisitedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(countryId)) {
        next.delete(countryId);
      } else {
        next.add(countryId);
      }
      // Update localStorage cache immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      // Schedule debounced sync to Supabase
      scheduleSyncToSupabase(next);
      return next;
    });
  }, [scheduleSyncToSupabase]);

  const isVisited = useCallback(
    (countryId: string) => visitedCountries.has(countryId),
    [visitedCountries]
  );

  const clearAll = useCallback(() => {
    setVisitedCountries(new Set());
    localStorage.removeItem(STORAGE_KEY);
    // Schedule sync with empty set
    scheduleSyncToSupabase(new Set());
  }, [scheduleSyncToSupabase]);

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
    user,
    syncStatus,
    showOnboarding,
    dismissOnboarding,
  };
}
