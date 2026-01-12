"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES, type Location } from "@/lib/locations";

interface AddCountryFABProps {
  onAddCountry: (countryId: string) => void;
  isVisited: (countryId: string) => boolean;
}

export default function AddCountryFAB({ onAddCountry, isVisited }: AddCountryFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter countries based on search query
  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !isVisited(country.id)
  );

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle country selection
  const handleSelect = (country: Location) => {
    onAddCountry(country.id);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
        style={{ backgroundColor: "var(--been-accent)" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </motion.button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-been-bg"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-been-card">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearchQuery("");
                }}
                className="p-2 rounded-lg hover:bg-been-card transition-colors"
              >
                <svg
                  className="w-6 h-6 text-been-muted"
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
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search countries..."
                  className="w-full bg-transparent text-been-text text-lg placeholder-been-muted focus:outline-none"
                />
              </div>
            </div>

            {/* Results */}
            <div className="overflow-y-auto h-[calc(100%-60px)] dark-scroll">
              {searchQuery.length === 0 ? (
                <div className="p-4 text-center text-been-muted">
                  <p>Start typing to search for countries</p>
                </div>
              ) : filteredCountries.length === 0 ? (
                <div className="p-4 text-center text-been-muted">
                  <p>No unvisited countries found</p>
                </div>
              ) : (
                <div className="divide-y divide-been-card">
                  {filteredCountries.map((country) => (
                    <motion.button
                      key={country.id}
                      onClick={() => handleSelect(country)}
                      className="w-full px-4 py-4 flex items-center justify-between hover:bg-been-card transition-colors text-left"
                      whileTap={{ scale: 0.98 }}
                    >
                      <div>
                        <p className="text-been-text font-medium">{country.name}</p>
                        <p className="text-sm text-been-muted">{country.continent}</p>
                      </div>
                      <svg
                        className="w-5 h-5 text-been-accent"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
