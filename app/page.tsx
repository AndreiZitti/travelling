"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useVisitedCountries } from "@/hooks/useVisitedCountries";
import ViewToggle from "@/components/ViewToggle";
import Stats from "@/components/Stats";

// Dynamic imports to avoid SSR issues
const Globe = dynamic(() => import("@/components/Globe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-globe-bg">
      <div className="text-white/50">Loading...</div>
    </div>
  ),
});

const FlatMap = dynamic(() => import("@/components/FlatMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-map-bg">
      <div className="text-gray-400">Loading...</div>
    </div>
  ),
});

export default function Home() {
  const [view, setView] = useState<"globe" | "map">("globe");
  const { visitedCountries, toggleCountry, isVisited, stats, isLoaded } =
    useVisitedCountries();

  const isDarkMode = view === "globe";

  if (!isLoaded) {
    return (
      <div
        className={`w-screen h-screen flex items-center justify-center ${
          isDarkMode ? "bg-globe-bg" : "bg-map-bg"
        }`}
      >
        <div className={isDarkMode ? "text-white/50" : "text-gray-400"}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <main
      className={`relative w-screen h-screen overflow-hidden ${
        isDarkMode ? "bg-globe-bg" : "bg-map-bg"
      }`}
    >
      {/* Map views */}
      <AnimatePresence mode="wait">
        {view === "globe" ? (
          <motion.div
            key="globe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Globe
              visitedCountries={visitedCountries}
              onCountryClick={toggleCountry}
              isVisited={isVisited}
            />
          </motion.div>
        ) : (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <FlatMap
              visitedCountries={visitedCountries}
              onCountryClick={toggleCountry}
              isVisited={isVisited}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Overlay */}
      <div className="absolute inset-x-0 top-0 p-4 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <Stats stats={stats} isDarkMode={isDarkMode} />
        </div>
        <div className="pointer-events-auto">
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {/* Title */}
      <div
        className={`absolute bottom-4 left-4 text-sm opacity-50 ${
          isDarkMode ? "text-white" : "text-gray-600"
        }`}
      >
        Click countries to mark as visited
      </div>
    </main>
  );
}
