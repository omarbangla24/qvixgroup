# QVIX Group — Home Page Design System

Editorial-tech direction: Swiss grid discipline, oversized type set against
small monospaced metadata, a near-black foundation, one signal accent.
All tokens live in `assets/css/tokens.css`; this document explains intent.

## 1. Color

| Token              | Value                       | Use                                   |
| ------------------ | --------------------------- | ------------------------------------- |
| `--c-ink-900`      | `#0A0B0B`                   | Page foundation                       |
| `--c-ink-800`      | `#0F1110`                   | Raised surfaces (panels, footer)      |
| `--c-ink-700`      | `#151817`                   | UI mock surfaces                      |
| `--c-ink-600`      | `#1D201F`                   | Hover surfaces, inner UI              |
| `--c-paper`        | `#ECE8DF`                   | Primary content (warm off‑white)      |
| `--c-paper-dim`    | `rgba(236,232,223,.72)`     | Body copy                             |
| `--c-paper-mute`   | `rgba(236,232,223,.54)`     | Metadata, labels (≥4.5:1 on ink‑900)  |
| `--c-line`         | `rgba(236,232,223,.11)`     | Hairlines, grid                       |
| `--c-line-strong`  | `rgba(236,232,223,.22)`     | Active borders                        |
| `--c-accent`       | `#FF5A1F` “QVIX Signal”     | One accent: active state, status, CTA |

Rules: the accent is a *signal*, never decoration — it marks the active item,
live status, focus and the primary call to action. No gradients beyond
functional fades. No secondary hues.

## 2. Typography

- **Geist** (sans) — headlines and body. Tight tracking at display sizes.
- **Geist Mono** — micro‑labels, indices, annotations, data readouts. Always
  uppercase with `0.08em` tracking at micro sizes.

Fluid scale (360px → 1600px viewport):

| Token          | Range            | Role                        |
| -------------- | ---------------- | --------------------------- |
| `--fs-micro`   | 11px             | Mono labels, annotations    |
| `--fs-xs`      | 13px             | Captions, meta              |
| `--fs-sm`      | 15px             | UI text, nav                |
| `--fs-base`    | 16 → 18px        | Body                        |
| `--fs-md`      | 20 → 26px        | Lead paragraphs             |
| `--fs-lg`      | 28 → 48px        | Sub‑headlines, list titles  |
| `--fs-xl`      | 40 → 88px        | Section headlines           |
| `--fs-2xl`     | 52 → 144px       | Statements, statistics      |
| `--fs-display` | 56 → 184px       | Hero, final CTA             |

## 3. Spacing & grid

- 4px base unit: `--s-1` (4px) … `--s-12` (192px).
- Page margin `--margin`: 16 → 40px. Gutter `--gutter`: 12 → 24px.
- 12 columns ≥1024px, 8 columns 768–1023px, 4 columns <768px.
- Section rhythm `--section-y`: 96 → 192px.
- Press **G** on the page to toggle the 12‑column grid overlay.

## 4. Breakpoints

`480` small phones · `768` tablet · `1024` small desktop · `1280` desktop ·
`1600` wide. Mobile‑first media queries (`min-width`).

## 5. Interaction language

- **Easing:** `--ease-out` (expo‑out) for entrances, `--ease-in-out` for
  state swaps. Durations 200 / 400 / 800 / 1200ms.
- **Reveal:** masked line rises (headlines), 24px fade‑up (content).
- **Hover:** horizontal displacement (8–16px), accent indicator, dimming of
  siblings to focus attention. Never scale text.
- **Magnetic:** primary CTAs pull toward the pointer (max 0.3 × distance).
- **Cursor follower:** only inside Work and Insights, carrying a label or a
  preview — the native cursor is never hidden.
- **Reduced motion:** all continuous motion stops, reveals resolve instantly,
  pinned scroll becomes a vertical stack, canvases render a static frame.

## 6. Content placeholders

Statistics shown as `XX+` and featured work entries are placeholders —
search the HTML for `PLACEHOLDER` to locate everything that needs real data.
