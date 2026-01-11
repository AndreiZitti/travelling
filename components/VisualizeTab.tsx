'use client';

import { motion } from 'framer-motion';

interface VisualizationOption {
  id: string;
  label: string;
  icon: JSX.Element;
  available: boolean;
}

interface VisualizeTabProps {
  onSelectOption: (optionId: string) => void;
}

const visualizationOptions: VisualizationOption[] = [
  {
    id: 'globe',
    label: 'Globe',
    available: true,
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'zoomable',
    label: 'Zoomable',
    available: true,
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'timeline',
    label: 'Timeline',
    available: false,
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'flags',
    label: 'Flags',
    available: false,
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'map-pins',
    label: 'Map Pins',
    available: false,
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    id: 'chronology',
    label: 'Chronology',
    available: false,
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function VisualizeTab({ onSelectOption }: VisualizeTabProps) {
  return (
    <div className="h-full bg-been-bg p-4 overflow-y-auto dark-scroll">
      <h1 className="text-3xl font-bold text-been-text mb-6">Visualize</h1>

      <div className="grid grid-cols-2 gap-4">
        {visualizationOptions.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => option.available && onSelectOption(option.id)}
            className={`bg-been-card rounded-2xl p-4 h-32 flex flex-col justify-between items-start text-left relative ${
              !option.available ? 'opacity-50' : ''
            }`}
            whileTap={option.available ? { scale: 0.97 } : undefined}
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-full bg-been-accent flex items-center justify-center text-been-bg">
              {option.icon}
            </div>

            {/* Label with chevron */}
            <div className="flex items-center gap-1">
              <span className="text-been-text font-medium">{option.label}</span>
              <svg className="w-4 h-4 text-been-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Coming soon badge */}
            {!option.available && (
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-been-muted/20 rounded-full">
                <span className="text-xs text-been-muted">Soon</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
