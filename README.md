# QVIX Group — Home page

Static, dependency-free home page for QVIX Group: semantic HTML5, modern CSS
and vanilla JavaScript. No build step.

## Run locally

Open `index.html` directly, or serve the folder (recommended, so fonts and
relative paths behave as in production):

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

## Structure

```
index.html              Page markup, sections 01–12 in order
DESIGN.md               Design system: tokens, type scale, grid, motion rules
assets/css/
  tokens.css            Color, type, spacing, motion and layer tokens
  base.css              Reset, layout primitives, grain, guides, loader, reveals
  components.css        Header, nav, buttons, links, labels, cursor follower
  sections.css          Section compositions, in page order
assets/js/
  utils.js              Shared QVIX namespace (scroll/resize bus, helpers)
  loader.js             Once-per-session loading transition
  header.js             Scroll state, active section, mobile menu, clocks
  reveal.js             Reveals, word masks, scrubbed statement, counters, parallax
  hero.js               Canvas system model + live readouts
  capabilities.js       Interactive capability list + schematic stage
  approach.js           Pinned horizontal "QVIX approach" scroll
  system.js             Architecture diagram (data-driven SVG)
  interactions.js       Magnetic CTAs, cursor follower, marquee, grid toggle
  cta-field.js          Final CTA dot field
  main.js               Entry point
```

## Before launch

Search `index.html` for `PLACEHOLDER` to find content that needs real data:

- **Statistics** — `XX+` values. Put the number in `data-count` (e.g.
  `data-count="120"`) and the text; the count-up activates automatically.
- **Featured work** — project names, categories, years and descriptions are
  sample content.
- **Social links** and the **“Start a conversation”** destination.

## Accessibility & motion

- Respects `prefers-reduced-motion`: continuous motion stops, canvases render a
  static frame, the pinned scroll becomes a vertical stack.
- Keyboard: skip link, visible focus, accordion buttons with `aria-expanded`,
  and the architecture diagram is fully driven by the legend buttons.
- The cursor follower and magnetic effects only run on fine pointers.
