"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useVisits } from "@/hooks/useVisits";
import CountryList from "@/components/CountryList";
import Stats from "@/components/Stats";
import UserMenu from "@/components/UserMenu";
import SyncStatus from "@/components/SyncStatus";
import OnboardingModal from "@/components/OnboardingModal";
import StatsDrawer from "@/components/StatsDrawer";
import VisitDetailModal from "@/components/VisitDetailModal";

const FlatMap = dynamic(() => import("@/components/FlatMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <div className="text-slate-400">Loading map...</div>
    </div>
  ),
});

const Globe = dynamic(() => import("@/components/Globe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a1a]">
      <div className="text-white/50">Loading globe...</div>
    </div>
  ),
});

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"flat" | "globe">("flat");
  const [statsDrawerOpen, setStatsDrawerOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);

  const {
    visitedCountries,
    visits,
    toggleVisit,
    updateVisit,
    deleteVisit,
    isVisited,
    getVisit,
    stats,
    legacyStats,
    isLoaded,
    syncStatus,
    showOnboarding,
    dismissOnboarding,
    user,
  } = useVisits();

  // Handle opening visit detail modal
  const handleOpenVisitDetail = (locationId: string) => {
    setSelectedLocationId(locationId);
    setVisitModalOpen(true);
  };

  // Handle map country click - toggle visit (only if unlocked)
  const handleMapCountryClick = (countryId: string) => {
    if (isLocked) return;
    toggleVisit(countryId);
  };

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
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-800">Travel Map</h1>
            <SyncStatus status={syncStatus} />
          </div>
          <p className="text-xs text-slate-500">{legacyStats.count} countries visited</p>
        </div>
        <div className="flex items-center gap-2">
          <UserMenu />
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex w-full h-full">
        {/* Desktop Sidebar */}
        <div className="w-80 h-full bg-white border-r border-slate-200 flex flex-col shadow-lg z-10">
          {/* Header with UserMenu */}
          <div className="p-4 border-b border-slate-200 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-800">Travel Map</h1>
                <SyncStatus status={syncStatus} />
              </div>
              <p className="text-sm text-slate-500 mt-1">Track your adventures</p>
            </div>
            <UserMenu />
          </div>
          <div className="p-4 border-b border-slate-200">
            <Stats
              stats={legacyStats}
              onViewDetails={() => setStatsDrawerOpen(true)}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <CountryList
              visitedCountries={visitedCountries}
              onToggleCountry={toggleVisit}
              isVisited={isVisited}
              onCountryLongPress={handleOpenVisitDetail}
              visits={visits}
            />
          </div>
        </div>

        {/* Desktop Map */}
        <div className="flex-1 h-full relative">
          {/* Globe View */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              viewMode === "globe" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <Globe
              visitedCountries={visitedCountries}
              onCountryClick={handleMapCountryClick}
              onCountryLongPress={handleOpenVisitDetail}
              isVisited={isVisited}
            />
          </div>

          {/* Flat Map View */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              viewMode === "flat" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <FlatMap
              onCountryClick={handleMapCountryClick}
              onCountryLongPress={handleOpenVisitDetail}
              isVisited={isVisited}
            />
          </div>

          {/* View Toggle and Lock Button */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`p-2 rounded-lg shadow-md backdrop-blur-sm transition-colors ${
                isLocked
                  ? "bg-amber-500 text-white"
                  : "bg-white/90 text-slate-600 hover:bg-slate-100"
              }`}
              title={isLocked ? "Unlock to edit" : "Lock to prevent changes"}
            >
              {isLocked ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md overflow-hidden flex">
              <button
                onClick={() => setViewMode("flat")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === "flat"
                    ? "bg-indigo-500 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Flat
              </button>
              <button
                onClick={() => setViewMode("globe")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === "globe"
                    ? "bg-indigo-500 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Globe
              </button>
            </div>
          </div>

          <div className={`absolute bottom-4 left-4 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-sm ${
            viewMode === "globe" ? "bg-black/50 text-white/80" : "bg-white/90 text-slate-600"
          }`}>
            {isLocked ? "Locked - Unlock to edit" : "Click to mark visited - Right-click for details"}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden w-full h-full pt-14">
        {/* Mobile Map (full screen) */}
        <div className="w-full h-full relative">
          {/* Globe View */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              viewMode === "globe" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <Globe
              visitedCountries={visitedCountries}
              onCountryClick={handleMapCountryClick}
              onCountryLongPress={handleOpenVisitDetail}
              isVisited={isVisited}
            />
          </div>

          {/* Flat Map View */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              viewMode === "flat" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <FlatMap
              onCountryClick={handleMapCountryClick}
              onCountryLongPress={handleOpenVisitDetail}
              isVisited={isVisited}
            />
          </div>

          {/* View Toggle and Lock Button */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`p-1.5 rounded-lg shadow-md backdrop-blur-sm transition-colors ${
                isLocked
                  ? "bg-amber-500 text-white"
                  : "bg-white/90 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isLocked ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md overflow-hidden flex">
              <button
                onClick={() => setViewMode("flat")}
                className={`px-2 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "flat"
                    ? "bg-indigo-500 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Flat
              </button>
              <button
                onClick={() => setViewMode("globe")}
                className={`px-2 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "globe"
                    ? "bg-indigo-500 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Globe
              </button>
            </div>
          </div>

          <div className={`absolute bottom-4 left-4 right-4 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-xs text-center ${
            viewMode === "globe" ? "bg-black/50 text-white/80" : "bg-white/90 text-slate-600"
          }`}>
            {isLocked ? "Locked - Tap lock to edit" : "Tap to mark visited - Long press for details"}
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
                <Stats
                  stats={legacyStats}
                  onViewDetails={() => {
                    setSidebarOpen(false);
                    setStatsDrawerOpen(true);
                  }}
                />
              </div>

              {/* Country List */}
              <div className="flex-1 overflow-hidden">
                <CountryList
                  visitedCountries={visitedCountries}
                  onToggleCountry={toggleVisit}
                  isVisited={isVisited}
                  onCountryLongPress={handleOpenVisitDetail}
                  visits={visits}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Stats Drawer */}
      <StatsDrawer
        isOpen={statsDrawerOpen}
        onClose={() => setStatsDrawerOpen(false)}
        stats={stats}
      />

      {/* Visit Detail Modal */}
      {selectedLocationId && (
        <VisitDetailModal
          locationId={selectedLocationId}
          visit={getVisit(selectedLocationId)}
          isOpen={visitModalOpen}
          onClose={() => {
            setVisitModalOpen(false);
            setSelectedLocationId(null);
          }}
          onSave={updateVisit}
          onDelete={deleteVisit}
          userId={user?.id}
        />
      )}

      {/* Onboarding Modal for first-time users */}
      {showOnboarding && (
        <OnboardingModal onComplete={dismissOnboarding} />
      )}
    </main>
  );
}
