# CSS structure overview

Entry: `static/css/custom.css`

Load order (top → bottom):

1. `foundation/index.css` — tokens, base styles, and theme variables (light/dark)
2. `components/index.css` — component styles (navbar, mobile, markdown)
3. `pages/index.css` — page-level styles (Landing Page included)

Bundles

- foundation/
  - index.css — all tokens, base, and light/dark variables

- components/
  - index.css — imports:
    - navbar/index.css — navbar rules
    - mobile/index.css — mobile navigation (core + theme)
    - markdown/index.css — markdown (incl. dark-mode overrides)

- pages/
  - index.css — Landing Page styles

Notes

- Variables load first to ensure availability to all later rules.
- Components load before pages so pages can safely extend or override them.
