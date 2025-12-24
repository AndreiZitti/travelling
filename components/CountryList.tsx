"use client";

import { useState, useMemo } from "react";
import { COUNTRIES, CONTINENTS, type Continent } from "@/lib/countries";

interface CountryListProps {
  visitedCountries: Set<string>;
  onToggleCountry: (countryId: string) => void;
  isVisited: (countryId: string) => boolean;
}

export default function CountryList({
  onToggleCountry,
  isVisited,
}: CountryListProps) {
  const [search, setSearch] = useState("");
  const [selectedContinent, setSelectedContinent] = useState<Continent | "all">("all");
  const [showVisitedOnly, setShowVisitedOnly] = useState(false);

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter((country) => {
      const matchesSearch = country.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesContinent =
        selectedContinent === "all" || country.continent === selectedContinent;
      const matchesVisited = !showVisitedOnly || isVisited(country.id);
      return matchesSearch && matchesContinent && matchesVisited;
    });
  }, [search, selectedContinent, showVisitedOnly, isVisited]);

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

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-3 border-b border-slate-200">
        <input
          type="text"
          placeholder="Search countries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <div className="p-3 border-b border-slate-200 space-y-2">
        <select
          value={selectedContinent}
          onChange={(e) => setSelectedContinent(e.target.value as Continent | "all")}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All continents</option>
          {CONTINENTS.map((continent) => (
            <option key={continent} value={continent}>
              {continent}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showVisitedOnly}
            onChange={(e) => setShowVisitedOnly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Show visited only
        </label>
      </div>

      {/* Country list */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedCountries).map(([continent, countries]) => (
          <div key={continent}>
            <div className="sticky top-0 px-3 py-2 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {continent} ({countries.filter((c) => isVisited(c.id)).length}/{countries.length})
            </div>
            {countries.map((country) => {
              const visited = isVisited(country.id);
              return (
                <button
                  key={country.id}
                  onClick={() => onToggleCountry(country.id)}
                  className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left ${
                    visited ? "bg-indigo-50" : ""
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      visited
                        ? "bg-indigo-500 border-indigo-500"
                        : "border-slate-300"
                    }`}
                  >
                    {visited && (
                      <svg
                        className="w-3 h-3 text-white"
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
                    className={`text-sm ${
                      visited ? "text-indigo-700 font-medium" : "text-slate-700"
                    }`}
                  >
                    {country.name}
                  </span>
                </button>
              );
            })}
          </div>
        ))}

        {filteredCountries.length === 0 && (
          <div className="p-4 text-center text-slate-400 text-sm">
            No countries found
          </div>
        )}
      </div>
    </div>
  );
}
