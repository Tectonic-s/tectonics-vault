# Tectonics Vault — Antigravity Implementation Brief

## Agent instruction

You are modifying the existing Tectonics Vault portfolio at `https://tectonics-vault.vercel.app/`.

Implement the P0 and P1 items below without replacing the current visual identity. Preserve the editorial, monochrome, oversized-typography direction, scroll narrative, Journey chapter interaction, Skills panels, and Works card styling unless an item explicitly changes them.

Work in small, reviewable commits. Before changing code, inspect the existing component structure, routing, animation setup, and responsive breakpoints. Reuse existing components and tokens where possible. Do not introduce a new UI framework or rewrite the page into a generic template.

After implementation, validate at 320px, 375px, 430px, 768px, 1024px, 1280px, and 1440px widths. Also validate keyboard navigation, focus visibility, reduced motion, and the browser console.

## Definition of done

The work is complete only when:

- Existing visual direction remains recognizable.
- All interactive controls are keyboard reachable.
- Every focusable element has a meaningful accessible name.
- Navigation and project actions use semantic HTML.
- Reduced-motion users can consume all content without large animated transforms.
- Mobile navigation clearly exposes the current section and can be opened and closed.
- No horizontal overflow exists at the required viewport widths.
- No console errors are introduced.
- The implementation passes the acceptance criteria below.

## Implementation order

1. P0 accessibility and semantic structure.
2. P0 reduced-motion and mobile navigation.
3. P1 navigation state and interaction model.
4. P1 responsive and spacing refinement.
5. P2 visual-system polish only after the above is stable.

---

## P0-01 — Semantic document structure

**Problem:** The page has a `header` and `nav`, but the main portfolio experience is not clearly exposed as a `main` landmark. Section navigation and content need explicit structure.

**Required changes:**

- Wrap the primary portfolio experience in `<main>`.
- Use named sections for About, Journey, Skills, Works, and Contact/Let’s Talk.
- Add a real `<footer>` or named contact region for the final contact area.
- Ensure each major region has one meaningful heading.
- Preserve the current visual layout and animation behavior.

**Acceptance criteria:**

- Exactly one visible `<main>` landmark exists.
- Screen-reader landmark navigation exposes header, navigation, main, and final contact/footer regions.
- Each major content area can be reached without relying only on animation state.

---

## P0-02 — Replace non-semantic interactive elements

**Problem:** The current DOM includes clickable list items and focusable `div` elements used as controls or project cards.

**Required changes:**

- Use `<a>` for navigation to a section or project destination.
- Use `<button>` for in-page state changes such as Journey chapter selection.
- Remove `tabindex="0"` from non-interactive containers unless the element has a documented composite-widget role and keyboard behavior.
- Preserve existing hover and active animation styles.

**Acceptance criteria:**

- Every clickable control is a native link or button.
- Pressing Enter or Space activates buttons correctly.
- Pressing Enter activates links correctly.
- No clickable `div` or `li` remains in the primary interaction path.

---

## P0-03 — Accessible names and state

**Problem:** Multiple project actions are all named “Inspect,” and some controls have no accessible name or state.

**Required changes:**

- Give each project action a unique accessible name, for example `Inspect Nova Financial Engine`.
- Give the mobile navigation control an accessible name such as `Open section navigation`.
- Expose the mobile navigation state with `aria-expanded` and `aria-controls`.
- Add `aria-current="true"` to the active section control.
- Add an accessible name to the Journey chapter selector and expose the active chapter.
- Preserve visible labels unless a visually hidden label is required.

**Acceptance criteria:**

- Accessibility tree contains no unnamed focusable controls.
- Project actions are distinguishable by name.
- Active section and active Journey chapter are programmatically exposed.
- Automated accessibility checks do not report missing button/link names.

---

## P0-04 — Focus-visible styles and keyboard flow

**Problem:** Hover states are more apparent than keyboard focus states.

**Required changes:**

