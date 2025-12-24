"use client";

import dynamic from "next/dynamic";
import { useVisitedCountries } from "@/hooks/useVisitedCountries";
import CountryList from "@/components/CountryList";
import Stats from "@/components/Stats";

const FlatMap = dynamic(() => import("@/components/FlatMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <div className="text-slate-400">Loading map...</div>
    </div>
  ),
});

export default function Home() {
  const { visitedCountries, toggleCountry, isVisited, stats, isLoaded, clearAll } =
    useVisitedCountries();

  if (!isLoaded) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-100">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-100 flex">
      {/* Sidebar */}
      <div className="w-80 h-full bg-white border-r border-slate-200 flex flex-col shadow-lg z-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-xl font-semibold text-slate-800">Travel Map</h1>
          <p className="text-sm text-slate-500 mt-1">Track your adventures</p>
        </div>

        {/* Stats */}
        <div className="p-4 border-b border-slate-200">
          <Stats stats={stats} />
        </div>

        {/* Country List */}
        <div className="flex-1 overflow-hidden">
          <CountryList
            visitedCountries={visitedCountries}
            onToggleCountry={toggleCountry}
            isVisited={isVisited}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={clearAll}
            className="w-full px-4 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Clear all visited countries
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 h-full relative">
        <FlatMap
          visitedCountries={visitedCountries}
          onCountryClick={toggleCountry}
          isVisited={isVisited}
        />

        {/* Map instructions */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-sm text-slate-600">
          Click countries to mark as visited • Scroll to zoom • Drag to pan
        </div>
      </div>
    </main>
  );
}
