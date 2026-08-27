# Career Orbit visual verification

- Desktop full-page preview checked at 1280px width after the SVG geometry and background changes.
- The Career Orbit stage renders as a dark navy isolated panel with no visible red triangle or legacy background bleed.
- The visible dotted route and station labels remain aligned across the map; Mission Control and the selected station detail remain readable.
- Mobile full-page preview checked at 390px width. The map intentionally switches to the stacked station layout, hides the desktop SVG traveler/trail, and keeps the cards readable without horizontal overflow.
- The latest desktop preview was taken after the trail positioning fix; production build and all 31 Vitest tests also pass.
