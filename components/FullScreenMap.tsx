"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import dynamic from "next/dynamic";

const FlatMap = dynamic(() => import("@/components/FlatMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#e8f4fc]">
      <div className="text-slate-400">Loading map...</div>
    </div>
  ),
});

interface FullScreenMapProps {
  isOpen: boolean;
  onClose: () => void;
  onCountryLongPress?: (countryId: string) => void;
  isVisited: (countryId: string) => boolean;
}

export default function FullScreenMap({
  isOpen,
  onClose,
  onCountryLongPress,
  isVisited,
}: FullScreenMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Enter fullscreen and lock orientation
  const enterFullscreen = useCallback(async () => {
    try {
      if (containerRef.current && document.fullscreenEnabled) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (err) {
      console.log("Fullscreen not available:", err);
    }

    // Try to lock orientation to landscape
    try {
      const orientation = screen.orientation as ScreenOrientation & { lock?: (orientation: string) => Promise<void> };
      if (orientation?.lock) {
        await orientation.lock("landscape");
      }
    } catch (err) {
      console.log("Orientation lock not available:", err);
    }
  }, []);

  // Exit fullscreen and unlock orientation
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.log("Exit fullscreen error:", err);
    }

    // Unlock orientation
    try {
      if (screen.orientation && "unlock" in screen.orientation) {
        screen.orientation.unlock();
      }
    } catch (err) {
      console.log("Orientation unlock error:", err);
    }

    setIsFullscreen(false);
    onClose();
  }, [onClose]);

  // Enter fullscreen when opened
  useEffect(() => {
    if (isOpen) {
      enterFullscreen();
    }
  }, [isOpen, enterFullscreen]);

  // Listen for fullscreen change (e.g., user presses Escape)
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isOpen) {
        setIsFullscreen(false);
        onClose();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isOpen, onClose]);

  // Handle swipe down to close
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 && info.velocity.y > 0) {
      exitFullscreen();
    }
  };

  // Dummy click handler (viewOnly mode prevents actual clicks)
  const handleCountryClick = () => {};

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="fixed inset-0 z-50 bg-[#e8f4fc]"
        style={{ touchAction: "pan-x" }}
      >
        {/* Map */}
        <div className="w-full h-full">
          <FlatMap
            onCountryClick={handleCountryClick}
            onCountryLongPress={onCountryLongPress}
            isVisited={isVisited}
            viewOnly={true}
          />
        </div>

        {/* Close button */}
        <button
          onClick={exitFullscreen}
          className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg z-10 active:scale-95 transition-transform"
        >
          <svg
            className="w-6 h-6 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Hint text */}
        <div className="absolute bottom-6 left-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg text-sm text-center font-medium text-slate-700">
          Long press visited countries for details
        </div>

        {/* Swipe indicator */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
