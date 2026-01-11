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
import FullScreenMap from "@/components/FullScreenMap";
import BottomNav, { TabType } from "@/components/BottomNav";
import StatsSummaryCard from "@/components/StatsSummaryCard";
import StatsModal from "@/components/StatsModal";
import VisualizeTab from "@/components/VisualizeTab";

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
  const [fullMode, setFullMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("select");
  const [mobileStatsModalOpen, setMobileStatsModalOpen] = useState(false);

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
      {/* Mobile Header - Only show on Select tab */}
      {activeTab === "select" && (
        <div className="md:hidden absolute top-0 left-0 right-0 z-20 bg-been-bg px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-been-accent">Travel Map</h1>
          <div className="flex items-center gap-2">
            <SyncStatus status={syncStatus} />
            <button className="p-2 rounded-lg hover:bg-been-card transition-colors">
              <svg className="w-6 h-6 text-been-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>
            <button className="p-2 rounded-lg hover:bg-been-card transition-colors">
              <svg className="w-6 h-6 text-been-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      )}

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

          {/* View Toggle and Lock Button - desktop */}
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
            <button
              onClick={() => setViewMode(viewMode === "globe" ? "flat" : "globe")}
              className={`px-3 py-2 text-sm font-medium rounded-lg shadow-md backdrop-blur-sm transition-colors ${
                viewMode === "globe"
                  ? "bg-indigo-500 text-white"
                  : "bg-white/90 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Globe
            </button>
          </div>

          <div className={`absolute bottom-4 left-4 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium ${
            viewMode === "globe" ? "bg-black/70 text-white" : "bg-white/95 text-slate-700"
          }`}>
            {isLocked ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Locked - Unlock to edit
              </span>
            ) : (
              "Click to mark visited - Right-click for details"
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout - Dark "been" style */}
      <div className="md:hidden w-full h-full bg-been-bg pb-16">
        {/* Select Tab */}
        {activeTab === "select" && (
          <div className="w-full h-full pt-14 flex flex-col">
            {/* Map Area */}
            <div className="flex-1 relative min-h-0">
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
                  darkMode
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
                  darkMode
                />
              </div>

              {/* Carousel dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                <button
                  onClick={() => setViewMode("flat")}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    viewMode === "flat" ? "bg-been-accent" : "bg-been-muted"
                  }`}
                />
                <button
                  onClick={() => setViewMode("globe")}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    viewMode === "globe" ? "bg-been-accent" : "bg-been-muted"
                  }`}
                />
                <button
                  onClick={() => setFullMode(true)}
                  className="w-2 h-2 rounded-full bg-been-muted"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-been-card mx-4" />

            {/* Stats Section */}
            <div className="p-4 space-y-3 overflow-y-auto dark-scroll">
              {/* Stats Summary Card */}
              <StatsSummaryCard
                percentage={stats.percentageCountries}
                visited={stats.visitedCountries}
                total={stats.totalCountries}
                onTap={() => setMobileStatsModalOpen(true)}
              />

              {/* My Countries Row */}
              <button
                onClick={() => setActiveTab("explore")}
                className="w-full bg-been-card rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-been-accent/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-been-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-been-text font-medium">My Countries</p>
                    <p className="text-been-muted text-sm">and non-UN territories</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-been-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Explore Tab */}
        {activeTab === "explore" && (
          <div className="w-full h-full bg-been-bg flex flex-col">
            <div className="p-4 border-b border-been-card">
              <h1 className="text-2xl font-bold text-been-text">Explore</h1>
              <p className="text-been-muted text-sm mt-1">Select countries you&apos;ve visited</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <CountryList
                visitedCountries={visitedCountries}
                onToggleCountry={toggleVisit}
                isVisited={isVisited}
                onCountryLongPress={handleOpenVisitDetail}
                visits={visits}
                darkMode
              />
            </div>
          </div>
        )}

        {/* Visualize Tab */}
        {activeTab === "visualize" && (
          <VisualizeTab
            onSelectOption={(optionId) => {
              if (optionId === "globe") {
                setViewMode("globe");
                setActiveTab("select");
              } else if (optionId === "zoomable") {
                setViewMode("flat");
                setActiveTab("select");
              }
            }}
          />
        )}

        {/* Compare Tab - Placeholder */}
        {activeTab === "compare" && (
          <div className="w-full h-full bg-been-bg flex flex-col items-center justify-center p-8">
            <div className="w-20 h-20 rounded-full bg-been-card flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-been-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-been-text mb-2">Compare</h2>
            <p className="text-been-muted text-center">Compare your travels with friends. Coming soon!</p>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="w-full h-full bg-been-bg p-4 space-y-4">
            <h1 className="text-2xl font-bold text-been-text mb-6">Profile</h1>

            {/* User Info */}
            <div className="bg-been-card rounded-2xl p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-been-accent flex items-center justify-center">
                <span className="text-xl font-bold text-been-bg">
                  {user?.email?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
              <div>
                <p className="text-been-text font-medium">{user?.email || "Guest"}</p>
                <p className="text-been-muted text-sm">
                  {stats.visitedCountries} countries visited
                </p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="bg-been-card rounded-2xl overflow-hidden">
              <button
                onClick={() => setStatsDrawerOpen(true)}
                className="w-full p-4 flex items-center justify-between border-b border-been-bg/50"
              >
                <span className="text-been-text">View Detailed Stats</span>
                <svg className="w-5 h-5 text-been-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <a
                href="/settings"
                className="w-full p-4 flex items-center justify-between"
              >
                <span className="text-been-text">Settings</span>
                <svg className="w-5 h-5 text-been-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Sync Status */}
            <div className="bg-been-card rounded-2xl p-4 flex items-center justify-between">
              <span className="text-been-text">Sync Status</span>
              <SyncStatus status={syncStatus} />
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
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

      {/* Mobile Stats Modal - "been" style */}
      <StatsModal
        isOpen={mobileStatsModalOpen}
        onClose={() => setMobileStatsModalOpen(false)}
        stats={stats}
      />

      {/* Full Screen Map for mobile */}
      <FullScreenMap
        isOpen={fullMode}
        onClose={() => setFullMode(false)}
        onCountryLongPress={handleOpenVisitDetail}
        isVisited={isVisited}
      />
    </main>
  );
}