- Add a visible `:focus-visible` treatment for links, buttons, cards, and the mobile menu.
- Use a high-contrast outline or ring that is not clipped by card overflow.
- Ensure focus order follows the visual reading order.
- Ensure opening the mobile menu moves focus into the menu and closing it returns focus to the trigger.

**Acceptance criteria:**

- Tab navigation visibly identifies the current control.
- Focus is never trapped in an unreachable or hidden control.
- Keyboard users can reach every section, Journey chapter, project action, and contact action.

---

## P0-05 — Reduced-motion mode

**Problem:** The experience depends on scroll choreography, parallax, reveal transitions, hover movement, and large transforms.

**Required changes:**

Add a `prefers-reduced-motion: reduce` path that:

- Disables parallax and large scroll transforms.
- Disables character-by-character or staged text reveals.
- Removes nonessential hover movement.
- Keeps content visible in the correct order.
- Allows normal scrolling and direct navigation.

**Acceptance criteria:**

- With reduced motion enabled, all content is visible and usable.
- No content depends on an animation completing before it can be read.
- Keyboard and touch navigation behave the same or better than the default mode.

---

## P0-06 — Clarify mobile navigation

**Problem:** The mobile header control is labeled “Beyond,” which does not clearly explain its purpose.

**Required changes:**

- Rename the control to `Sections` or `Open navigation`.
- Open a compact menu or bottom sheet containing About, Journey, Skills, Works, Beyond Work, and Let’s Talk.
- Show the current section.
- Close the menu after selection.
- Support Escape to close.
- Preserve the current visual language and avoid a generic drawer appearance.

**Acceptance criteria:**

- At widths below the desktop navigation breakpoint, users can identify and open section navigation.
- The current section is visually and programmatically identifiable.
- Menu open/close behavior works with mouse, touch, keyboard, and Escape.
- The menu does not cause horizontal overflow.

---

## P1-01 — Unify navigation state

**Problem:** The left navigation communicates active state mainly through font size and color, while the top CTA and left Let’s Talk item have unclear relationship.

**Required changes:**

- Keep the large active label effect.
- Add one stable active marker, such as a short rule, dot, or numbered index.
- Add a small section counter such as `03 / 05` where space allows.
- Make the top Let’s Talk CTA and left Let’s Talk item resolve to the same destination.
- Keep inactive text readable and distinguishable from disabled text.

**Acceptance criteria:**

- At every section, the current location is obvious without relying only on font size.
- The top CTA and navigation item do not lead to conflicting destinations.
- Active state is exposed through `aria-current` or equivalent.

---

## P1-02 — Provide direct section navigation

**Problem:** The `700vh` scroll canvas makes the experience cinematic but slow to traverse.

**Required changes:**

- Keep the hero transition and Journey interaction.
- Add direct section selection from the section navigation.
- Add a visible next/previous affordance where appropriate.
- Do not force users to perform a long scroll sequence to reach Works or Contact.
- Respect reduced-motion mode by using direct jumps or normal flow.

**Acceptance criteria:**

- Every major section can be reached in one interaction from navigation.
- Back/forward browser behavior remains sensible if hash navigation is used.
- Direct navigation does not leave content visually hidden behind the fixed header.

---

## P1-03 — Make Journey controls explicit

**Problem:** Journey has four chapter controls and a chapter counter, but the interaction model is not fully explicit.

**Required changes:**

- Label the group as a Journey chapter selector.
- Mark the active chapter.
- Add accessible names containing chapter number and title.
- Add next/previous controls if they fit the existing design.
- Keep chapter content readable while transitions occur.

**Acceptance criteria:**

- Users can switch chapters with mouse, keyboard, and touch.
- Active chapter is visible and announced.
- The chapter counter matches the visible chapter.
- There is no loss of focus during chapter changes.

---

## P1-04 — Choose one Works-card interaction model

**Problem:** Works currently communicates both “Click card to inspect” and an Inspect button.

**Required changes:**

Choose one model:

