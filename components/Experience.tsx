"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { typeInto, wait } from "@/lib/typewriter";
import ProfileSilhouette from "./ProfileSilhouette";
import JourneyIcon from "./JourneyIcons";

gsap.registerPlugin(ScrollTrigger);

/* Type sizes shared between the hero "Vault." and the flying logo so they
   scale into each other pixel-perfectly. */
const HEADING_SIZE = "clamp(2rem, 8.4vw, 7rem)";
const NAV_VAULT_SIZE = "clamp(1.5rem, 2.6vw, 2.15rem)";

/* Accordion menu sizes — fixed rem so GSAP can interpolate them. */
const MENU_ACTIVE = "4.4rem";
const MENU_SMALL = "1.5rem";

const HERO_PRE = "Welcome to the ";
const HERO_VAULT = "Vault.";
const SUBTITLE = "Scroll Down to explore";

const MENU = [
  { key: "about", label: "About" },
  { key: "journey", label: "Journey" },
  { key: "craft", label: "Craft" },
  { key: "works", label: "Works" },
  { key: "beyond", label: "Beyond Work" },
  { key: "talk", label: "Let’s Talk." },
];

/* The four chapters of the Journey timeline. Fields are split for an
   editorial hierarchy: metric = pull-quote statistic, primary = institution /
   company, secondary = supporting metadata (degree / role / dates).
   `skills` are the achievements unlocked by that chapter — they are the
   single source of truth for everything the Craft section displays. */
const JOURNEY = [
  {
    icon: "backpack" as const,
    title: "Pre-Graduate",
    metric: "89",
    metricUnit: "%",
    metricLabel: "",
    primary: "A.M.Jain School",
    secondary: "Higher Secondary",
    skills: ["Curiosity", "Discipline", "Continuous Learning"],
    body:
      "Every story has a beginning. Mine started in a classroom, where curiosity slowly grew into a passion for learning, creating, and solving problems. Those early years became the foundation for everything that followed.",
  },
  {
    icon: "gradcap" as const,
    title: "Under-Graduate",
    metric: "8.1",
    metricUnit: "",
    metricLabel: "CGPA",
    primary: "Guru Nanak College",
    secondary: "B.Sc Data Analytics",
    skills: ["Analytical Thinking", "Data Analysis", "Problem Solving", "Research"],
    body:
      "This was the chapter where curiosity found direction. Through data, technology, and countless hands-on projects, I learned to approach problems with logic, creativity, and a desire to build solutions that make an impact.",
  },
  {
    icon: "briefcase" as const,
    title: "Corporate Life",
    metric: "",
    metricUnit: "",
    metricLabel: "",
    primary: "Bajaj Finserv",
    secondary: "Deputy Manager · Jan 25 – Jul 25",
    skills: ["Communication", "Leadership", "Negotiation", "Client Management", "Business Strategy"],
    body:
      "Leading sales taught me that every conversation begins with understanding people. Managing relationships, solving customer problems, and taking ownership of results helped me build confidence, adaptability, and a stronger business mindset.",
  },
  {
    icon: "gradcap" as const,
    title: "Post Graduate",
    metric: "7.8",
    metricUnit: "",
    metricLabel: "CGPA",
    primary: "PSG College of Technology",
    secondary: "MCA",
    skills: ["Software Engineering", "System Design", "Full Stack Development", "Modern Development Practices"],
    body:
      "Returning to academia marked the beginning of a new chapter. With a stronger foundation and real-world experience behind me, I am now deepening my understanding of software engineering, system design, and modern application development.",
  },
];

/* Craft renders ONLY what the Journey earned: each cabinet category maps
   1:1 to the chapter whose achievements it stores, so the visitor can trace
   every skill back to the moment they watched it being unlocked. */
const CRAFT_CATEGORIES = [
  { name: "Core Traits", chapter: 0 },
  { name: "Analytical Skills", chapter: 1 },
  { name: "Professional Practice", chapter: 2 },
  { name: "Engineering", chapter: 3 },
];

