---
name: emil-kowalski-design
description: Principles for crafting web animation and micro-interactions in the spirit of Emil Kowalski (Sonner, Vaul, "Animations on the Web"). Use when adding or reviewing motion — transitions, hovers, drawers/toasts/modals, scroll-driven or state-driven animation — in CSS/JS/GSAP/Framer Motion. Pairs with impeccable-design (execution) and taste (judgment).
---

# Emil Kowalski — Design & Motion

Great motion is felt, not noticed. It should make an interface feel **fast, physical, and alive** without ever drawing attention to itself. If an animation makes you think "nice animation," it's usually too much. Motion is communication, not decoration.

## Core beliefs

1. **Purpose first.** Every animation must answer *what does this help the user understand?* — where something came from, where it went, that an action registered, how two states relate. No purpose, no animation.
2. **Fast by default.** Most UI transitions live in **150–300ms**. Enter can be a touch slower than the eye expects; exit should be quicker (get out of the way). Anything over ~500ms for a functional transition feels sluggish.
3. **Easing is the whole personality.**
   - **Enter / appear → `ease-out`** (fast start, gentle settle). Custom: `cubic-bezier(0.16, 1, 0.3, 1)`.
   - **Exit / disappear → `ease-in`** (accelerate away).
   - **Move / reposition → `ease-in-out`.**
   - **Never `linear`** except for continuous loops (spinners, marquees, ambient).
   - Reach for **springs** when motion should feel physical (drags, drawers, playful toggles) — tune for little/no overshoot in productivity UI.
4. **Animate the cheap properties.** `transform` and `opacity` only (GPU-composited, 60fps). Avoid animating `width`, `height`, `top/left`, `margin`, `box-shadow`, `filter` in hot paths — they trigger layout/paint and drop frames. Use `transform: translate/scale` and, for size morphs, FLIP.
5. **Origin & continuity.** Things should animate **from where they belong**: a menu scales from its trigger's corner (`transform-origin`), a toast slides from the edge it lives on, a detail expands from the card you clicked. Shared elements should feel like *the same object moving*, not one thing replaced by another.
6. **Interruptible, always.** Never lock the user out mid-animation. New input must redirect motion smoothly (springs and `ease-out` handle this well). Queued, un-cancelable animations feel broken.
7. **Overlap, don't sequence rigidly.** Real motion overlaps — a new element can start entering before the old one finishes leaving. Stagger groups by **~50–80ms** so lists/content feel *revealed*, not dumped. But keep total choreography short.
8. **Restraint.** Not everything should move. One or two intentional moments per view beats constant motion. Silence between animations is what makes them land.
9. **Depth with scale + blur + opacity.** Subtle `scale(0.96→1)` + fade reads as "arriving from behind glass." A few px of blur on exit adds softness. Keep it barely-there.
10. **Accessibility is non-negotiable.** Honor `prefers-reduced-motion`: replace movement with a plain fade (or nothing) and never gate content or function behind an animation.

## Recipes

- **Modal/menu enter:** `opacity 0→1`, `scale 0.96→1`, `translateY 8→0`, 200ms `cubic-bezier(0.16,1,0.3,1)`, origin at the trigger. Exit: reverse in ~150ms `ease-in`.
- **Toast:** slide + fade from the edge, spring; swipe-to-dismiss follows the finger 1:1, releases with spring.
- **Hover (buttons/cards):** `transform: translateY(-1px) scale(1.01)` + subtle bg shift, 150ms `ease-out`; press → `scale(0.98)` fast. Always transition `transform`, not layout.
- **Scroll-driven:** tie progress directly to scroll (scrubbed) so it reverses perfectly; keep it 1:1 and calm. Reveal content with a short fade+rise, never a long slide.
- **Content swap / "page turn":** old lifts ~20px + fades (fast), new rises ~20px + fades with a 60–80ms stagger across title → meta → body.

## Smell test

- Does removing this animation lose meaning? If no → remove it.
- Is it under ~300ms and interruptible?
- Is it only `transform`/`opacity`?
- Does it start from the right origin?
- Does it degrade to a fade under reduced-motion?

If motion is fast, purposeful, physical, and quiet — it's right.
