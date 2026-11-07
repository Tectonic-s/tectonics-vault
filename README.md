# Vault.

The opening experience for the **Vault** portfolio — a single, uninterrupted
cinematic sequence that transforms the hero title *“Welcome to the Vault.”* into
the persistent **Vault.** navigation logo as the visitor begins to scroll.

## Stack

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS v4**
- **GSAP + ScrollTrigger** — intro choreography and the scroll-driven transition
- **Lenis** — smooth scrolling, wired to `gsap.ticker`
- **Excon** & **Ranade** (Fontshare) — bundled locally in `public/fonts`

## The sequence

1. **Black screen, no chrome, scroll locked.** After ~300 ms the hero heading is
   typed character-by-character (real typewriter, ~35–45 ms/char) with a blinking
   caret; the caret blinks twice, then is removed.
2. The subtitle types with identical behaviour, then the underline **draws left → right**
   and settles into a **connected** down-arrow that bounces gently as the scroll cue.
   The stem’s top stays welded to the underline and its bottom stretches with the
   chevron, so the arrow never detaches.
3. **Only then is scrolling enabled.**
4. On scroll, the hero scrolls away as the About panel rolls up. The word **“Vault.”**
   detaches and travels into the top-left as the permanent nav logo (a single element —
   never two copies), *“Welcome to the”* fades up and away.
5. As the section settles: **Let’s Talk** fades in, the nav items stagger up, the
   profile scales `0.95 → 1`, then the name and copy stagger in.

The “Vault.” flight is a measured **FLIP** (`getBoundingClientRect` → `x/y/scale`) so a
single element scrubs pixel-perfectly from the hero into the nav slot. An invisible
`Vault.` placeholder in the nav reserves the landing target and keeps the layout honest.

`prefers-reduced-motion` is respected: the typewriter, arrow bounce and auto-motion are
skipped; the scroll transition remains user-driven.

## Run

```bash
npm run dev
```

## Swapping the placeholder portrait

`components/ProfileSilhouette.tsx` renders an inline SVG placeholder. Replace it with a
real photo via `next/image` — the rounded, cream-bordered frame lives in `Experience.tsx`.
