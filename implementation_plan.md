# Implementation Plan - Performance & Memory Leak Cleanup

Comprehensive optimization to eliminate cumulative memory leaks, un-throttled scroll listeners, layout thrashing, and orphaned GSAP instances during client-side route navigation in Next.js.

## Problem Summary
As users navigate between pages (e.g., Home → Sekolah → Mitra → Asrama), the web app becomes progressively sluggish. This is caused by:
1. **Un-throttled Scroll Listeners & Layout Thrashing** in `Navbar`: Executing `document.querySelectorAll` and `getBoundingClientRect()` on every scroll frame (60-120 FPS).
2. **High-Frequency React State Updates** in `MitraProfile`: Invoking `useState` (`setTranslateX`) 60-120 times per second during scroll, forcing entire component tree re-renders on every scroll tick.
3. **Continuous ResizeObserver Thrashing** in `SmoothScroll`: Un-debounced `ResizeObserver` on `document.body` invoking `ScrollTrigger.refresh()` layout measurements.
4. **Incomplete GSAP & Listener Cleanup**: Orphaned animation frames and listeners lingering in memory after route navigation.

---

## Proposed Changes

### 1. Navbar Component
#### [MODIFY] [`components/navbar.tsx`](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/components/navbar.tsx)
- Cache `[data-nav-theme]` elements and update cache only on route change (`pathname`) or window `resize`.
- Throttle `onScroll` handler using `requestAnimationFrame` to avoid layout reflows on every scroll tick.
- Add proper `cancelAnimationFrame` and `removeEventListener` cleanup on unmount or route change.

---

### 2. Mitra Profile Component
#### [MODIFY] [`app/(public)/mitra/mitra-profile.tsx`](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/(public)/mitra/mitra-profile.tsx)
- Replace high-frequency React `useState` (`setTranslateX`) during scroll with Direct DOM Mutation (`trackRef.current.style.transform`).
- Throttle `setActiveIndex` updates so React re-renders only occur when the active slide index actually changes.
- Ensure all RAF loops and scroll event listeners are cleanly terminated on component unmount.

---

### 3. Smooth Scroll Component
#### [MODIFY] [`components/smooth-scroll.tsx`](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/components/smooth-scroll.tsx)
- Debounce `ResizeObserver` on `document.body` to prevent rapid consecutive `ScrollTrigger.refresh()` calls during DOM mutations.
- Ensure route changes (`pathname`) trigger a clean `lenis.resize()` and `ScrollTrigger.refresh(true)` after DOM settle.

---

### 4. Animation Cleanup Audit
#### [MODIFY] [`app/(public)/hero-carousel.tsx`](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/(public)/hero-carousel.tsx)
#### [MODIFY] [`app/(public)/sekolah/section/timeline.tsx`](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/(public)/sekolah/section/timeline.tsx)
- Ensure all GSAP timelines and timers (`setTimeout`, `setInterval`) are strictly scoped inside `gsap.context()` or `useEffect` with explicit cleanup (`ctx.revert()`, `clearTimeout`).

---

## Verification Plan

### Manual Verification
1. **Navigation Stress Test**: Open DevTools Performance / Memory tab. Navigate sequentially across all pages (`/` → `/sekolah` → `/mitra` → `/asrama` → `/spmb` → `/`...) 10+ times.
2. **Memory Heap Inspection**: Verify JS Heap size remains stable and does not grow continuously.
3. **Scroll Performance**: Verify smooth 60 FPS scrolling on `/sekolah` and `/mitra` without main-thread jank or Layout Thrashing.
4. **Build & Type Check**: Ensure `npm run build` or Next.js dev server runs with zero errors.
