"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  COUNTRIES,
  TERRITORIES,
  US_STATES,
  ALL_LOCATIONS,
  CONTINENTS,
  getChildLocations,
  type Continent,
  type Location,
} from "@/lib/locations";
import type {
  Visit,
  VisitInput,
  VisitRow,
  VisitStats,
  ContinentStats,
  SyncStatus,
} from "@/lib/types";
import { rowToVisit, visitToRow } from "@/lib/types";
import { deleteAllPhotosForLocation } from "@/lib/supabase/storage";
import type { User } from "@supabase/supabase-js";

const STORAGE_KEY = "visits-cache";
const ONBOARDING_KEY = "has-seen-onboarding";
const SYNC_DEBOUNCE_MS = 1500;

export function useVisits() {
  const [visits, setVisits] = useState<Map<string, Visit>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Memoize the Supabase client to prevent recreation on every render
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSyncRef = useRef<{ action: "upsert" | "delete"; visit: Partial<Visit> & { locationId: string } } | null>(null);

  // Track current user ID to prevent unnecessary state updates
  const currentUserIdRef = useRef<string | null>(null);
  const authInitializedRef = useRef(false);
  const visitsLoadedForUserRef = useRef<string | null>(null);

  // Get current user
  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (authInitializedRef.current) return;
    authInitializedRef.current = true;

    const initAuth = async () => {
      const { data: { user: fetchedUser } } = await supabase.auth.getUser();
      const userId = fetchedUser?.id ?? null;

      // Only update if different from current
      if (userId !== currentUserIdRef.current) {
        currentUserIdRef.current = userId;
        setUser(fetchedUser);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUserId = session?.user?.id ?? null;
      // Only update user state when the user ID actually changes
      // This prevents re-renders on TOKEN_REFRESHED events
      if (newUserId !== currentUserIdRef.current) {
        currentUserIdRef.current = newUserId;
        setUser(session?.user ?? null);
      }
    });

    return () => {
      subscription.unsubscribe();
      // Don't reset authInitializedRef - we want to keep it true to prevent re-init
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // supabase is stable via ref, only run on mount

  // Check if we should show onboarding
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

  // Load visits from Supabase or localStorage
  useEffect(() => {
    const currentUserId = user?.id ?? null;

    // Skip if we've already loaded for this user (or null user)
    if (visitsLoadedForUserRef.current === currentUserId) {
      return;
    }

    const loadFromLocalStorage = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const visitsMap = new Map<string, Visit>();
          if (Array.isArray(parsed)) {
            // Old format: array of location IDs
            parsed.forEach((locationId: string) => {
              visitsMap.set(locationId, {
                id: `local-${locationId}`,
                userId: "local",
                locationId,
                visitDates: [],
                placesVisited: [],
                photos: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            });
          } else if (typeof parsed === "object") {
            // New format: object with visits
            Object.entries(parsed).forEach(([locationId, visit]) => {
              visitsMap.set(locationId, visit as Visit);
            });
          }
          setVisits(visitsMap);
        }
      } catch (e) {
        console.error("Failed to load from localStorage:", e);
      }
    };

    const loadVisits = async () => {
      // Mark as loaded for this user immediately to prevent duplicate calls
      visitsLoadedForUserRef.current = currentUserId;

      if (user) {
        try {
          const { data, error } = await supabase
            .from('visits')
            .select('*')
            .eq('user_id', user.id);

          if (error) {
            console.error("Failed to load visits:", error);
            loadFromLocalStorage();
          } else if (data) {
            const visitsMap = new Map<string, Visit>();
            (data as VisitRow[]).forEach((row) => {
              const visit = rowToVisit(row);
              visitsMap.set(visit.locationId, visit);
            });
            setVisits(visitsMap);
            // Cache to localStorage
            saveToLocalStorage(visitsMap);
          }
        } catch (e) {
          console.error("Failed to load visits:", e);
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
      setIsLoaded(true);
    };

    loadVisits();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // supabase is stable via ref

  // Save to localStorage
  const saveToLocalStorage = useCallback((visitsMap: Map<string, Visit>) => {
    try {
      const obj: Record<string, Visit> = {};
      visitsMap.forEach((visit, locationId) => {
        obj[locationId] = visit;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }, []);

  // Sync to Supabase
  const syncToSupabase = useCallback(async (
    action: "upsert" | "delete",
    visitData: Partial<Visit> & { locationId: string }
  ) => {
    if (!user) return;

    setSyncStatus("saving");

    try {
      if (action === "upsert") {
        const row = visitToRow(visitData, user.id);
        const { error } = await supabase
          .from('visits')
          .upsert({
            ...row,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,location_id'
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('visits')
          .delete()
          .eq('user_id', user.id)
          .eq('location_id', visitData.locationId);

        if (error) throw error;
      }

      setSyncStatus("saved");
      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (e) {
      console.error("Supabase sync error:", e);
      setSyncStatus("error");
    }
  }, [user, supabase]);

  // Debounced sync
  const scheduleSyncToSupabase = useCallback((
    action: "upsert" | "delete",
    visitData: Partial<Visit> & { locationId: string }
  ) => {
    if (!user) return;

    pendingSyncRef.current = { action, visit: visitData };

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (pendingSyncRef.current) {
        syncToSupabase(pendingSyncRef.current.action, pendingSyncRef.current.visit);
        pendingSyncRef.current = null;
      }
    }, SYNC_DEBOUNCE_MS);
  }, [user, syncToSupabase]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        if (pendingSyncRef.current && user) {
          syncToSupabase(pendingSyncRef.current.action, pendingSyncRef.current.visit);
        }
      }
    };
  }, [user, syncToSupabase]);

  // Check if location is visited
  const isVisited = useCallback((locationId: string): boolean => {
    return visits.has(locationId);
  }, [visits]);

  // Get visit for a location
  const getVisit = useCallback((locationId: string): Visit | undefined => {
    return visits.get(locationId);
  }, [visits]);

  // Toggle visit status (simple visited/not visited)
  const toggleVisit = useCallback((locationId: string) => {
    setVisits((prev) => {
      const next = new Map(prev);

      if (next.has(locationId)) {
        next.delete(locationId);
        saveToLocalStorage(next);
        scheduleSyncToSupabase("delete", { locationId });
      } else {
        const newVisit: Visit = {
          id: `local-${Date.now()}`,
          userId: user?.id || "local",
          locationId,
          visitDates: [],
          placesVisited: [],
          photos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        next.set(locationId, newVisit);
        saveToLocalStorage(next);
        scheduleSyncToSupabase("upsert", newVisit);

        // Auto-mark parent (US) if a state is visited
        const location = ALL_LOCATIONS.find(l => l.id === locationId);
        if (location?.type === "state" && location.parentId && !next.has(location.parentId)) {
          const parentVisit: Visit = {
            id: `local-${Date.now()}-parent`,
            userId: user?.id || "local",
            locationId: location.parentId,
            visitDates: [],
            placesVisited: [],
            photos: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          next.set(location.parentId, parentVisit);
          scheduleSyncToSupabase("upsert", parentVisit);
        }
      }

      return next;
    });
  }, [user, saveToLocalStorage, scheduleSyncToSupabase]);

  // Update visit with details
  const updateVisit = useCallback((locationId: string, updates: VisitInput) => {
    setVisits((prev) => {
      const next = new Map(prev);
      const existing = next.get(locationId);

      const updatedVisit: Visit = {
        id: existing?.id || `local-${Date.now()}`,
        userId: user?.id || "local",
        locationId,
        rating: updates.rating,
        notes: updates.notes,
        visitDates: updates.visitDates || existing?.visitDates || [],
        placesVisited: updates.placesVisited || existing?.placesVisited || [],
        photos: updates.photos || existing?.photos || [],
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      next.set(locationId, updatedVisit);
      saveToLocalStorage(next);
      scheduleSyncToSupabase("upsert", updatedVisit);

      return next;
    });
  }, [user, saveToLocalStorage, scheduleSyncToSupabase]);

  // Delete visit
  const deleteVisit = useCallback((locationId: string) => {
    // Delete photos from storage if user is logged in
    if (user) {
      deleteAllPhotosForLocation(user.id, locationId).catch((error) => {
        console.error("Failed to delete photos:", error);
      });
    }

    setVisits((prev) => {
      const next = new Map(prev);
      next.delete(locationId);
      saveToLocalStorage(next);
      scheduleSyncToSupabase("delete", { locationId });
      return next;
    });
  }, [user, saveToLocalStorage, scheduleSyncToSupabase]);

  // Clear all visits
  const clearAll = useCallback(() => {
    setVisits(new Map());
    localStorage.removeItem(STORAGE_KEY);
    // Note: This would need batch delete for Supabase
  }, []);

  // Get visited countries set (for backward compatibility with map components)
  const visitedCountries = useMemo(() => {
    const set = new Set<string>();
    visits.forEach((_, locationId) => {
      // Only add country-level IDs for map coloring
      const location = ALL_LOCATIONS.find(l => l.id === locationId);
      if (location) {
        if (location.type === "country") {
          set.add(locationId);
        } else if (location.parentId) {
          // For territories/states, also mark the parent
          set.add(location.parentId);
        }
      }
    });
    return set;
  }, [visits]);

  // Calculate stats
  const stats: VisitStats = useMemo(() => {
    const visitedLocations = Array.from(visits.values());

    // Count by type
    const visitedCountryIds = new Set<string>();
    const visitedTerritoryIds = new Set<string>();
    const visitedStateIds = new Set<string>();

    visitedLocations.forEach((visit) => {
      const location = ALL_LOCATIONS.find(l => l.id === visit.locationId);
      if (location) {
        if (location.type === "country") {
          visitedCountryIds.add(visit.locationId);
        } else if (location.type === "territory") {
          visitedTerritoryIds.add(visit.locationId);
        } else if (location.type === "state") {
          visitedStateIds.add(visit.locationId);
        }
      }
    });

    // Continent stats (countries only for main stats)
    const byContinent: Record<Continent, ContinentStats> = {} as Record<Continent, ContinentStats>;

    for (const continent of CONTINENTS) {
      const countriesInContinent = COUNTRIES.filter(c => c.continent === continent);
      const visitedInContinent = countriesInContinent.filter(c => visitedCountryIds.has(c.id));

      byContinent[continent] = {
        continent,
        visited: visitedInContinent.length,
        total: countriesInContinent.length,
        percentage: countriesInContinent.length > 0
          ? Math.round((visitedInContinent.length / countriesInContinent.length) * 100)
          : 0,
        locations: visitedInContinent.map(c => c.id),
      };
    }

    // Find most/least visited continents
    const continentEntries = Object.values(byContinent);
    const visitedContinents = continentEntries.filter(c => c.visited > 0);
    const mostVisited = visitedContinents.length > 0
      ? visitedContinents.reduce((a, b) => a.percentage > b.percentage ? a : b).continent
      : null;
    const leastVisited = visitedContinents.length > 0
      ? visitedContinents.reduce((a, b) => a.percentage < b.percentage ? a : b).continent
      : null;

    // Calculate average rating
    const ratedVisits = visitedLocations.filter(v => v.rating !== undefined);
    const averageRating = ratedVisits.length > 0
      ? ratedVisits.reduce((sum, v) => sum + (v.rating || 0), 0) / ratedVisits.length
      : null;

    // Total places visited
    const totalPlaces = visitedLocations.reduce(
      (sum, v) => sum + (v.placesVisited?.length || 0),
      0
    );

    // First and most recent visits
    const sortedByDate = [...visitedLocations]
      .filter(v => v.createdAt)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return {
      totalCountries: COUNTRIES.length,
      visitedCountries: visitedCountryIds.size,
      percentageCountries: Math.round((visitedCountryIds.size / COUNTRIES.length) * 100),
      totalTerritories: TERRITORIES.length,
      visitedTerritories: visitedTerritoryIds.size,
      totalStates: US_STATES.length,
      visitedStates: visitedStateIds.size,
      byContinent,
      averageRating,
      totalPlacesVisited: totalPlaces,
      mostVisitedContinent: mostVisited,
      leastVisitedContinent: leastVisited,
      firstVisit: sortedByDate[0] || null,
      mostRecentVisit: sortedByDate[sortedByDate.length - 1] || null,
    };
  }, [visits]);

  // Legacy stats format for backward compatibility
  const legacyStats = useMemo(() => ({
    count: stats.visitedCountries,
    percentage: stats.percentageCountries,
    byContinent: Object.fromEntries(
      Object.entries(stats.byContinent).map(([continent, data]) => [
        continent,
        { visited: data.visited, total: data.total }
      ])
    ) as Record<Continent, { visited: number; total: number }>,
  }), [stats]);

  return {
    // Visit data
    visits,
    visitedCountries, // Set for map compatibility

    // Actions
    toggleVisit,
    toggleCountry: toggleVisit, // Alias for backward compatibility
    updateVisit,
    deleteVisit,
    clearAll,

    // Queries
    isVisited,
    getVisit,

    // Stats
    stats,
    legacyStats, // For backward compatibility with Stats component

    // State
    isLoaded,
    user,
    syncStatus,
    showOnboarding,
    dismissOnboarding,
  };
}

// Re-export types
export type { Visit, VisitInput, VisitStats, SyncStatus };
