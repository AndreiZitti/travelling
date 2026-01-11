/**
 * Core types for the travel tracking app
 */

import type { Continent } from "./locations";

// ============================================================================
// VISIT TYPES
// ============================================================================

export interface PlaceVisited {
  name: string;
  type: "city" | "landmark" | "region" | "other";
}

export interface VisitDate {
  startDate: string; // ISO date string
  endDate?: string; // ISO date string, optional for single-day visits
}

export type VisitType = 'visited' | 'wishlist';

export interface Visit {
  id: string; // UUID
  userId: string;
  locationId: string; // Reference to Location.id
  type: VisitType; // 'visited' or 'wishlist'
  rating?: number; // 1-5 stars
  notes?: string;
  visitDates: VisitDate[];
  placesVisited: PlaceVisited[];
  photos: string[]; // URLs to uploaded photos
  createdAt: string;
  updatedAt: string;
}

// For creating/updating visits (without server-generated fields)
export interface VisitInput {
  locationId: string;
  rating?: number;
  notes?: string;
  visitDates?: VisitDate[];
  placesVisited?: PlaceVisited[];
  photos?: string[];
}

// ============================================================================
// STATS TYPES
// ============================================================================

export interface ContinentStats {
  continent: Continent;
  visited: number;
  total: number;
  percentage: number;
  locations: string[]; // IDs of visited locations in this continent
}

export interface VisitStats {
  totalCountries: number;
  visitedCountries: number;
  percentageCountries: number;
  totalTerritories: number;
  visitedTerritories: number;
  totalStates: number;
  visitedStates: number;
  byContinent: Record<Continent, ContinentStats>;
  averageRating: number | null;
  totalPlacesVisited: number;
  mostVisitedContinent: Continent | null;
  leastVisitedContinent: Continent | null;
  firstVisit: Visit | null;
  mostRecentVisit: Visit | null;
}

// ============================================================================
// DATABASE SCHEMA (for Supabase)
// ============================================================================

// This matches what's stored in the database
export interface VisitRow {
  id: string;
  user_id: string;
  location_id: string;
  type: VisitType;
  rating: number | null;
  notes: string | null;
  visit_dates: VisitDate[] | null;
  places_visited: PlaceVisited[] | null;
  photos: string[] | null;
  created_at: string;
  updated_at: string;
}

// Convert database row to Visit type
export function rowToVisit(row: VisitRow): Visit {
  return {
    id: row.id,
    userId: row.user_id,
    locationId: row.location_id,
    type: row.type || 'visited',
    rating: row.rating ?? undefined,
    notes: row.notes ?? undefined,
    visitDates: row.visit_dates ?? [],
    placesVisited: row.places_visited ?? [],
    photos: row.photos ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert Visit to database row format
export function visitToRow(visit: Partial<Visit> & { locationId: string; type?: VisitType }, userId: string): Partial<VisitRow> {
  return {
    user_id: userId,
    location_id: visit.locationId,
    type: visit.type || 'visited',
    rating: visit.rating ?? null,
    notes: visit.notes ?? null,
    visit_dates: visit.visitDates ?? null,
    places_visited: visit.placesVisited ?? null,
    photos: visit.photos ?? null,
  };
}

// ============================================================================
// SYNC STATUS
// ============================================================================

export type SyncStatus = "idle" | "saving" | "saved" | "error";
