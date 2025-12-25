"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { SyncStatus as SyncStatusType } from "@/hooks/useVisitedCountries";

interface SyncStatusProps {
  status: SyncStatusType;
}

export default function SyncStatus({ status }: SyncStatusProps) {
  if (status === "idle") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-1.5 text-xs text-slate-500"
      >
        {status === "saving" && (
          <>
            <motion.div
              className="w-2 h-2 bg-amber-400 rounded-full"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span>Saving...</span>
          </>
        )}
        {status === "saved" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 bg-emerald-400 rounded-full"
            />
            <span>Saved</span>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            <span className="text-red-500">Sync failed</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
