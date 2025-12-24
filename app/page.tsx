"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <main className="relative w-screen h-screen overflow-hidden bg-slate-100">
      {/* Mobile Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Travel Map</h1>
          <p className="text-xs text-slate-500">{stats.count} countries visited</p>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex w-full h-full">
        {/* Desktop Sidebar */}
        <div className="w-80 h-full bg-white border-r border-slate-200 flex flex-col shadow-lg z-10">
          <div className="p-4 border-b border-slate-200">
            <h1 className="text-xl font-semibold text-slate-800">Travel Map</h1>
            <p className="text-sm text-slate-500 mt-1">Track your adventures</p>
          </div>
          <div className="p-4 border-b border-slate-200">
            <Stats stats={stats} />
          </div>
          <div className="flex-1 overflow-hidden">
            <CountryList
              visitedCountries={visitedCountries}
              onToggleCountry={toggleCountry}
              isVisited={isVisited}
            />
          </div>
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={clearAll}
              className="w-full px-4 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear all visited countries
            </button>
          </div>
        </div>

        {/* Desktop Map */}
        <div className="flex-1 h-full relative">
          <FlatMap
            visitedCountries={visitedCountries}
            onCountryClick={toggleCountry}
            isVisited={isVisited}
          />
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-sm text-slate-600">
            Click countries to mark as visited • Scroll to zoom • Drag to pan
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden w-full h-full pt-14">
        {/* Mobile Map (full screen) */}
        <div className="w-full h-full relative">
          <FlatMap
            visitedCountries={visitedCountries}
            onCountryClick={toggleCountry}
            isVisited={isVisited}
          />
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-xs text-slate-600 text-center">
            Tap countries to mark visited • Pinch to zoom • Drag to pan
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-30"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-40 flex flex-col shadow-xl"
            >
              {/* Mobile Sidebar Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Countries</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
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
                  onClick={() => {
                    clearAll();
                    setSidebarOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear all visited countries
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
