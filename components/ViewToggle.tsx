"use client";

import { motion } from "framer-motion";

interface ViewToggleProps {
  view: "globe" | "map";
  onViewChange: (view: "globe" | "map") => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-full p-1 shadow-lg">
      <button
        onClick={() => onViewChange("globe")}
        className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          view === "globe" ? "text-white" : "text-white/60 hover:text-white/80"
        }`}
      >
        {view === "globe" && (
          <motion.div
            layoutId="activeView"
            className="absolute inset-0 bg-globe-visited rounded-full"
            initial={false}
            transition={{ type: "spring", duration: 0.5 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path
              strokeWidth="2"
              d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
            />
          </svg>
          Globe
        </span>
      </button>
      <button
        onClick={() => onViewChange("map")}
        className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          view === "map" ? "text-white" : "text-white/60 hover:text-white/80"
        }`}
      >
        {view === "map" && (
          <motion.div
            layoutId="activeView"
            className="absolute inset-0 bg-globe-visited rounded-full"
            initial={false}
            transition={{ type: "spring", duration: 0.5 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeWidth="2"
              d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-1.447-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          Map
        </span>
      </button>
    </div>
  );
}
