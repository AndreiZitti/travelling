"use client";

import { motion } from "framer-motion";

interface OnboardingModalProps {
  onComplete: () => void;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const handleGetStarted = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal - pointer-events-auto to capture clicks */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden pointer-events-auto"
      >
        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            {/* Globe icon */}
            <div className="mb-4 p-3 bg-indigo-100 rounded-full">
              <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Welcome to Travel Map!
            </h2>

            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Tap any country to mark it as visited. Long-press for more details.
            </p>

            {/* Data persistence note */}
            <div className="w-full p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <p className="text-amber-800 text-xs leading-relaxed">
                <span className="font-medium">Note:</span> Your data is saved locally in this browser. For cross-device sync,{" "}
                <a
                  href="https://zitti.ro/pages/contact/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline hover:text-amber-900"
                >
                  contact me
                </a>
                {" "}for an account.
              </p>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={handleGetStarted}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleGetStarted();
            }}
            className="w-full px-4 py-4 text-base font-medium text-white bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 rounded-xl transition-colors select-none touch-manipulation"
          >
            Get Started
          </button>
        </div>
      </motion.div>
    </div>
  );
}
