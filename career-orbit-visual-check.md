# Career Orbit visual verification

- Desktop full-page preview checked at 1280px width after the SVG geometry and background changes.
- The Career Orbit stage renders as a dark navy isolated panel with no visible red triangle or legacy background bleed.
- The visible dotted route and station labels remain aligned across the map; Mission Control and the selected station detail remain readable.
- Mobile full-page preview checked at 390px width. The map intentionally switches to the stacked station layout, hides the desktop SVG traveler/trail, and keeps the cards readable without horizontal overflow.
- The latest desktop preview was taken after the trail positioning fix; production build and all 31 Vitest tests also pass.
## 2026-08-27 — Keyboard navigation and progress HUD

- Desktop full-page preview at 1280px: Career Orbit remains visually isolated, the progress HUD appears directly below the map, the active percentage marker is readable, and the keyboard hint does not collide with Mission Control or the detail card.
- Mobile full-page preview at 390px: station cards remain stacked and readable, the progress HUD fits within the viewport without horizontal overflow, and the keyboard hint wraps safely below the route content.
- The progress track is intentionally left-to-right inside the RTL-capable page so the percentage represents the same route direction in both languages; the surrounding labels inherit the page language.
