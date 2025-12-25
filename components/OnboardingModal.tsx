"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingModalProps {
  onComplete: () => void;
}

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  cta?: {
    text: string;
    href: string;
  };
}

const steps: Step[] = [
  {
    title: "Welcome to Travel Map!",
    description: "Track all the countries you've visited and see your travel progress at a glance.",
    icon: (
      <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Click to Mark Countries",
    description: "Simply click on any country on the map to mark it as visited. Click again to unmark it.",
    icon: (
      <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
  },
  {
    title: "Want your data everywhere?",
    description: "Access your travel map anytime, anywhere, on any device.",
    cta: {
      text: "Contact me for an account!",
      href: "https://zitti.ro/pages/contact/index.html"
    },
    icon: (
      <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
    ),
  },
];

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="p-8 pt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-6">{steps[currentStep].icon}</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                {steps[currentStep].title}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {steps[currentStep].description}
              </p>
              {steps[currentStep].cta && (
                <a
                  href={steps[currentStep].cta!.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  {steps[currentStep].cta!.text}
                </a>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 pb-4">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? "bg-indigo-500" : "bg-slate-200 hover:bg-slate-300"
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="p-4 pt-0 flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
          >
            {isLastStep ? "Get Started" : "Next"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