export default function Experience() {
  const root = useRef<HTMLDivElement>(null);

  // Hero
  const heroPre = useRef<HTMLSpanElement>(null);
  const heroVaultInline = useRef<HTMLSpanElement>(null);
  const heroCaret = useRef<HTMLSpanElement>(null);
  const scrollIndicator = useRef<HTMLDivElement>(null);
  const subtitleText = useRef<HTMLSpanElement>(null);
  const subtitleCaret = useRef<HTMLSpanElement>(null);
  const ulPath = useRef<SVGPathElement>(null);
  const arrowStem = useRef<SVGLineElement>(null);
  const arrowHead = useRef<SVGPathElement>(null);

  // Nav
  const navGhost = useRef<HTMLSpanElement>(null);
  const vaultFloat = useRef<HTMLSpanElement>(null);
  const letsTalk = useRef<HTMLButtonElement>(null);

  // Main panel (About + Journey share it)
  const mainPanel = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLUListElement>(null);
  const aboutRight = useRef<HTMLDivElement>(null);
  const profile = useRef<HTMLDivElement>(null);
  const aboutName = useRef<HTMLHeadingElement>(null);
  const aboutPara = useRef<HTMLParagraphElement>(null);
  const journeyRight = useRef<HTMLDivElement>(null);
  const craftRight = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    const isCancelled = () => cancelled;
    // Achievement-card timeline lives outside the gsap context: it is created
    // lazily inside scroll callbacks, so it must be killed explicitly.
    let cardTl: gsap.core.Timeline | null = null;
    // Gesture listeners for the locked Journey archive, removed on unmount.
    let journeyListeners: (() => void) | null = null;

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const lockScroll = () => {
      document.documentElement.classList.add("vault-locked");
      lenis.stop();
    };
    const unlockScroll = () => {
      document.documentElement.classList.remove("vault-locked");
      lenis.start();
    };

    // Hero "Vault." → nav-logo flight measurement.
    const flip = { sx: 0, sy: 0, ex: 0, ey: 0, es: 1 };
    const measure = () => {
      if (!heroVaultInline.current || !navGhost.current) return;
      const from = heroVaultInline.current.getBoundingClientRect();
      const to = navGhost.current.getBoundingClientRect();
      flip.sx = from.left;
      flip.sy = from.top;
      flip.ex = to.left;
      flip.ey = to.top;
      flip.es = to.height / from.height;
    };

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const at = (arr: Element[], i: number): Element | null => arr[i] ?? null;
      const kids = (el: Element | null): Element[] => (el ? Array.from(el.children) : []);

      const menuItems = menu.current?.querySelectorAll("li") ?? [];
      const mAbout = menu.current?.querySelector('[data-key="about"]') ?? null;
      const mJourney = menu.current?.querySelector('[data-key="journey"]') ?? null;

      const iconLayers = q("[data-icon]");
      const textBlocks = q("[data-jtext]");
      const trackDots = q("[data-dot]");
      const upcoming = q("[data-upcoming]");
      const mile = q("[data-milestone]")[0] ?? null;
      const glow = q("[data-glow]")[0] ?? null;
      const breathe = q("[data-breathe]")[0] ?? null;
      const chnums = q("[data-chnum]");
      const particle = q("[data-particle]")[0] ?? null;
      const blobs = q("[data-blob]");
      const mCraft = menu.current?.querySelector('[data-key="craft"]') ?? null;
      const achCard = (q("[data-achievement]")[0] as HTMLElement | undefined) ?? null;
      const achLabel = q("[data-ach-label]")[0] ?? null;
      const achSets = q("[data-ach-set]") as HTMLElement[];
      const craftCount = (q("[data-craft-count]")[0] as HTMLElement | undefined) ?? null;

      // Running total of skills stored in the Vault, by chapter.
      const skillsThrough = (i: number) =>
        JOURNEY.slice(0, i + 1).reduce((n, s) => n + s.skills.length, 0);
      const craftCards = q("[data-craft-card]") as HTMLElement[];

      // ---------------- Achievement Unlocked system ----------------
      // Invisible collection: which chapters' skills have been earned.
      // Unlocks persist for the whole visit — never revoked on scroll-back.
      const unlocked = [false, false, false, false];

      const showCard = (i: number) => {
        if (!achCard || !mCraft) return;
        cardTl?.progress(1).kill();
        achSets.forEach((el, j) => {
          el.style.display = j === i ? "block" : "none";
        });
        const items = Array.from(achSets[i]?.querySelectorAll("[data-ach-item]") ?? []);
        const checks = Array.from(achSets[i]?.querySelectorAll("[data-ach-check]") ?? []);
        const labels = Array.from(achSets[i]?.querySelectorAll("[data-ach-name]") ?? []);
        gsap.set(achCard, { clearProps: "x,y,scale" });
        gsap.set(achCard, { opacity: 0, y: 14, scale: 0.97, transformOrigin: "50% 50%" });
        gsap.set(achLabel, { opacity: 0, y: 8 });
        gsap.set(items, { opacity: 0 });
        gsap.set(checks, { opacity: 0, scale: 0.4 });
        gsap.set(labels, { opacity: 0, x: -10, filter: "blur(6px)" });
        cardTl = gsap.timeline();

        if (reduced) {
          // Reduced motion: a quiet fade in place — no travel, no stagger.
          cardTl
            .to(achCard, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power1.out" })
            .set([items, checks], { opacity: 1, scale: 1 }, "<")
            .to([achLabel, ...labels], { opacity: 1, x: 0, y: 0, filter: "blur(0px)", duration: 0.3 }, "<")
            .to(achCard, { opacity: 0, duration: 0.3, ease: "power1.in" }, "+=3");
          return;
        }

        cardTl
          // 1) The card shell arrives like a quiet notification.
          .to(achCard, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "expo.out" })
          .to(achLabel, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, "-=0.18")
          .set(items, { opacity: 1 })
          // 2) Each achievement is earned one at a time, unhurried: the mark
          //    strikes first, then the name resolves out of a soft blur —
          //    a list being written rather than a block appearing.
          .to(
            checks,
            { opacity: 1, scale: 1, duration: 0.34, stagger: 0.34, ease: "back.out(2.2)" },
            "-=0.04"
          )
          .to(
            labels,
            { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.5, stagger: 0.34, ease: "power2.out" },
            "<0.08"
          )
          // 3) The whole block is held to be read, then travels into the Vault:
          //    shrinking toward the Craft menu item. The target is measured at
          //    departure time, so it is always exact.
          .to(
            achCard,
            {
              x: () => {
                const c = achCard.getBoundingClientRect();
                const m = (mCraft as HTMLElement).getBoundingClientRect();
                return m.left + m.width / 2 - (c.left + c.width / 2);
              },
              y: () => {
                const c = achCard.getBoundingClientRect();
                const m = (mCraft as HTMLElement).getBoundingClientRect();
                return m.top + m.height / 2 - (c.top + c.height / 2);
              },
              scale: 0.08,
              duration: 0.85,
              ease: "power2.inOut",
            },
            "+=1.6"
          )
          .to(achCard, { opacity: 0, duration: 0.26, ease: "power1.in" }, "-=0.3")
          // 4) The Craft label softly glows as the block is stored.
          .fromTo(
            mCraft,
            { textShadow: "0 0 16px rgba(244,231,168,0.75)", color: "var(--vault-cream)" },
            {
              textShadow: "0 0 0px rgba(244,231,168,0)",
              color: "var(--vault-gold-dim)",
              duration: 0.9,
              ease: "power2.out",
            },
            "-=0.12"
          )
          // 5) The tally absorbs the new skills and ticks up.
          .add(() => {
            if (craftCount) craftCount.textContent = String(skillsThrough(i));
          }, "<")
          .fromTo(
            craftCount,
            { scale: 0.4, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(2.4)" },
            "<"
          );
      };

      // -------- Starting states --------
      gsap.set(mainPanel.current, { yPercent: 100 });
      gsap.set(vaultFloat.current, { opacity: 0, transformOrigin: "left top" });
      gsap.set([ulPath.current, arrowStem.current, arrowHead.current], { opacity: 0 });

      gsap.set(mAbout, { fontSize: MENU_ACTIVE, color: "var(--vault-cream)" });
      gsap.set(mJourney, { fontSize: MENU_SMALL, color: "var(--vault-gold-dim)" });

      gsap.set(journeyRight.current, { opacity: 0, y: 34 });
      gsap.set(craftRight.current, { opacity: 0, y: 34 });
      // Craft cards start blank: no card, no border, no contents.
      gsap.set(q("[data-craft-card]"), { opacity: 0 });
      gsap.set(q("[data-craft-trace]"), { strokeDashoffset: 100, strokeOpacity: 1 });
      gsap.set(q("[data-craft-head]"), { opacity: 0, y: 12 });
      gsap.set(q("[data-craft-check]"), { opacity: 0, scale: 0.4 });
      gsap.set(q("[data-craft-name]"), { opacity: 0, x: -10, filter: "blur(6px)" });
      gsap.set(mile, { scale: 1, transformOrigin: "50% 50%" });
      gsap.set(glow, { opacity: 0.65 });
      // Only the first chapter is active to begin with.
      iconLayers.forEach((el, i) => gsap.set(el, { opacity: i === 0 ? 1 : 0 }));
      textBlocks.forEach((el, i) => gsap.set(el, { opacity: i === 0 ? 1 : 0 }));
      chnums.forEach((el, i) => gsap.set(el, { opacity: i === 0 ? 1 : 0 }));
      gsap.set(particle, { opacity: 0 });

      // Ambient light drift — almost subconscious. Skipped for reduced motion.
      if (!reduced) {
        gsap.to(blobs[0] ?? null, {
          x: "9vw",
          y: "7vh",
          duration: 26,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
        gsap.to(blobs[1] ?? null, {
          x: "-8vw",
          y: "-9vh",
          duration: 34,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      // Subtle, continuous "breathing" + gentle float on the active milestone.
      // Autoplay motion — skipped for reduced-motion users.
      if (!reduced) {
        gsap.to(breathe, {
          scale: 1.045,
          y: -3,
          duration: 2.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          transformOrigin: "50% 50%",
        });
      }

      // ======== PHASE 1 — hero → About (scrubbed) ========
      // The About reveal is folded into this scrubbed timeline (not a separate
      // played timeline), so it is purely scroll-driven, always visible by the
      // end of phase 1, and perfectly reversible.
      const spatial = gsap.timeline({ defaults: { ease: "none" } });
      spatial
        .fromTo(
          vaultFloat.current,
          { x: () => flip.sx, y: () => flip.sy, scale: 1 },
          { x: () => flip.ex, y: () => flip.ey, scale: () => flip.es, duration: 0.7 },
          0
        )
        .to(heroPre.current, { yPercent: -60, opacity: 0, duration: 0.42 }, 0)
        .to(scrollIndicator.current, { y: -30, opacity: 0, duration: 0.38 }, 0)
        .to(mainPanel.current, { yPercent: 0, duration: 0.7 }, 0)
        // About content reveals as the panel settles.
        .fromTo(letsTalk.current, { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: "power3.out" }, 0.7)
        .fromTo(menuItems, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power3.out" }, 0.72)
        .fromTo(profile.current, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.34, ease: "power3.out" }, 0.75)
        .fromTo(
          [aboutName.current, aboutPara.current],
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.34, stagger: 0.08, ease: "power3.out" },
          0.8
        );

      const swapToFloat = () => {
        gsap.set(heroVaultInline.current, { opacity: 0 });
        gsap.set(vaultFloat.current, { opacity: 1 });
        heroCaret.current?.setAttribute("data-blink", "false");
      };
      const swapToInline = () => {
        gsap.set(vaultFloat.current, { opacity: 0 });
        gsap.set(heroVaultInline.current, { opacity: 1 });
      };

      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: () => "+=" + window.innerHeight,
        scrub: true,
        invalidateOnRefresh: true,
        animation: spatial,
        onRefresh: measure,
        onEnter: swapToFloat,
        onLeaveBack: swapToInline,
      });

      // ======== PHASE 2a — About → Journey (scrubbed) ========
      // A leading hold keeps About readable, then the panel swaps to the
      // archive. Chapter *content* is owned by the machine below, so this
      // timeline only handles the section switch.
      const enter = gsap.timeline();
      enter
        .to(mAbout, { fontSize: MENU_SMALL, color: "var(--vault-gold-dim)", duration: 0.9, ease: "power2.inOut" }, 1.1)
        .to(mJourney, { fontSize: MENU_ACTIVE, color: "var(--vault-cream)", duration: 0.9, ease: "power2.inOut" }, 1.1)
        .to(aboutRight.current, { opacity: 0, y: -34, duration: 0.5, ease: "power2.in" }, 1.1)
        .to(journeyRight.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 1.52)
        .to({}, { duration: 0.5 });

      ScrollTrigger.create({
        trigger: root.current,
        start: () => "top+=" + window.innerHeight + " top",
        end: () => "top+=" + window.innerHeight * 2 + " top",
        scrub: true,
        animation: enter,
      });

      // ======== PHASE 2b — Journey chapters: one swipe, one chapter ========
      // While the archive is open scrolling is locked, so a single gesture
      // advances exactly one chapter and the visitor can never fly past one.
      // Each transition is followed by a brief pause before the next gesture
      // is accepted.
      const DOT_BASE = 0.25;
      const LAST = JOURNEY.length - 1;
      const PAUSE = 0.5; // seconds of quiet after a chapter lands

      // Place the UI at a chapter instantly (entry / re-entry / resize).
      const setChapter = (i: number) => {
        chnums.forEach((el, j) => gsap.set(el, { opacity: j === i ? 1 : 0 }));
        iconLayers.forEach((el, j) => gsap.set(el, { opacity: j === i ? 1 : 0 }));
        textBlocks.forEach((el, j) => {
          gsap.set(el, { opacity: j === i ? 1 : 0, y: 0 });
          gsap.set(kids(el), { opacity: 1, y: 0 });
        });
        upcoming.forEach((el, j) =>
          gsap.set(el, { opacity: j < i ? 0 : 0.35, scale: j < i ? 0.5 : 1 })
        );
        gsap.set(trackDots, { opacity: DOT_BASE + 0.1 * i, scale: 1 });
        gsap.set(mile, { scale: 1 });
        gsap.set(glow, { opacity: 0.65 });
        gsap.set(particle, { opacity: 0 });
      };

      // The chapter-to-chapter choreography, played (not scrubbed).
      const chapterTl = (from: number, to: number) => {
        const fwd = to > from;
        return gsap
          .timeline()
          // 1) A glowing particle carries progress down the line while the dots
          //    pulse beneath it — energy travelling, not a fade.
          .fromTo(
            particle,
            { y: fwd ? 96 : 312, opacity: 0 },
            { y: fwd ? 312 : 96, opacity: 1, duration: 0.55, ease: "power1.inOut" },
            0
          )
          .to(particle, { opacity: 0, duration: 0.14, ease: "power1.out" }, 0.48)
          .to(
            trackDots,
            {
              keyframes: { opacity: [0.3, 1, 0.3], scale: [1, 1.5, 1] },
              duration: 0.6,
              stagger: fwd ? 0.05 : -0.05,
              ease: "sine.inOut",
            },
            0
          )
          .to(trackDots, { opacity: DOT_BASE + 0.1 * to, duration: 0.35, ease: "power1.inOut" }, 0.75)
          // The chapter number dissolves into the next.
          .to(at(chnums, from), { opacity: 0, duration: 0.3, ease: "power1.inOut" }, 0.4)
          .to(at(chnums, to), { opacity: 1, duration: 0.4, ease: "power1.inOut" }, 0.62)
          // 2) Previous milestone shrinks + loses its glow.
          .to(mile, { scale: 0.9, duration: 0.28, ease: "power2.inOut" }, 0.32)
          .to(glow, { opacity: 0, duration: 0.28, ease: "power2.in" }, 0.32)
          // Icon cross-fades at the low point (never an abrupt swap).
          .to(at(iconLayers, from), { opacity: 0, duration: 0.2, ease: "power1.inOut" }, 0.5)
          .to(at(iconLayers, to), { opacity: 1, duration: 0.2, ease: "power1.inOut" }, 0.5)
          // 3) New milestone scales back with a subtle overshoot + glow pulse.
          .to(mile, { scale: 1, duration: 0.5, ease: "back.out(1.5)" }, 0.58)
          .to(glow, { opacity: 1, duration: 0.22, ease: "power2.out" }, 0.58)
          .to(glow, { opacity: 0.65, duration: 0.45, ease: "power2.inOut" }, 0.8)
          // Consume (or restore) the upcoming-milestone marker.
          .to(
            at(upcoming, fwd ? to - 1 : to),
            { opacity: fwd ? 0 : 0.35, scale: fwd ? 0.5 : 1, duration: 0.4, ease: "power2.inOut" },
            0.48
          )
          // 4) Page-turn: old content lifts + fades, new rises in staggered.
          .to(at(textBlocks, from), { y: -20, opacity: 0, duration: 0.3, ease: "power2.in" }, 0.6)
          .set(at(textBlocks, to), { opacity: 1 }, 0.92)
          .fromTo(
            kids(at(textBlocks, to)),
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.42, stagger: 0.07, ease: "power3.out" },
            0.92
          );
      };

      let chapter = 0;
      let busy = false;
      let jLocked = false;
      let lastGesture = 0;

      const lockJourney = (entryChapter: number) => {
        if (jLocked) return;
        jLocked = true;
        chapter = entryChapter;
        setChapter(entryChapter);
        if (!unlocked[entryChapter]) {
          unlocked[entryChapter] = true;
          showCard(entryChapter);
        }
        lenis.stop();
      };

      const releaseJourney = () => {
        if (!jLocked) return;
        jLocked = false;
        lenis.start();
      };

      const advance = (dir: 1 | -1) => {
        if (busy) return;
        const next = chapter + dir;
        // Past either end of the archive, hand control back to the scroll.
        if (next < 0 || next > LAST) {
          releaseJourney();
          return;
        }
        busy = true;
        const from = chapter;
        chapter = next;
        chapterTl(from, next).eventCallback("onComplete", () => {
          if (dir === 1 && !unlocked[next]) {
            unlocked[next] = true;
            showCard(next);
          }
          // Brief pause: the chapter is allowed to settle and be read before
          // another gesture is accepted.
          gsap.delayedCall(PAUSE, () => {
            busy = false;
          });
        });
      };

      // One wheel burst / one swipe = one chapter. `busy` swallows trackpad
      // momentum, and the time gate stops a long flick counting twice.
      const onWheel = (e: WheelEvent) => {
        if (!jLocked) return;
        e.preventDefault();
        if (busy || Math.abs(e.deltaY) < 6) return;
        const now = performance.now();
        if (now - lastGesture < 620) return;
        lastGesture = now;
        advance(e.deltaY > 0 ? 1 : -1);
      };

      let touchStartY = 0;
      const onTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0]?.clientY ?? 0;
      };
      const onTouchMove = (e: TouchEvent) => {
        if (jLocked) e.preventDefault();
      };
      const onTouchEnd = (e: TouchEvent) => {
        if (!jLocked || busy) return;
        const dy = touchStartY - (e.changedTouches[0]?.clientY ?? touchStartY);
        if (Math.abs(dy) < 40) return;
        advance(dy > 0 ? 1 : -1);
      };
      // Keyboard parity — the archive must be navigable without a wheel.
      const onKey = (e: KeyboardEvent) => {
        if (!jLocked) return;
        if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
          e.preventDefault();
          advance(1);
        } else if (e.key === "ArrowUp" || e.key === "PageUp") {
          e.preventDefault();
          advance(-1);
        }
      };

      if (!reduced) {
        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("touchend", onTouchEnd, { passive: true });
        window.addEventListener("keydown", onKey);
        journeyListeners = () => {
          window.removeEventListener("wheel", onWheel);
          window.removeEventListener("touchstart", onTouchStart);
          window.removeEventListener("touchmove", onTouchMove);
          window.removeEventListener("touchend", onTouchEnd);
          window.removeEventListener("keydown", onKey);
        };

        // Engage the lock once the archive is fully open; entering from below
        // resumes at the last chapter so backtracking feels continuous.
        ScrollTrigger.create({
          trigger: root.current,
          start: () => "top+=" + window.innerHeight * 2 + " top",
          end: () => "top+=" + window.innerHeight * 2.35 + " top",
          onEnter: () => lockJourney(0),
          onEnterBack: () => lockJourney(LAST),
          onLeaveBack: releaseJourney,
        });
      } else {
        setChapter(0);
      }

      // ======== PHASE 3 — Journey → Craft (scrubbed) ========
      // Craft is the cabinet: it reveals the accumulated achievements, category
      // by category, each mapping to the chapter that earned it.
      // The section switch stays scroll-driven so it feels connected.
      const craft = gsap.timeline();
      const CH = 0.6; // leading hold so Journey 4 stays readable
      craft
        .to(mJourney, { fontSize: MENU_SMALL, color: "var(--vault-gold-dim)", duration: 0.9, ease: "power2.inOut" }, CH)
        .to(mCraft, { fontSize: MENU_ACTIVE, color: "var(--vault-cream)", duration: 0.9, ease: "power2.inOut" }, CH)
        .to(journeyRight.current, { opacity: 0, y: -34, duration: 0.5, ease: "power2.in" }, CH)
        .to(craftRight.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, CH + 0.42)
        .to({}, { duration: 0.5 });

      // The cabinet opens on its own once the section settles — the visitor
      // never has to scroll the contents in. One card at a time: its border is
      // traced in, then its skills are retrieved one by one, then the next.
      const cabinet = gsap.timeline({ paused: true });
      craftCards.forEach((card) => {
        const trace = card.querySelector("[data-craft-trace]");
        const head = card.querySelector("[data-craft-head]");
        const checks = card.querySelectorAll("[data-craft-check]");
        const names = card.querySelectorAll("[data-craft-name]");
        cabinet
          .to(card, { opacity: 1, duration: 0.3, ease: "power2.out" })
          // The border draws itself around the card.
          .to(trace, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, "<")
          .to(head, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, "<0.5")
          // Each skill is retrieved: the mark strikes, the name resolves.
          .to(checks, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.22, ease: "back.out(2.2)" }, "<0.15")
          .to(
            names,
            { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.45, stagger: 0.22, ease: "power2.out" },
            "<0.06"
          )
          // The traced edge settles back to a quietly lit border.
          .to(trace, { strokeOpacity: 0.4, duration: 0.6, ease: "power2.out" }, "<0.2");
      });
      // Everything is back in the Vault — the tally pops on the Craft title.
      // The total is asserted here so the badge is always right on arrival,
      // however the visitor reached this section.
      cabinet
        .add(() => {
          if (craftCount) craftCount.textContent = String(skillsThrough(JOURNEY.length - 1));
          gsap.set(craftCount, { opacity: 1 });
        }, ">-0.1")
        .to(craftCount, { scale: 1.35, duration: 0.28, ease: "back.out(3)" })
        .to(craftCount, { scale: 1, duration: 0.4, ease: "power2.out" })
        .fromTo(
          mCraft,
          { textShadow: "0 0 20px rgba(244,231,168,0.7)" },
          { textShadow: "0 0 0px rgba(244,231,168,0)", duration: 0.9, ease: "power2.out" },
          "<-0.2"
        );

      ScrollTrigger.create({
        trigger: root.current,
        start: () => "top+=" + window.innerHeight * 2.5 + " top",
        end: () => "top+=" + window.innerHeight * 3.6 + " top",
        scrub: true,
        animation: craft,
        onUpdate: (self) => {
          // Play once the cabinet is fully open; rewind if the visitor leaves,
          // so returning always replays the retrieval in full.
          if (self.progress > 0.9) cabinet.play();
          else if (self.progress < 0.4) cabinet.pause(0);
        },
      });
      // -------- Reduced motion --------
      if (reduced) {
        if (heroPre.current) heroPre.current.textContent = HERO_PRE;
        if (heroVaultInline.current) heroVaultInline.current.textContent = HERO_VAULT;
        if (subtitleText.current) subtitleText.current.textContent = SUBTITLE;
        if (ulPath.current) {
          const len = ulPath.current.getTotalLength();
          gsap.set(ulPath.current, { strokeDasharray: len, strokeDashoffset: 0 });
        }
        gsap.set([ulPath.current, arrowStem.current, arrowHead.current], { opacity: 1 });
        unlockScroll();
        ScrollTrigger.refresh();
        return;
      }

      // -------- Cinematic intro --------
      lockScroll();

      const run = async () => {
        await wait(300, isCancelled);
        if (isCancelled()) return;

        heroCaret.current?.setAttribute("data-blink", "true");
        if (heroPre.current) await typeInto(heroPre.current, HERO_PRE, { cancelled: isCancelled });
        if (heroVaultInline.current)
          await typeInto(heroVaultInline.current, HERO_VAULT, { cancelled: isCancelled });
        await wait(1600, isCancelled);
        heroCaret.current?.setAttribute("data-blink", "false");

        await wait(360, isCancelled);
        if (isCancelled()) return;

        subtitleCaret.current?.setAttribute("data-blink", "true");
        if (subtitleText.current) await typeInto(subtitleText.current, SUBTITLE, { cancelled: isCancelled });
        await wait(1600, isCancelled);
        subtitleCaret.current?.setAttribute("data-blink", "false");

        await wait(220, isCancelled);
        if (isCancelled()) return;

        if (ulPath.current) {
          const len = ulPath.current.getTotalLength();
          gsap.set(ulPath.current, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
          await gsap.to(ulPath.current, { strokeDashoffset: 0, duration: 0.75, ease: "power2.inOut" }).then();
        }
        if (isCancelled()) return;
        await gsap
          .to([arrowStem.current, arrowHead.current], { opacity: 1, duration: 0.3, ease: "power2.out" })
          .then();

        gsap
          .timeline({ repeat: -1, repeatDelay: 1.4 })
          .to(arrowHead.current, { y: 8, duration: 0.5, ease: "sine.inOut" }, 0)
          .to(arrowStem.current, { attr: { y2: 68 }, duration: 0.5, ease: "sine.inOut" }, 0)
          .to(arrowHead.current, { y: 0, duration: 0.6, ease: "sine.inOut" }, 0.5)
          .to(arrowStem.current, { attr: { y2: 60 }, duration: 0.6, ease: "sine.inOut" }, 0.5);

        unlockScroll();
        ScrollTrigger.refresh();
      };

      (document.fonts?.ready ?? Promise.resolve()).then(() => {
        if (isCancelled()) return;
        ScrollTrigger.refresh();
        run();
      });
    }, root);

    return () => {
      cancelled = true;
      unlockScroll();
      cardTl?.kill();
      journeyListeners?.();
      gsap.ticker.remove(tick);
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={root} className="relative h-[500vh] w-full">
      {/* ------------------------------------------------------------ NAV */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[6vw] py-[3.4vh]">
        <div className="relative">
          <span
            ref={navGhost}
            aria-hidden
            className="font-excon font-bold leading-none opacity-0 select-none"
            style={{ fontSize: NAV_VAULT_SIZE }}
          >
            Vault.
          </span>
        </div>

        <button
          ref={letsTalk}
          className="will-reveal font-excon font-bold leading-none text-cream rounded-full border border-cream/80 px-5 py-2 transition-colors hover:bg-cream hover:text-black"
          style={{ fontSize: "clamp(0.9rem, 1.4vw, 1.05rem)" }}
        >
          Let&rsquo;s Talk.
        </button>

        <span
          ref={vaultFloat}
          aria-hidden
          className="text-glow pointer-events-none fixed left-0 top-0 font-excon font-bold leading-none text-cream"
          style={{ fontSize: HEADING_SIZE, willChange: "transform" }}
        >
          Vault.
        </span>
      </header>

      {/* ---------------------------------------------------------- STAGE */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* ------------------------------------------------- ATMOSPHERE */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <div className="vault-radial" />
          <div data-blob="a" className="vault-blob" style={{ top: "-12%", left: "-8%" }} />
          <div data-blob="b" className="vault-blob" style={{ bottom: "-18%", right: "-10%" }} />
          <div className="vault-grain" />
          <div className="vault-vignette" />
        </div>

        {/* -------------------------------------------------------- HERO */}
        <section className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <h1
            className="text-glow font-excon font-bold leading-[1.02] whitespace-nowrap text-cream"
            style={{ fontSize: HEADING_SIZE }}
          >
            <span ref={heroPre} />
            <span ref={heroVaultInline} />
            <span ref={heroCaret} className="vault-caret align-baseline" />
          </h1>

          <div
            ref={scrollIndicator}
            className="mt-[4.5vh] flex w-full flex-col items-center"
            style={{ maxWidth: "min(86vw, 560px)" }}
          >
            <svg
              viewBox="0 0 640 26"
              className="w-full overflow-visible"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--vault-cream)" }}
            >
              <path ref={ulPath} d="M4 12 H 604 Q 622 12 622 30" />
              <line ref={arrowStem} x1="622" y1="29" x2="622" y2="60" />
              <path ref={arrowHead} d="M611 49 L622 61 L633 49" />
            </svg>
            <p
              className="mt-[4.5vh] text-center font-excon font-bold leading-none text-cream"
              style={{ fontSize: "clamp(1rem, 2.3vw, 1.55rem)" }}
            >
              <span ref={subtitleText} />
              <span ref={subtitleCaret} className="vault-caret align-baseline" />
            </p>
          </div>
        </section>

        {/* ---------------------------------------- MAIN PANEL (About / Journey) */}
        <div ref={mainPanel} className="absolute inset-0 z-20 bg-black">
          {/* Panel atmosphere — the panel is opaque (it occludes the hero as it
              rolls up), so it carries its own lighting layers. */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="vault-radial" />
            <div className="vault-grain" />
            <div className="vault-vignette" />
          </div>
          <div className="relative mx-auto flex h-full max-w-[1360px] items-center gap-[4%] px-[6vw]">
            {/* Left: accordion chapter menu */}
            <ul
              ref={menu}
              className="flex w-[32%] shrink-0 flex-col justify-center gap-[0.55rem] font-excon font-bold leading-[1.05]"
            >
              {MENU.map((item) => (
                <li
                  key={item.key}
                  data-key={item.key}
                  className="will-reveal cursor-pointer text-gold-dim"
                  style={{ fontSize: MENU_SMALL }}
                >
                  {/* Hover lives on the span so CSS transitions never fight the
                      GSAP color tweens on the li (accordion + glow pulse). */}
                  <span className="transition-colors duration-300 hover:text-cream">{item.label}</span>
                  {/* Running tally of skills stored in the Vault. Sized in rem
                      so the accordion's font-size tween never scales it. */}
                  {item.key === "craft" && (
                    <span
                      data-craft-count
                      aria-hidden
                      className="ml-2.5 inline-flex shrink-0 items-center justify-center rounded-full align-middle font-inter font-medium text-black"
                      style={{
                        width: "1.35rem",
                        height: "1.35rem",
                        fontSize: "0.75rem",
                        background: "var(--vault-gold)",
                        opacity: 0,
                      }}
                    >
                      0
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {/* Right: swappable content */}
            <div className="relative h-full flex-1">
              {/* About */}
              <div ref={aboutRight} className="absolute inset-0 flex items-center justify-center">
                <div className="flex max-w-[380px] flex-col items-center text-center">
                  <div ref={profile} className="will-reveal w-[clamp(180px,20vw,300px)]">
                    <div className="rounded-[24%] p-[6px] ring-2 ring-cream">
                      <ProfileSilhouette />
                    </div>
                  </div>
                  <h3
                    ref={aboutName}
                    className="will-reveal mt-6 font-excon font-bold leading-none text-cream"
                    style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.1rem)" }}
                  >
                    Tharun S
                  </h3>
                  <p
                    ref={aboutPara}
                    className="will-reveal mt-4 font-ranade leading-relaxed text-cream"
                    style={{ fontSize: "clamp(0.95rem, 1.15vw, 1.12rem)" }}
                  >
                    I enjoy building products where thoughtful design meets reliable
                    engineering. Every project is an opportunity to create something
                    intuitive, purposeful, and crafted with attention to detail.
                  </p>
                </div>
              </div>

              {/* Journey — vertical dotted timeline */}
              <div ref={journeyRight} className="absolute inset-0 flex items-center justify-center">
                {/* Oversized chapter numbers — part of the composition, not text */}
                <div
                  className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
                  aria-hidden
                >
                  {["01", "02", "03", "04"].map((n, i) => (
                    <span
                      key={n}
                      data-chnum={i}
                      className="absolute font-excon font-bold leading-none"
                      style={{
                        fontSize: "clamp(16rem, 30vw, 30rem)",
                        color: "rgba(244, 231, 168, 0.04)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {n}
                    </span>
                  ))}
                </div>

                <div className="relative flex items-start gap-8 md:gap-12">
                  {/* Timeline column */}
                  <div className="relative flex flex-col items-center gap-[0.85rem]">
                    {/* Progress particle — travels the track between chapters */}
                    <span
                      data-particle
                      className="absolute rounded-full"
                      aria-hidden
                      style={{
                        width: 8,
                        height: 8,
                        left: "50%",
                        marginLeft: -4,
                        top: 0,
                        background: "var(--vault-cream)",
                        boxShadow: "0 0 14px 5px rgba(244, 231, 168, 0.55)",
                        opacity: 0,
                      }}
                    />
                    <div data-milestone className="relative mb-2">
                      <div data-breathe className="relative">
                        <div
                          data-glow
                          className="pointer-events-none absolute -inset-3 rounded-full"
                          style={{
                            background:
                              "radial-gradient(circle, rgba(244,231,168,0.85) 0%, rgba(244,231,168,0) 70%)",
                            filter: "blur(10px)",
                          }}
                        />
                        <div
                          className="relative flex items-center justify-center rounded-full bg-cream"
                          style={{ width: 84, height: 84 }}
                        >
                          <div className="relative" style={{ width: 42, height: 42 }}>
                            {JOURNEY.map((step, i) => (
                              <svg
                                key={i}
                                data-icon
                                viewBox="0 0 24 24"
                                className="absolute inset-0 h-full w-full"
                              >
                                <JourneyIcon name={step.icon} />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dotted track — subdued (future path) */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <span
                        key={i}
                        data-dot
                        className="block rounded-full bg-cream"
                        style={{ width: 6, height: 6, opacity: 0.25 }}
                      />
                    ))}
                    {/* Remaining-milestone markers — dim / inactive */}
                    {[0, 1, 2].map((i) => (
                      <span
                        key={`u${i}`}
                        data-upcoming
                        className="block rounded-full bg-cream"
                        style={{ width: 11, height: 11, opacity: 0.35 }}
                      />
                    ))}
                  </div>

                  {/* Text column — the four chapters, stacked + page-turned */}
                  <div className="relative w-[min(46vw,380px)]" style={{ minHeight: 260 }}>
                    {JOURNEY.map((step, i) => (
                      <div key={step.title} data-jtext={i} className={i === 0 ? "" : "absolute inset-0"}>
                        {/* Chapter title — primary focal point */}
                        <h3
                          className="font-excon font-bold uppercase leading-[1.02] text-cream"
                          style={{ fontSize: "clamp(2.2rem, 3vw, 3rem)", letterSpacing: "0.1em" }}
                        >
                          {step.title}
                        </h3>

                        {/* Key statistic — editorial pull-quote */}
                        {step.metric && (
                          <p
                            className="mt-6 flex items-baseline font-excon leading-none text-cream"
                            style={{ fontSize: "clamp(2.9rem, 3.8vw, 3.5rem)", fontWeight: 300 }}
                          >
                            <span>{step.metric}</span>
                            {step.metricUnit && (
                              <span style={{ fontSize: "0.6em", fontWeight: 300 }}>{step.metricUnit}</span>
                            )}
                            {step.metricLabel && (
                              <span
                                className="ml-3 font-inter uppercase text-cream/55"
                                style={{ fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.14em" }}
                              >
                                {step.metricLabel}
                              </span>
                            )}
                          </p>
                        )}

                        {/* Institution / company — medium presence */}
                        <p
                          className={`font-inter font-medium text-cream ${step.metric ? "mt-4" : "mt-7"}`}
                          style={{ fontSize: "clamp(1.2rem, 1.5vw, 1.45rem)" }}
                        >
                          {step.primary}
                        </p>

                        {/* Supporting metadata — quiet */}
                        {step.secondary && (
                          <p
                            className="mt-1.5 font-inter font-medium text-cream/55"
                            style={{ fontSize: "clamp(0.95rem, 1.05vw, 1.05rem)", letterSpacing: "0.01em" }}
                          >
                            {step.secondary}
                          </p>
                        )}

                        {/* Thin divider — breathing room before the story */}
                        <div className="mt-8 h-px w-full bg-cream/[0.18]" />

                        {/* Story paragraph — clean, editorial reading width */}
                        <p
                          className="mt-8 max-w-[32ch] font-inter text-cream/90"
                          style={{ fontSize: "clamp(1.05rem, 1.15vw, 1.2rem)", lineHeight: 1.7, fontWeight: 400 }}
                        >
                          {step.body}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Reserved lane for the achievement card, so the card can
                      never overlap the story column at any width. */}
                  <div className="w-[232px] shrink-0" aria-hidden />

                  {/* Achievement Unlocked — sits in the right-hand lane, level
                      with the chapter title and in the reader's eyeline. It is
                      read here, then travels across into "Craft", where the
                      running tally of stored skills ticks up. */}
                  <div
                    data-achievement
                    aria-hidden
                    className="pointer-events-none absolute right-0 top-0 z-30 rounded-2xl border border-cream/15"
                    style={{
                      width: 232,
                      padding: 20,
                      opacity: 0,
                      background: "rgba(22, 19, 11, 0.55)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      boxShadow: "0 16px 48px rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    <p
                      data-ach-label
                      className="font-inter font-medium uppercase text-cream/50"
                      style={{ fontSize: "0.68rem", letterSpacing: "0.16em" }}
                    >
                      Achievement Unlocked
                    </p>
                    {JOURNEY.map((step, i) => (
                      <ul key={i} data-ach-set={i} className="mt-4 space-y-2" style={{ display: "none" }}>
                        {step.skills.map((s) => (
                          <li
                            key={s}
                            data-ach-item
                            className="flex items-baseline gap-2.5 font-inter text-cream/90"
                            style={{ fontSize: "0.875rem" }}
                          >
                            <span data-ach-check className="inline-block text-gold" style={{ fontSize: "0.75rem" }}>
                              ✓
                            </span>
                            <span data-ach-name className="inline-block">
                              {s}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>
                </div>
              </div>

              {/* Craft — the cabinet of accumulated achievements. Every skill
                  shown here was earned (and watched being earned) in Journey. */}
              <div ref={craftRight} className="absolute inset-0 flex items-center justify-center">
                <div className="grid w-full max-w-[720px] grid-cols-2 gap-5">
                  {CRAFT_CATEGORIES.map((cat, ci) => (
                    <div
                      key={cat.name}
                      data-craft-card={ci}
                      className="relative rounded-2xl"
                      style={{
                        padding: 20,
                        opacity: 0,
                        background: "rgba(22, 19, 11, 0.55)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                      }}
                    >
                      {/* Unlit track + the stroke that is traced around it, so
                          the card's border draws itself in before the contents
                          are retrieved from the Vault. */}
                      <svg
                        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                        aria-hidden
                      >
                        <rect
                          x="0.75"
                          y="0.75"
                          width="calc(100% - 1.5px)"
                          height="calc(100% - 1.5px)"
                          rx="15"
                          fill="none"
                          stroke="var(--vault-cream)"
                          strokeOpacity="0.1"
                          strokeWidth="1.5"
                        />
                        <rect
                          data-craft-trace
                          x="0.75"
                          y="0.75"
                          width="calc(100% - 1.5px)"
                          height="calc(100% - 1.5px)"
                          rx="15"
                          fill="none"
                          stroke="var(--vault-cream)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          pathLength={100}
                          style={{
                            strokeDasharray: 100,
                            strokeDashoffset: 100,
                            filter: "drop-shadow(0 0 6px rgba(244,231,168,0.55))",
                          }}
                        />
                      </svg>

                      <h4
                        data-craft-head
                        className="font-inter font-medium uppercase text-cream/50"
                        style={{ fontSize: "0.68rem", letterSpacing: "0.16em" }}
                      >
                        {cat.name}
                      </h4>
                      <ul className="mt-4 space-y-2">
                        {JOURNEY[cat.chapter].skills.map((s) => (
                          <li
                            key={s}
                            data-craft-item
                            className="flex items-baseline gap-2.5 font-inter text-cream/90"
                            style={{ fontSize: "0.875rem" }}
                          >
                            <span
                              data-craft-check
                              className="inline-block text-gold"
                              style={{ fontSize: "0.75rem" }}
                            >
                              ✓
                            </span>
                            <span data-craft-name className="inline-block">
                              {s}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
