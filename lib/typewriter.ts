/**
 * Genuine, character-by-character typewriter.
 *
 * Appends `text` into `el` one character at a time at a natural, lightly
 * randomised cadence (spaces and punctuation included). Resolves once the
 * full string has been typed. Honours a `cancelled` predicate so an
 * unmount / reduced-motion switch can stop it cleanly mid-way.
 */
export function typeInto(
  el: HTMLElement,
  text: string,
  {
    minDelay = 70,
    maxDelay = 90,
    cancelled = () => false,
  }: { minDelay?: number; maxDelay?: number; cancelled?: () => boolean } = {}
): Promise<void> {
  return new Promise((resolve) => {
    let i = 0;
    el.textContent = "";

    const step = () => {
      if (cancelled()) return resolve();
      if (i >= text.length) return resolve();
      el.textContent += text.charAt(i);
      i += 1;
      const delay = minDelay + Math.random() * (maxDelay - minDelay);
      window.setTimeout(step, delay);
    };

    step();
  });
}

/** Promise-based delay that resolves early if `cancelled` becomes true. */
export function wait(ms: number, cancelled: () => boolean = () => false): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = () => {
      if (cancelled() || performance.now() - start >= ms) return resolve();
      window.setTimeout(tick, Math.min(50, ms));
    };
    tick();
  });
}
