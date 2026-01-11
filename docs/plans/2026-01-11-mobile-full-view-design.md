# Mobile Full View Mode Design

## Overview

Improve mobile experience by adding a "Full" view mode that provides fullscreen landscape viewing of the travel map.

## View Mode Structure

### Mobile (2 toggle buttons)

```
[Full] [Globe]
```

- **Default (no selection)**: Flat 2D map, portrait, can tap to mark countries
- **Full**: Fullscreen landscape, view-only with details on long-press
- **Globe**: 3D globe, can tap to mark countries

### Desktop (1 toggle button)

```
[Globe]
```

- **Default (off)**: Flat 2D map
- **Globe (on)**: 3D globe
- Lock button remains on desktop

## Changes Summary

### Removals
- Mobile: Lock button (Full mode handles view-only use case)
- FlatMap: Zoom controls (+, -, reset) - pinch-to-zoom is standard on mobile

### Full Mode Behavior

**Entering:**
1. User taps "Full" button
2. Request browser Fullscreen API
3. Attempt to lock screen orientation to landscape
4. Map renders in landscape fullscreen

**Interactions:**
- Pan and zoom with touch gestures
- Long-press visited country → opens VisitDetailModal
- Tapping countries does nothing (no marking/unmarking)
- X button visible in top-right corner
- Bottom hint: "Long press visited countries for details"

**Exiting:**
- Tap X button, OR
- Swipe down gesture (~100px threshold)
- Returns to normal view

**Fallbacks:**
- Fullscreen API not supported → fullscreen-style overlay
- Orientation lock fails → still works without forced landscape

## Component Changes

### FlatMap.tsx
- Remove zoom controls (lines 353-416)
- Add optional `viewOnly` prop to disable country click handlers

### page.tsx
- Mobile: Remove lock button
- Mobile: Change toggle to `[Full] [Globe]`
- Desktop: Change toggle to single `[Globe]` button
- Desktop: Keep lock button
- Add `fullMode` state
- Add fullscreen enter/exit logic

### New: FullScreenMap component
- Wrapper for Full mode
- Fullscreen API + orientation lock
- X button overlay
- Swipe-down gesture detection
- Passes `onCountryLongPress` for details
