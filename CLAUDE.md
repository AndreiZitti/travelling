# Zeen - Travel Tracking App

A Next.js PWA for tracking countries you've visited, with a dark "been" theme UI.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (auth + PostgreSQL)
- **Styling**: Tailwind CSS with custom theme
- **Maps**: D3.js (FlatMap) + react-globe.gl (3D Globe)
- **Animations**: Framer Motion
- **PWA**: Service worker with offline support

## Project Structure

```
app/
  page.tsx          # Main app (map + tabs)
  settings/         # User settings (password, accent color)
  login/            # Authentication
  layout.tsx        # Root layout with AccentColorLoader

components/
  # Navigation
  BottomNav.tsx     # Mobile bottom tab bar (5 tabs)
  SideNav.tsx       # Desktop vertical sidebar

  # Map Views
  FlatMap.tsx       # 2D interactive world map (D3.js)
  Globe.tsx         # 3D rotating globe (react-globe.gl)
  FullScreenMap.tsx # Full-screen map wrapper

  # Tab Content
  DiaryTab.tsx      # Travel diary with photos
  VisualizeTab.tsx  # Map visualization options
  CompareTab.tsx    # QR code sharing
  ProfileTab.tsx    # User profile & settings

  # Stats
  StatsSummaryCard.tsx  # Compact stats with progress ring
  StatsModal.tsx        # Full-screen mobile stats
  StatsDrawer.tsx       # Desktop stats drawer
  Stats.tsx             # Desktop sidebar stats

  # Modals & UI
  CountryList.tsx       # Country selection list
  VisitDetailModal.tsx  # Edit visit details + photos
  AddCountryFAB.tsx     # Floating action button for quick add
  OnboardingModal.tsx   # First-time user onboarding

  # Utilities
  AccentColorLoader.tsx # Loads saved accent color on startup
  SyncStatus.tsx        # Cloud sync indicator
  UserMenu.tsx          # User avatar dropdown
  PhotoUploader.tsx     # Image upload to Supabase

hooks/
  useVisits.ts          # Main visits state management
  useVisitedCountries.ts # Legacy hook

lib/
  locations.ts          # Country/territory data (197 countries)
  types.ts              # TypeScript types
  supabase/             # Supabase client config
```

## Mobile vs Desktop Layout

### Mobile (< 768px)
- **Navigation**: Bottom tab bar with 5 tabs
- **Layout**: Full-screen content, tabs switch views
- **Map**: Takes full screen when in "Visualize" tab
- **FAB**: Floating "+" button for quick country addition
- **Stats**: Full-screen modal with dark theme

### Desktop (>= 768px)
- **Navigation**: Vertical sidebar on left (64px)
- **Layout**: Sidebar + Content Panel (320px) + Map (flex)
- **Map**: Always visible on right side
- **Stats**: Drawer that slides in from right

## Theme System

Uses CSS variables for dynamic accent colors:

```css
:root {
  --been-bg: #000000;      /* Pure black background */
  --been-card: #1C1C1E;    /* Dark gray cards */
  --been-accent: #059669;  /* Dynamic accent (user-selectable) */
  --been-text: #FFFFFF;    /* White text */
  --been-muted: #8E8E93;   /* Gray muted text */
}
```

**Accent Color Picker** (Settings):
- Two presets: Emerald (green) and Gold
- Color wheel for custom colors
- Saved to localStorage, applied via CSS variable
- All `text-been-accent`, `bg-been-accent` classes update automatically

## Key Features

1. **Country Tracking**
   - Mark countries as visited or wishlisted
   - Add visit dates, notes, and photos
   - Track by continent with progress stats

2. **Visualization**
   - 2D flat map (D3.js Natural Earth projection)
   - 3D interactive globe (WebGL)
   - Toggle between visited/wishlist views

3. **Diary**
   - Photo uploads per visit
   - Notes and dates
   - Grid gallery view

4. **Sharing**
   - QR code generation for profile sharing
   - Shareable visit statistics

5. **Settings**
   - Custom accent color picker
   - Password change
   - Account info

## Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Performance Notes

- Globe component only renders when active (prevents WebGL overhead)
- TopoJSON data is cached after first fetch
- FlatMap uses D3 with efficient re-renders
- Accent color updates poll every 500ms for real-time changes
