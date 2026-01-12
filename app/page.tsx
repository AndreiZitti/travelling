"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { QRCodeSVG } from "qrcode.react";
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
import DiaryTab from "@/components/DiaryTab";

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
  const [mobileCountryListOpen, setMobileCountryListOpen] = useState(false);
  const [mapMode, setMapMode] = useState<"visited" | "wishlist">("visited");

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
    // Wishlist data
    wishlist,
    wishlistCountries,
    toggleWishlist,
    updateWishlistItem,
    deleteWishlistItem,
    isWishlisted,
    getWishlistItem,
    wishlistStats,
  } = useVisits();

  // Handle opening visit detail modal
  const handleOpenVisitDetail = (locationId: string) => {
    setSelectedLocationId(locationId);
    setVisitModalOpen(true);
  };

  // Handle map country click - toggle visit or wishlist (only if unlocked)
  const handleMapCountryClick = (countryId: string) => {
    if (isLocked) return;
    if (mapMode === "wishlist") {
      toggleWishlist(countryId);
    } else {
      toggleVisit(countryId);
    }
  };

  // Handle share button
  const handleShare = async () => {
    const shareData = {
      title: 'Zeen - My Travel Map',
      text: `I've visited ${stats.visitedCountries} countries (${stats.percentageCountries}% of the world)! Check out my travel map.`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        );
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      // User cancelled or error
      console.log('Share cancelled or failed:', err);
    }
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
        <div className="md:hidden absolute top-0 left-0 right-0 z-20 bg-been-bg px-4 py-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-been-accent">Zeen</h1>
            <div className="flex items-center gap-2">
              <SyncStatus status={syncStatus} />
              <button 
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-been-card transition-colors"
              >
                <svg className="w-6 h-6 text-been-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
              <button
                onClick={() => setMobileCountryListOpen(true)}
                className="p-2 rounded-lg hover:bg-been-card transition-colors"
              >
                <svg className="w-6 h-6 text-been-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          {/* Visited / Wishlist Toggle */}
          <div className="flex bg-been-card rounded-lg p-1">
            <button
              onClick={() => setMapMode("visited")}
              className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
                mapMode === "visited"
                  ? "bg-been-accent text-been-bg"
                  : "text-been-muted hover:text-been-text"
              }`}
            >
              Visited
            </button>
            <button
              onClick={() => setMapMode("wishlist")}
              className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
                mapMode === "wishlist"
                  ? "bg-blue-500 text-white"
                  : "text-been-muted hover:text-been-text"
              }`}
            >
              Wishlist
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
      <div className="md:hidden w-full h-full bg-been-bg" style={{ paddingBottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}>
        {/* Select Tab - Always mounted to prevent reinitialization of heavy components */}
        <div className={`w-full h-full pt-24 overflow-y-auto dark-scroll ${activeTab !== "select" ? "hidden" : ""}`}>
            {/* Map Area - FlatMap only */}
            <div className="relative h-[45vh] min-h-[280px]">
              <FlatMap
                onCountryClick={handleMapCountryClick}
                onCountryLongPress={handleOpenVisitDetail}
                isVisited={isVisited}
                isWishlisted={isWishlisted}
                darkMode
                staticMode
                showWishlist={mapMode === "wishlist"}
              />

              {/* Full view button overlay */}
              <button
                onClick={() => setFullMode(true)}
                className="absolute top-3 right-3 p-2 rounded-lg bg-been-card/80 backdrop-blur-sm z-10"
              >
                <svg className="w-5 h-5 text-been-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-been-card mx-4" />

            {/* Stats Section */}
            <div className="p-4 space-y-3">
              {/* Stats Summary Card */}
              {mapMode === "visited" ? (
                <StatsSummaryCard
                  percentage={stats.percentageCountries}
                  visited={stats.visitedCountries}
                  total={stats.totalCountries}
                  onTap={() => setMobileStatsModalOpen(true)}
                />
              ) : (
                <div
                  onClick={() => setMobileStatsModalOpen(true)}
                  className="bg-been-card rounded-2xl p-4 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-been-muted text-sm">Wishlist</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-bold text-blue-500">
                          {wishlistStats.wishlistCountries}
                        </span>
                        <span className="text-been-muted">
                          / {wishlistStats.totalCountries}
                        </span>
                      </div>
                      <p className="text-been-muted text-xs mt-1">Countries to visit</p>
                    </div>
                    <div className="w-16 h-16 relative">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18" cy="18" r="15.9"
                          fill="none"
                          stroke="#2d2d44"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18" cy="18" r="15.9"
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="3"
                          strokeDasharray={`${wishlistStats.percentageCountries} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-blue-500">
                        {wishlistStats.percentageCountries}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* My Countries/Wishlist Row */}
              <button
                onClick={() => setActiveTab("diary")}
                className="w-full bg-been-card rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    mapMode === "wishlist" ? "bg-blue-500/20" : "bg-been-accent/20"
                  }`}>
                    <svg className={`w-5 h-5 ${mapMode === "wishlist" ? "text-blue-500" : "text-been-accent"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-been-text font-medium">
                      {mapMode === "wishlist" ? "My Wishlist" : "My Countries"}
                    </p>
                    <p className="text-been-muted text-sm">
                      {mapMode === "wishlist" ? "Places to visit" : "and non-UN territories"}
                    </p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-been-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Continent Stats Section */}
              {mapMode === "visited" && (
                <div className="pt-2">
                  <h3 className="text-been-muted text-sm font-medium mb-3 px-1">By Continent</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(stats.byContinent).map((continentStats) => (
                      <div
                        key={continentStats.continent}
                        className="bg-been-card rounded-xl p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-been-text text-sm font-medium">
                            {continentStats.continent}
                          </span>
                          <span className="text-been-accent text-xs font-bold">
                            {continentStats.percentage}%
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1.5 bg-been-bg rounded-full overflow-hidden">
                          <div
                            className="h-full bg-been-accent rounded-full transition-all duration-300"
                            style={{ width: `${continentStats.percentage}%` }}
                          />
                        </div>
                        <p className="text-been-muted text-xs mt-1.5">
                          {continentStats.visited} / {continentStats.total}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Diary Tab */}
        {activeTab === "diary" && (
          <DiaryTab
            visits={mapMode === "wishlist" ? wishlist : visits}
            onEntryTap={handleOpenVisitDetail}
            isWishlist={mapMode === "wishlist"}
          />
        )}

        {/* Visualize Tab */}
        {activeTab === "visualize" && (
          <VisualizeTab
            visitedCountries={visitedCountries}
            wishlistCountries={wishlistCountries}
            isVisited={isVisited}
            isWishlisted={isWishlisted}
            onCountryClick={handleMapCountryClick}
            onCountryLongPress={handleOpenVisitDetail}
            mapMode={mapMode}
          />
        )}

        {/* Compare Tab - QR Code Share */}
        {activeTab === "compare" && (
          <div className="absolute inset-0 bg-been-bg p-6 pb-8 overflow-y-auto dark-scroll" style={{ bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}>
            <h1 className="text-2xl font-bold text-been-text mb-6">Share & Compare</h1>

            {/* QR Code Section */}
            <div className="bg-been-card rounded-2xl p-6 flex flex-col items-center">
              <h2 className="text-lg font-semibold text-been-text mb-2">Your Travel QR Code</h2>
              <p className="text-been-muted text-sm text-center mb-4">
                Share this code with friends to compare travels
              </p>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl mb-4">
                <QRCodeSVG
                  value={Array.from(visitedCountries).sort().join(",")}
                  size={200}
                  level="M"
                  includeMargin={false}
                />
              </div>

              {/* Stats below QR */}
              <div className="text-center">
                <p className="text-been-accent text-2xl font-bold">{stats.visitedCountries}</p>
                <p className="text-been-muted text-sm">countries encoded</p>
              </div>
            </div>

            {/* Info Section */}
            <div className="mt-4 bg-been-card rounded-2xl p-4">
              <h3 className="text-been-text font-medium mb-2">How it works</h3>
              <ul className="text-been-muted text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-been-accent">1.</span>
                  <span>Screenshot or share your QR code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-been-accent">2.</span>
                  <span>Friends scan to see your visited countries</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-been-accent">3.</span>
                  <span>Compare who&apos;s been to more places!</span>
                </li>
              </ul>
            </div>

            {/* Scan Section - Coming Soon */}
            <div className="mt-4 bg-been-card rounded-2xl p-4 opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-been-bg flex items-center justify-center">
                  <svg className="w-5 h-5 text-been-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="7" y="7" width="10" height="10" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-been-text font-medium">Scan a friend&apos;s code</p>
                  <p className="text-been-muted text-sm">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="absolute inset-0 bg-been-bg p-4 space-y-4 overflow-y-auto dark-scroll" style={{ bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}>
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
          visit={mapMode === "wishlist" ? getWishlistItem(selectedLocationId) : getVisit(selectedLocationId)}
          isOpen={visitModalOpen}
          onClose={() => {
            setVisitModalOpen(false);
            setSelectedLocationId(null);
          }}
          onSave={mapMode === "wishlist" ? updateWishlistItem : updateVisit}
          onDelete={mapMode === "wishlist" ? deleteWishlistItem : deleteVisit}
          userId={user?.id}
          isWishlist={mapMode === "wishlist"}
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
        isWishlisted={isWishlisted}
        showWishlist={mapMode === "wishlist"}
      />

      {/* Mobile Country List Modal - for adding countries */}
      <AnimatePresence>
        {mobileCountryListOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileCountryListOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden fixed inset-x-0 bottom-0 top-12 bg-been-bg z-50 rounded-t-3xl flex flex-col"
            >
              <div className="p-4 border-b border-been-card flex items-center justify-between">
                <h2 className={`text-xl font-bold ${mapMode === "wishlist" ? "text-blue-500" : "text-been-text"}`}>
                  {mapMode === "wishlist" ? "Add to Wishlist" : "Add Countries"}
                </h2>
                <button
                  onClick={() => setMobileCountryListOpen(false)}
                  className="p-2 rounded-lg hover:bg-been-card transition-colors"
                >
                  <svg className="w-6 h-6 text-been-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <CountryList
                  visitedCountries={mapMode === "wishlist" ? wishlistCountries : visitedCountries}
                  onToggleCountry={mapMode === "wishlist" ? toggleWishlist : toggleVisit}
                  isVisited={mapMode === "wishlist" ? isWishlisted : isVisited}
                  onCountryLongPress={(locationId) => {
                    setMobileCountryListOpen(false);
                    handleOpenVisitDetail(locationId);
                  }}
                  visits={mapMode === "wishlist" ? wishlist : visits}
                  darkMode
                  isWishlist={mapMode === "wishlist"}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
