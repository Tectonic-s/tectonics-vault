---
name: impeccable-design
description: Execution standards for building polished, production-grade UI. Use when implementing or reviewing components, layouts, typography, spacing, color, and interaction states in HTML/CSS/React/Tailwind. Turns good taste (see the taste skill) into precise, consistent implementation; pairs with emil-kowalski-design for motion.
---

# Impeccable Design

Taste decides *what*; this decides *how well it's built*. Impeccable UI is consistent, accessible, and detailed to the pixel. Where `taste` is judgment, this is craft.

## Spacing & layout

- **Use a spacing scale** (4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128). Never invent one-off values. Space *between* groups should exceed space *within* a group, so grouping reads instantly.
- **Compose with grid/flex**, align every edge, and keep a consistent max content width. Prefer relative units and `clamp()` for fluid, responsive type and spacing.
- **Whitespace is a component.** Give focal elements room; don't distribute space evenly — weight it toward hierarchy.

## Typography

- Limit to **1–2 families** (a display + a text face is the classic pairing). Build a real scale (e.g. 12/14/16/18/24/32/48/64) rather than nudging sizes.
- Body: `line-height` 1.5–1.8, measure of **45–75 characters** (`max-width: ~60ch`). Display: tighter leading, consider negative letter-spacing on large sizes; positive tracking on small uppercase labels (0.06–0.14em).
- Weight and size carry hierarchy before color does. Avoid faux-bold; use real weights of a variable font.

## Color

- Start monochrome; add **one accent** with intent. Define tokens (CSS variables) — never hard-code hex twice.
- Meet **WCAG contrast** (4.5:1 body, 3:1 large text/UI). Test dark and light if both exist.
- Use opacity tiers of a single ink (e.g. 100/70/55/18%) for hierarchy and dividers instead of new colors.

## Interaction states — never ship without them

Every interactive element needs **default / hover / focus-visible / active / disabled**, plus **loading / empty / error** for data. `:focus-visible` must be clearly visible (keyboard users). Transitions on `color`/`background`/`transform` only — never on a property GSAP or JS is already animating (they fight).

## Detail pass (the difference between "fine" and "impeccable")

- Consistent **border-radius** across siblings; consistent border widths/colors.
- **Optical alignment** over mathematical (icons, punctuation, caps).
- No layout shift: reserve space for async content; avoid text reflow on state change.
- Crisp edges: avoid blurry 1px lines (half-pixel rounding), align to device pixels.
- Respect `prefers-reduced-motion`; ensure content is usable without JS/animation.
- Images: correct aspect-ratio boxes, `object-fit`, no distortion.

## Review checklist

1. Do all spacings/sizes/radii come from the scale?
2. Is contrast AA+ and is `:focus-visible` obvious?
3. Are hover/active/disabled/loading/empty/error all handled?
4. Does anything shift, jump, or reflow between states?
5. One accent, tokenized colors, consistent radii?
6. Is the type measure comfortable (≤ ~70ch) with generous leading?

Ship only when every box is checked.