- **Preferred:** make the whole card a link, retain a visible Inspect label as a decorative or supplementary cue, and use a unique accessible name; or
- Keep the card non-clickable and make Inspect the only action.

Do not keep two competing click targets for the same destination.

**Acceptance criteria:**

- The interaction model is obvious without hover.
- Each project has one primary destination.
- Cards remain usable by keyboard and touch.
- Project title, image, and action have a coherent accessible relationship.

---

## P1-05 — Responsive QA and layout protection

**Required changes:**

Test and correct the following at 320px, 375px, 430px, 768px, 1024px, 1280px, and 1440px:

- Hero heading wrapping.
- Header CTA and menu spacing.
- Journey chapter selector tap targets.
- Journey card text and score badge collisions.
- Skills card stacking and readable spacing.
- Works card image, title, description, tags, and action alignment.
- Fixed header overlap after direct section navigation.

**Acceptance criteria:**

- No horizontal scroll at any required width.
- Touch targets are at least 44px where practical.
- No text overlaps, clipped labels, or unreachable controls.
- The design remains recognizably the same at all breakpoints.

---

## P2 — Design-system polish

Implement only after P0 and P1 are complete:

- Define typography roles for display, section title, card title, eyebrow, body, metadata, and action.
- Define spacing tokens and use them consistently.
- Define semantic accent tokens for Journey and Skills.
- Standardize card radius, border, shadow, tag, and button variants.
- Replace generic Unsplash covers with project-specific screenshots or art-directed covers using one crop ratio.
- Lazy-load below-the-fold images and confirm the hero does not wait for all project imagery.

## Suggested token baseline

```css
:root {
  --bg: #f7f7f5;
  --ink: #0a0a0a;
  --muted: #767676;
  --line: rgba(0, 0, 0, 0.1);
  --radius-card: 1.25rem;
  --radius-pill: 999px;
  --space-section: clamp(4rem, 10vw, 9rem);
  --text-display: clamp(2.75rem, 8.4vw, 7rem);
  --text-section: clamp(2.75rem, 6vw, 4.4rem);
  --text-card: clamp(1.05rem, 1.8vw, 1.35rem);
  --text-body: clamp(0.875rem, 1.2vw, 1rem);
}
```

## Validation checklist

- [ ] One `<main>` landmark exists.
- [ ] Header, navigation, main, and footer/contact landmarks are exposed.
- [ ] No clickable `div` or `li` remains in the primary interaction path.
- [ ] Every button and link has an accessible name.
- [ ] Every project action is unique by accessible name.
- [ ] `aria-current` identifies the active section and Journey chapter.
- [ ] Focus-visible styles are present and high contrast.
- [ ] Mobile navigation has `aria-expanded`, `aria-controls`, Escape support, and focus return.
- [ ] Reduced-motion mode removes nonessential transforms and reveals all content.
- [ ] Direct navigation reaches every major section.
- [ ] Journey chapter switching works with keyboard and touch.
- [ ] Works cards have one clear interaction model.
- [ ] No horizontal overflow at all required widths.
- [ ] No console errors.
- [ ] Existing visual identity is preserved.

## Copy-paste prompt for Antigravity

```text
Use /home/ubuntu/tectonics-vault-antigravity-brief.md as the implementation specification for the existing Tectonics Vault portfolio.

First inspect the existing source and identify the components responsible for the header, section navigation, scroll choreography, Journey selector, Skills panels, Works cards, and contact area. Then implement the requirements in this document in the stated order. Preserve the current visual identity and animation direction. Do not rewrite the site into a generic template.

After each implementation group, run the project's existing checks. Before finishing, validate keyboard navigation, focus-visible styles, reduced-motion behavior, mobile navigation, all listed viewport widths, horizontal overflow, and browser console output. Report changed files, remaining caveats, and validation results.
```

## Source audit

The implementation brief is derived from the live UI audit of [Tectonics Vault](https://tectonics-vault.vercel.app/). The original visual audit remains available in `/home/ubuntu/tectonics-vault-ui-audit.md`.
