# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is a **static HTML landing page** — a single self-contained `index.html` file with no build tools, frameworks, or dependencies. All HTML, CSS, and JavaScript live in that one file.

Deployment is via **GitHub Pages** with a custom domain (`gurudo.se`), configured via `CNAME` and `.nojekyll`.

## Development

No build step required. Open `index.html` directly in a browser or use any static file server:

```bash
python3 -m http.server 8080
# or
npx serve .
```

## index.html structure

The file (~1900 lines) is organized in three parts:

1. **`<head>` + `<style>` (lines 1–1273)** — All CSS, including:
   - CSS custom properties for dark/light theming (default: dark)
   - Theme overrides via `[data-theme="light"]` on `<html>`
   - Component styles, animations, responsive breakpoints (960px / 640px / 400px)

2. **`<body>` (lines 1275–1744)** — Sections in order: `#nav`, `#hero`, `#services`, `#why`, `#stats`, `#tech`, `#contact`, footer

3. **`<script>` (lines 1749–1900)** — Vanilla JS for:
   - Theme toggle with `localStorage` persistence
   - Nav blur on scroll
   - Mobile hamburger menu
   - Smooth scroll
   - Scroll-reveal via `IntersectionObserver`
   - Animated stat counters via `IntersectionObserver`
   - 3D tilt on service cards
   - Mouse-parallax on hero shapes (desktop only)

## Theming

Colors are defined as CSS variables in `:root` (dark mode defaults) and overridden in `[data-theme="light"]`. The `data-theme` attribute is set on `<html>` by JavaScript and persisted in `localStorage`.
