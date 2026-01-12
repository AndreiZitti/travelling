"use client";

import { useEffect } from "react";

const DEFAULT_ACCENT = "#059669";

export default function AccentColorLoader() {
  useEffect(() => {
    const savedColor = localStorage.getItem("accentColor");
    if (savedColor) {
      document.documentElement.style.setProperty("--been-accent", savedColor);
    } else {
      document.documentElement.style.setProperty("--been-accent", DEFAULT_ACCENT);
    }
  }, []);

  return null;
}
