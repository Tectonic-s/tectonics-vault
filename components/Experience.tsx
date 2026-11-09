"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { WorksExpandable } from "./WorksExpandable";
import { OffScriptShowcase } from "./OffScriptShowcase";
import { DotDistortionShader } from "./ui/dot-distortion-shader";
import { soundFX } from "@/lib/audio";

/* Type sizes shared between the hero "Vault." and the flying logo so they
   scale into each other pixel-perfectly. */
const HEADING_SIZE = "clamp(2rem, 8.4vw, 7rem)";
const NAV_VAULT_SIZE = "clamp(1.5rem, 2.6vw, 2.15rem)";

/* Accordion menu sizes — fixed rem so GSAP can interpolate them. */
const MENU_ACTIVE = "4.4rem";
const MENU_SMALL = "1.5rem";

const getActiveMenuSize = () => {
  if (typeof window === "undefined") return MENU_ACTIVE;
  return window.innerWidth < 1280 ? "3.6rem" : MENU_ACTIVE;
};

/* Typography colours are resolved literals, never `rgb(var(--x) / a)`:
   GSAP's colour regex matches that form only up to the first paren, fails to
   find any digits, and silently falls back to transparent black. Ink is
   static, so baking the value here is safe as well as necessary. */
const INK_LIGHT = "rgb(255 255 255)";
const INK_DIM_LIGHT = "rgba(255, 255, 255, 0.42)";

/* Option 2: Full Chamber Shift Backgrounds */
const JOURNEY_BG = [
  "#140e08", // Chapter 0: Bronze Beginning
  "#091612", // Chapter 1: Mint Foundation
  "#0a1222", // Chapter 2: Sapphire Strategy
  "#161108", // Chapter 3: Gold Leadership
  "#081418", // Chapter 4: Slate Cyan Engineering
];

const BEYOND_BG = [
  "#170b07", // Move: Fiery Terra / Ember
  "#0a1122", // Think: Deep Sapphire
  "#130922", // Create: Electric Amethyst
  "#09160f", // Explore: Evergreen Sage
];

const getChamberBg = (section: string, journeyIdx: number, beyondIdx: number) => {
  if (section === "hero") return "#f5f5f5";
  if (section === "about") return "#0b1410";
  if (section === "journey") return JOURNEY_BG[journeyIdx] ?? "#0c111c";
  if (section === "skills" || section === "craft") return "#08111c";
  if (section === "works") return "#0a0a0c";
  if (section === "beyond") return BEYOND_BG[beyondIdx] ?? "#170b07";
  if (section === "talk") return "#07120e";
  return "#0b1410";
};

const HERO_PRE = "Welcome to my ";
const HERO_VAULT = "Vault.";
const SUBTITLE = "Tap anywhere or press any key to continue";

const MENU: { key: string; label: string; numeral: string; lines?: string[] }[] = [
  { key: "about", label: "Intro", numeral: "01" },
  { key: "journey", label: "Journey", numeral: "02" },
  { key: "skills", label: "Toolkit", numeral: "03" },
  { key: "works", label: "Projects", numeral: "04" },
  { key: "beyond", label: "Off Script", numeral: "05", lines: ["Off", "Script"] },
  { key: "talk", label: "Connect", numeral: "06" },
];

/* The four chapters of the Journey timeline. Fields are split for an
   editorial hierarchy: metric = pull-quote statistic, primary = institution /
   company, secondary = supporting metadata (degree / role / dates).
   `skills` are the achievements unlocked by that chapter — they are the
   single source of truth for everything the Craft section displays. */
const JOURNEY = [
  {
    icon: "backpack" as const,
    title: "The Beginning",
    period: "2018 — 2020",
    accent: [205, 140, 80], // warm bronze — foundation, archive light
    lift: 0.07,
    metric: "89",
    metricUnit: "%",
    metricLabel: "Score",
    primary: "A.M. Jain School",
    secondary: "Higher Secondary · Science & Mathematics",
    skills: ["Curiosity", "Discipline", "Always Learning"],
    body:
      "This is where it all started. Science and mathematics introduced me to structured thinking, problem-solving, and the habit of asking why. What began as classroom curiosity gradually grew into an interest in understanding how things work.",
  },
  {
    icon: "gradcap" as const,
    title: "The Foundation",
    period: "2021 — 2024",
    accent: [46, 175, 135], // emerald mint — growth, data & discovery
    lift: 0.065,
    metric: "8.1",
    metricUnit: "",
    metricLabel: "CGPA",
    primary: "Guru Nanak College",
    secondary: "B.Sc. Data Analytics",
    skills: ["Critical Thinking", "Problem Solving", "Research & Exploration", "Data Analysis"],
    body:
      "My first real step into the world of technology and data. This chapter introduced me to the art of turning information into insights, approaching problems analytically, and understanding the stories behind numbers.",
  },
  {
    icon: "gradcap" as const,
    title: "The Business Perspective",
    period: "2024 — 2026",
    accent: [75, 125, 225], // sapphire / architectural cobalt — executive & strategy
    lift: 0.07,
    metric: "7.5",
    metricUnit: "",
    metricLabel: "CGPA",
    primary: "Jain Online · Jain University, Bengaluru",
    secondary: "MBA · Business Intelligence & Analytics",
    skills: ["Leadership", "Business Strategy"],
    body:
      "A parallel journey into the business side of things. This programme helped me explore management principles, organisational thinking, and how business decisions shape the way organisations operate.",
  },
  {
    icon: "briefcase" as const,
    title: "The Real World",
    period: "January 2025 — July 2025",
    accent: [215, 160, 60], // deep warm gold — enterprise & corporate leadership
    lift: 0.08,
    metric: "6+",
    metricUnit: "",
    metricLabel: "Months of Experience",
    primary: "Bajaj Finserv",
    secondary: "Deputy Manager · Loan Against Property (LAP)",
    skills: ["Communication", "Negotiation", "Relationship Management"],
    body:
      "My first corporate chapter brought business theory into the real world. Working across sales and customer relationship management, I handled client interactions, worked towards monthly targets, and experienced the importance of trust, communication, and execution. Achieving monthly targets and earning performance incentives made the experience even more rewarding.",
  },
  {
    icon: "gradcap" as const,
    title: "The Builder",
    period: "2025 — 2027",
    accent: [60, 160, 185], // slate cyan / engineering lab
    lift: 0.065,
    metric: "7.0",
    metricUnit: "",
    metricLabel: "Latest Confirmed CGPA",
    primary: "PSG College of Technology",
    secondary: "MCA · Master of Computer Applications",
    skills: ["Software Engineering", "System Design", "Full-Stack Development", "Modern Development Practices"],
    body:
      "This is where I'm bringing everything together. With a background in analytics, business understanding, and corporate experience, I'm now focused on application development and product thinking. I'm particularly interested in building complete products — from identifying a problem and shaping an idea to designing and developing a working solution.",
  },
];

/* Rooms outside the Journey archive. Colour is lighting, so restraint comes
   from the low alpha it is used at (4–14%), never from a dark hue: a deep
   emerald at 55% simply disappears on near-black. */
const ROOMS = {
  welcome: { accent: [0, 0, 0], lift: 0 },
  about: { accent: [0, 0, 0], lift: 0 },
  craft: { accent: [0, 0, 0], lift: 0 },
  works: { accent: [16, 185, 129], lift: 0.05 },
  talk: { accent: [0, 0, 0], lift: 0 },
} as const;

/* The four categories of Beyond Work — personal life, hobbies, and disciplines.
   Mirrors the editorial hierarchy of Journey with metrics, context badges,
   narrative body copy, and core disciplines. */
const BEYOND = [
  {
    title: "Move",
    headline: "Find Your Pace",
    primary: "Find Your Pace",
    accent: [235, 115, 60], // fiery terra / warm ember
    lift: 0.07,
    body:
      "Cricket, fitness, and the occasional attempt at picking up a new sport. I enjoy staying active and the process of getting a little better each time. It's less about chasing perfection and more about showing up.",
    habits: ["Cricket", "Strength Training", "Fitness", "Boxing"],
  },
  {
    title: "Think",
    headline: "Curiosity Has No Off Switch",
    primary: "Curiosity Has No Off Switch",
    accent: [65, 120, 220], // sapphire / architectural blue
    lift: 0.065,
    body:
      "I'm fascinated by how things work — from human behaviour and psychology to decision-making and complex systems. I enjoy connecting ideas, questioning assumptions, and looking at everyday things from a different perspective.",
    habits: ["Psychology", "Human Behaviour", "Systems Thinking", "Decision Theory"],
  },
  {
    title: "Create",
    headline: "Making Things Just Because",
    primary: "Making Things Just Because",
    accent: [160, 95, 225], // deep electric violet
    lift: 0.08,
    body:
      "Photography is one of my favourite ways to slow down and notice the details. I enjoy playing with light, composition, and visual storytelling. Add a little music, cinema, and an ever-growing list of creative experiments, and there's always something to explore.",
    habits: ["Photography", "Sony a6400", "Guitar", "Cinema", "Visual Storytelling"],
  },
  {
    title: "Explore",
    headline: "Life Happens Outside the Screen",
    primary: "Life Happens Outside the Screen",
    accent: [50, 165, 120], // evergreen / grounding sage
    lift: 0.06,
    body:
      "Long rides, spontaneous plans, new places, and mornings by the beach. I'm drawn to experiences that break the routine. And when I'm indoors, there's usually a good film, anime, or game waiting.",
    habits: ["Motorcycles", "Road Trips", "Travel", "Anime", "Gaming", "Movies"],
  },
];

/* Craft renders ONLY what the Journey earned, regrouped by theme so a card
   can hold skills from different chapters. Origin is derived from JOURNEY
   rather than restated, which makes "nothing here was not earned" a
   structural guarantee instead of a promise. */
const CRAFT_CATEGORIES = [
  {
    name: "The Essentials",
    skills: ["Curiosity", "Discipline", "Always Learning", "Leadership"],
  },
  {
    name: "The Analytical Side",
    skills: ["Critical Thinking", "Problem Solving", "Research & Exploration", "Data Analysis"],
  },
  {
    name: "People & Business",
    skills: ["Communication", "Negotiation", "Relationship Management", "Business Strategy"],
  },
  {
    name: "The Engineering Side",
    skills: [
      "Software Engineering",
      "System Design",
      "Full-Stack Development",
      "Modern Development Practices",
    ],
  },
];

/** Which chapter earned a skill. -1 means it was never earned. */
const originOf = (skill: string) => JOURNEY.findIndex((c) => c.skills.includes(skill as never));

if (process.env.NODE_ENV !== "production") {
  const shown = CRAFT_CATEGORIES.flatMap((c) => c.skills);
  const orphan = shown.filter((s) => originOf(s) === -1);
  const missing = JOURNEY.flatMap((c) => c.skills).filter((s) => !shown.includes(s));
  if (orphan.length) console.error("[Vault] Craft shows unearned skills:", orphan);
  if (missing.length) console.error("[Vault] Earned skills missing from Craft:", missing);
}

export default function Experience() {
  const root = useRef<HTMLElement>(null);

  // Hero refs
  const heroPre = useRef<HTMLSpanElement>(null);
  const heroPreInner = useRef<HTMLSpanElement>(null);
  const heroVaultInline = useRef<HTMLSpanElement>(null);
  const heroVaultInner = useRef<HTMLSpanElement>(null);
  const heroSubInner = useRef<HTMLParagraphElement>(null);
  const scrollIndicator = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroSpotlightRef = useRef<HTMLDivElement>(null);
  const heroRingOuterRef = useRef<HTMLDivElement>(null);
  const heroRingInnerRef = useRef<HTMLDivElement>(null);

  // Nav refs
  const navGhost = useRef<HTMLButtonElement>(null);
  const vaultFloat = useRef<HTMLButtonElement>(null);
  const letsTalk = useRef<HTMLButtonElement>(null);

  // Main panel & Section stage refs
  const mainPanel = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLUListElement>(null);
  const aboutRight = useRef<HTMLDivElement>(null);
  const profile = useRef<HTMLDivElement>(null);
  const aboutName = useRef<HTMLHeadingElement>(null);
  const aboutPara = useRef<HTMLParagraphElement>(null);
  const journeyRight = useRef<HTMLDivElement>(null);
  const craftRight = useRef<HTMLDivElement>(null);
  const worksRight = useRef<HTMLDivElement>(null);
  const beyondRight = useRef<HTMLDivElement>(null);
  const talkRight = useRef<HTMLDivElement>(null);

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeBeyondIndex, setActiveBeyondIndex] = useState(0);
  const activeChapterRef = useRef(0);
  const activeBeyondRef = useRef(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const [activeSection, setActiveSectionState] = useState<string>("hero");
  const activeSectionRef = useRef<string>("hero");
  const isTransitioningRef = useRef(false);

  const [isBeyondMultiLine, setIsBeyondMultiLine] = useState(false);
  const beyondResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const flipRef = useRef({ sx: 0, sy: 0, ex: 0, ey: 0, es: 1 });
  const finishIntroRef = useRef<() => void>(() => {});
  const switchJourneyChapterRef = useRef<((idx: number) => void) | null>(null);
  const switchBeyondChapterRef = useRef<((idx: number) => void) | null>(null);
  const playToolkitShowcaseRef = useRef<((force?: boolean) => void) | null>(null);
  const setRoomRef = useRef<((accent: readonly number[], lift: number, dur?: number) => void) | null>(null);
  const setActiveMenuRef = useRef<((key: string, immediate?: boolean) => void) | null>(null);

  const mobileNavTriggerRef = useRef<HTMLButtonElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onFirstInteraction = () => {
      soundFX.unlockAudio();
      setHasInteracted(true);
    };
    window.addEventListener("pointerdown", onFirstInteraction, { once: true });
    window.addEventListener("keydown", onFirstInteraction, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "hidden";
    }
  }, [isMobileNavOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isMobileNavOpen) {
          soundFX.playModalClose();
        }
        setIsMobileNavOpen(false);
        lastActiveElementRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileNavOpen]);

  const handleCopyEmail = () => {
    soundFX.playSuccessChime();
    navigator.clipboard?.writeText("tharun@example.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const measure = useCallback(() => {
    if (!heroVaultInline.current || !navGhost.current) return;
    const from = heroVaultInline.current.getBoundingClientRect();
    const to = navGhost.current.getBoundingClientRect();
    if (!from.height || !to.height) return;
    flipRef.current.sx = from.left;
    flipRef.current.sy = from.top;
    flipRef.current.ex = to.left;
    flipRef.current.ey = to.top;
    flipRef.current.es = to.height / from.height;
  }, []);

  const switchSectionTo = useCallback((key: string) => {
    const canonical = key === "craft" ? "skills" : key;
    if (activeSectionRef.current === canonical) return;

    soundFX.playMenuClick();
    const prevCanonical = activeSectionRef.current;
    activeSectionRef.current = canonical;
    setActiveSectionState(canonical);

    // Update room ambient lighting
    if (canonical === "journey") {
      setRoomRef.current?.(JOURNEY[activeChapterRef.current].accent, JOURNEY[activeChapterRef.current].lift, 0.45);
    } else if (canonical === "beyond") {
      setRoomRef.current?.(BEYOND[activeBeyondRef.current].accent, BEYOND[activeBeyondRef.current].lift, 0.45);
    } else {
      const r = ROOMS[canonical as keyof typeof ROOMS] || ROOMS.about;
      setRoomRef.current?.(r.accent, r.lift, 0.45);
    }

    // Animate accordion font sizes
    setActiveMenuRef.current?.(canonical);

    // Crossfade stage panels
    const panels: Record<string, HTMLElement | null> = {
      about: aboutRight.current,
      journey: journeyRight.current,
      skills: craftRight.current,
      works: worksRight.current,
      beyond: beyondRight.current,
      talk: talkRight.current,
    };

    const prevPanel = panels[prevCanonical];
    const nextPanel = panels[canonical];

    if (prevPanel && prevPanel !== nextPanel) {
      gsap.to(prevPanel, {
        autoAlpha: 0,
        y: -14,
        duration: 0.28,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    }

    if (nextPanel) {
      gsap.fromTo(
        nextPanel,
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.38,
          ease: "power3.out",
          overwrite: "auto",
        }
      );
    }

    if (canonical === "skills") {
      playToolkitShowcaseRef.current?.(false);
    }
  }, []);

  const proceedToFirstSection = useCallback(() => {
    if (activeSectionRef.current !== "hero" || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    soundFX.unlockAudio();
    soundFX.playCabinetUnlock();
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    measure();
    const flip = flipRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduced ? 0 : 2.4;

    if (reduced) {
      if (mainPanel.current) gsap.set(mainPanel.current, { yPercent: 0 });
      if (heroVaultInline.current) gsap.set(heroVaultInline.current, { opacity: 0 });
      if (vaultFloat.current) {
        gsap.set(vaultFloat.current, {
          opacity: 1,
          x: flip.ex,
          y: flip.ey,
          scale: flip.es,
          rotate: 0,
        });
      }
      if (letsTalk.current) gsap.set(letsTalk.current, { opacity: 1, y: 0 });
      isTransitioningRef.current = false;
      setIsIntroComplete(true);
      activeSectionRef.current = "about";
      setActiveSectionState("about");
      setActiveMenuRef.current?.("about", true);
      setRoomRef.current?.(ROOMS.about.accent, ROOMS.about.lift, 0.8);
      return;
    }

    // Seamless FLIP Swap:
    // Instantly hide the inline wordmark and activate the fixed floating wordmark at exact same client coordinates
    gsap.set(heroVaultInline.current, { opacity: 0 });
    gsap.set(vaultFloat.current, {
      opacity: 1,
      x: flip.sx,
      y: flip.sy,
      scale: 1,
      rotate: 0,
      transformOrigin: "left top",
    });

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        isTransitioningRef.current = false;
        setIsIntroComplete(true);
        activeSectionRef.current = "about";
        setActiveSectionState("about");
        setActiveMenuRef.current?.("about", true);
        setRoomRef.current?.(ROOMS.about.accent, ROOMS.about.lift, 0.8);
      },
    });

    // 1. Dissolve hero prompt & subtitle
    tl.to(scrollIndicator.current, { y: 36, scale: 0.92, opacity: 0, duration: 0.7, ease: "power2.in" }, 0)
      .to(heroPre.current, { yPercent: -90, scale: 0.94, opacity: 0, duration: 0.75, ease: "power2.in" }, 0)
      .to(heroBgRef.current, { opacity: 0, duration: 1.0 }, 0)
      // 2. Flight of "Vault." floating wordmark to top left nav logo (smooth spatial glide with subtle tilt)
      .to(
        vaultFloat.current,
        {
          x: flip.ex,
          y: flip.ey,
          scale: flip.es,
          rotate: -2,
          duration: dur * 0.78,
          ease: "power2.inOut",
        },
        0.08
      )
      // Wordmark settles straight as it docks in nav
      .to(
        vaultFloat.current,
        {
          rotate: 0,
          duration: 0.28,
          ease: "back.out(2)",
        },
        dur * 0.78
      )
      // 3. Main panel chamber rises like a luxury vault door
      .to(
        mainPanel.current,
        {
          yPercent: 0,
          duration: dur,
          ease: "power3.inOut",
        },
        0.12
      )
      // 4. Spring in top nav Connect button
      .fromTo(
        letsTalk.current,
        { y: -24, opacity: 0, scale: 0.85 },
        { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: "back.out(2)" },
        dur * 0.58
      )
      // 5. Cascade in sidebar menu items like cards
      .fromTo(
        menu.current?.querySelectorAll("li") ?? [],
        { x: -36, opacity: 0, scale: 0.92 },
        { x: 0, opacity: 1, scale: 1, duration: 0.55, stagger: 0.055, ease: "back.out(1.6)" },
        dur * 0.54
      )
      // 6. About portrait & bio spring in
      .fromTo(
        profile.current,
        { scale: 0.8, rotate: -4, opacity: 0 },
        { scale: 1, rotate: 0, opacity: 1, duration: 0.6, ease: "back.out(1.8)" },
        dur * 0.6
      )
      .fromTo(aboutName.current, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, dur * 0.66)
      .fromTo(aboutPara.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, dur * 0.7);
  }, [hasInteracted, measure]);

  const returnToHero = useCallback(() => {
    if (activeSectionRef.current === "hero" || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    soundFX.playMenuClick();

    measure();
    const flip = flipRef.current;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      if (mainPanel.current) gsap.set(mainPanel.current, { yPercent: 100 });
      if (vaultFloat.current) gsap.set(vaultFloat.current, { opacity: 0 });
      if (heroVaultInline.current) gsap.set(heroVaultInline.current, { opacity: 1, x: 0, y: 0, scale: 1 });
      if (heroPre.current) gsap.set(heroPre.current, { opacity: 1, yPercent: 0, scale: 1 });
      if (scrollIndicator.current) gsap.set(scrollIndicator.current, { opacity: 1, y: 0, scale: 1 });
      if (heroBgRef.current) gsap.set(heroBgRef.current, { opacity: 1 });
      isTransitioningRef.current = false;
      activeSectionRef.current = "hero";
      setActiveSectionState("hero");
      setRoomRef.current?.(ROOMS.welcome.accent, ROOMS.welcome.lift, 0.4);
      return;
    }

    // Ensure floating wordmark is visible at nav position before beginning flight back
    gsap.set(heroVaultInline.current, { opacity: 0 });
    gsap.set(vaultFloat.current, {
      opacity: 1,
      x: flip.ex,
      y: flip.ey,
      scale: flip.es,
      rotate: 0,
      transformOrigin: "left top",
    });

    const retDur = 2.4; // Luxurious, slow, playful return transition

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        isTransitioningRef.current = false;
        activeSectionRef.current = "hero";
        setActiveSectionState("hero");
        // Swap back to inline wordmark on completion
        gsap.set(vaultFloat.current, { opacity: 0 });
        gsap.set(heroVaultInline.current, { opacity: 1, x: 0, y: 0, scale: 1 });
        setRoomRef.current?.(ROOMS.welcome.accent, ROOMS.welcome.lift, 0.8);
      },
    });

    // Vault wordmark glides back from nav to hero position with gentle playful rotation
    tl.to(
      vaultFloat.current,
      {
        x: flip.sx,
        y: flip.sy,
        scale: 1,
        rotate: 2,
        duration: retDur * 0.8,
        ease: "power2.inOut",
      },
      0.05
    )
    .to(
      vaultFloat.current,
      {
        rotate: 0,
        duration: 0.35,
        ease: "back.out(1.8)",
      },
      retDur * 0.8
    )
    // Main panel slides down
    .to(mainPanel.current, { yPercent: 100, duration: retDur, ease: "power3.inOut" }, 0)
    // Hero "Welcome to my" floats back down into place
    .to(heroPre.current, { yPercent: 0, scale: 1, opacity: 1, duration: 1.0, ease: "power2.out" }, retDur * 0.4)
    // Subtitle sinks back in
    .to(scrollIndicator.current, { y: 0, scale: 1, opacity: 1, duration: 1.0, ease: "power2.out" }, retDur * 0.45)
    // Hero background atmosphere reappears
    .to(heroBgRef.current, { opacity: 1, duration: 1.1 }, retDur * 0.3);
  }, [measure]);

  const handleHeroClick = () => {
    if (activeSection === "hero") {
      if (!isIntroComplete) {
        finishIntroRef.current?.();
      }
      proceedToFirstSection();
    }
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (activeSectionRef.current !== "hero" && activeSection !== "hero") return;
      if (isMobileNavOpen) return;

      const target = e.target as HTMLElement | null;
      if (
        target?.closest("header") ||
        target?.closest("nav") ||
        target?.closest("#mobile-nav-drawer") ||
        target?.closest("button")
      ) {
        return;
      }

      if (!isIntroComplete) {
        finishIntroRef.current?.();
      }
      proceedToFirstSection();
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.key === "F5" || e.key === "F12") return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // On Hero: any key transitions to first section
      if (activeSection === "hero") {
        e.preventDefault();
        if (!isIntroComplete) {
          finishIntroRef.current?.();
        }
        proceedToFirstSection();
        return;
      }

      // If a modal is open, let the modal handle Escape and keys
      const isModalOpen = document.body.style.overflow === "hidden" && !isMobileNavOpen;
      if (isModalOpen) return;

      // Return to hero shortcuts: Escape, Home, 0, or h
      if (
        activeSection !== "hero" &&
        (e.key === "Escape" || e.key === "Home" || e.key === "0" || e.key.toLowerCase() === "h")
      ) {
        e.preventDefault();
        returnToHero();
        return;
      }

      // Number keys 1-6 jump directly to sections
      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 6) {
        e.preventDefault();
        const targetMenu = MENU[keyNum - 1];
        if (targetMenu) {
          switchSectionTo(targetMenu.key);
        }
        return;
      }

      // Arrow keys or W/S to cycle through sections in sidebar
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
        const currentIdx = MENU.findIndex((m) => m.key === activeSection);
        if (currentIdx !== -1 && currentIdx < MENU.length - 1) {
          e.preventDefault();
          switchSectionTo(MENU[currentIdx + 1].key);
        }
      } else if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
        const currentIdx = MENU.findIndex((m) => m.key === activeSection);
        if (currentIdx === 0) {
          // If at the first section and user presses ArrowUp or W, return to hero
          e.preventDefault();
          returnToHero();
        } else if (currentIdx > 0) {
          e.preventDefault();
          switchSectionTo(MENU[currentIdx - 1].key);
        }
      }
    };

    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isIntroComplete, activeSection, isMobileNavOpen, proceedToFirstSection, switchSectionTo, returnToHero]);

  const handleChapterClick = (index: number) => {
    switchJourneyChapterRef.current?.(index);
  };

  const handleChapterKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = Math.min(JOURNEY.length - 1, index + 1);
      switchJourneyChapterRef.current?.(next);
      document.getElementById(`journey-tab-${next}`)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = Math.max(0, index - 1);
      switchJourneyChapterRef.current?.(prev);
      document.getElementById(`journey-tab-${prev}`)?.focus();
    }
  };

  const handleBeyondChapterClick = (index: number) => {
    switchBeyondChapterRef.current?.(index);
  };

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    const isCancelled = () => cancelled;

    measure();

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);

      const menuItems = menu.current?.querySelectorAll("li") ?? [];
      const jCards = q("[data-jcard]") as HTMLElement[];
      const jTabs = q("[data-jtab]") as HTMLElement[];
      const jCount = q("[data-jcount]")[0] ?? null;
      const craftCards = q("[data-craft-card]") as HTMLElement[];

      const setRoom = (accent: readonly number[], lift: number, dur = 0.6) => {
        gsap.to(root.current, {
          "--accent-rgb": accent.join(" "),
          "--accent-lift": lift,
          duration: reduced ? 0 : dur,
          ease: "power2.inOut",
          overwrite: "auto",
        });
      };
      setRoomRef.current = setRoom;

      // Starting states
      gsap.set(root.current, {
        "--accent-rgb": ROOMS.welcome.accent.join(" "),
        "--accent-lift": ROOMS.welcome.lift,
      });
      gsap.set(mainPanel.current, { yPercent: 100 });
      gsap.set(vaultFloat.current, { opacity: 0, transformOrigin: "left top" });
      gsap.set(heroBgRef.current, { opacity: 1, scale: 1 });

      // Initialize menu items consistently
      menuItems.forEach((li) => {
        const isAbout = li.getAttribute("data-key") === "about";
        gsap.set(li, {
          fontSize: isAbout ? getActiveMenuSize() : MENU_SMALL,
          color: isAbout ? INK_LIGHT : INK_DIM_LIGHT,
        });
      });

      // Left Accordion Menu Controller
      const setActiveMenu = (key: string, immediate = false) => {
        if (key === "beyond") {
          if (beyondResetTimerRef.current) {
            clearTimeout(beyondResetTimerRef.current);
            beyondResetTimerRef.current = null;
          }
          setIsBeyondMultiLine(true);
        } else {
          if (beyondResetTimerRef.current) {
            clearTimeout(beyondResetTimerRef.current);
            beyondResetTimerRef.current = null;
          }
          if (immediate) {
            setIsBeyondMultiLine(false);
          } else {
            beyondResetTimerRef.current = setTimeout(() => {
              setIsBeyondMultiLine(false);
              beyondResetTimerRef.current = null;
            }, 380);
          }
        }

        const targetSize = getActiveMenuSize();
        menuItems.forEach((li) => {
          const itemKey = li.getAttribute("data-key");
          const isActive = itemKey === key;
          gsap.to(li, {
            fontSize: isActive ? targetSize : MENU_SMALL,
            color: isActive ? INK_LIGHT : INK_DIM_LIGHT,
            duration: immediate ? 0 : 0.38,
            ease: "power2.out",
            overwrite: "auto",
          });
        });
      };
      setActiveMenuRef.current = setActiveMenu;

      // Initialize right stage panels
      gsap.set(aboutRight.current, { autoAlpha: 1, y: 0 });
      gsap.set(journeyRight.current, { autoAlpha: 0, y: 20 });
      gsap.set(craftRight.current, { autoAlpha: 0, y: 20 });
      gsap.set(worksRight.current, { autoAlpha: 0, y: 20 });
      gsap.set(beyondRight.current, { autoAlpha: 0, y: 20 });
      gsap.set(talkRight.current, { autoAlpha: 0, y: 20 });

      // Journey cards starting states
      jCards.forEach((card, i) => {
        gsap.set(card, {
          opacity: i === 0 ? 1 : 0,
          y: i === 0 ? 0 : 20,
          pointerEvents: i === 0 ? "auto" : "none",
        });
      });

      // Craft cards starting states
      craftCards.forEach((card) => {
        gsap.set(card, { opacity: 1, y: 0 });
        const trace = card.querySelector("[data-craft-trace]");
        const head = card.querySelector("[data-craft-head]");
        const checks = card.querySelectorAll("[data-craft-check]");
        const names = card.querySelectorAll("[data-craft-name]");
        if (trace) gsap.set(trace, { strokeDashoffset: 0, strokeOpacity: 0.45 });
        if (head) gsap.set(head, { opacity: 1, y: 0 });
        if (checks) gsap.set(checks, { opacity: 1, scale: 1 });
        if (names) gsap.set(names, { opacity: 1, x: 0 });
      });

      // Journey Chapter Switcher
      let isJourneyCardAnimating = false;
      const switchJourneyChapter = (newIndex: number) => {
        const currentIndex = activeChapterRef.current;
        if (currentIndex === newIndex || isJourneyCardAnimating) return;
        isJourneyCardAnimating = true;
        soundFX.playTabSwitch();
        activeChapterRef.current = newIndex;
        setActiveChapterIndex(newIndex);

        const direction = newIndex > currentIndex ? 1 : -1;
        if (jCards[currentIndex]) {
          gsap.to(jCards[currentIndex], {
            opacity: 0,
            y: -14 * direction,
            scale: 0.98,
            duration: 0.3,
            ease: "power2.out",
          });
          jCards[currentIndex].style.pointerEvents = "none";
        }
        if (jCards[newIndex]) {
          gsap.fromTo(
            jCards[newIndex],
            { opacity: 0, y: 16 * direction, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.36,
              ease: "power2.out",
              onComplete: () => {
                isJourneyCardAnimating = false;
              },
            }
          );
          jCards[newIndex].style.pointerEvents = "auto";
        } else {
          isJourneyCardAnimating = false;
        }

        jTabs.forEach((tab, i) => {
          if (i === newIndex) {
            tab.classList.add("bg-white", "text-black", "shadow-sm");
            tab.classList.remove("bg-white/10", "text-white/70");
            tab.setAttribute("aria-selected", "true");
            tab.setAttribute("tabindex", "0");
          } else {
            tab.classList.remove("bg-white", "text-black", "shadow-sm");
            tab.classList.add("bg-white/10", "text-white/70");
            tab.setAttribute("aria-selected", "false");
            tab.setAttribute("tabindex", "-1");
          }
        });

        if (jCount) jCount.textContent = `0${newIndex + 1}`;
        setRoom(JOURNEY[newIndex].accent, JOURNEY[newIndex].lift, 0.45);
      };
      switchJourneyChapterRef.current = switchJourneyChapter;

      // Beyond Chapter Switcher
      const switchBeyondChapter = (newIndex: number) => {
        const currentIndex = activeBeyondRef.current;
        if (currentIndex === newIndex) return;
        soundFX.playTabSwitch();
        activeBeyondRef.current = newIndex;
        setActiveBeyondIndex(newIndex);
        setRoom(BEYOND[newIndex].accent, BEYOND[newIndex].lift, 0.45);
      };
      switchBeyondChapterRef.current = switchBeyondChapter;

      // Toolkit showcase
      let isToolkitAnimating = false;
      let hasToolkitPlayed = false;
      let currentToolkitTl: gsap.core.Timeline | null = null;
      const playToolkitShowcase = (force = false) => {
        if (isToolkitAnimating && !force) return;
        if (hasToolkitPlayed && !force) return;
        if (currentToolkitTl) {
          currentToolkitTl.kill();
          currentToolkitTl = null;
        }
        const statusEl = craftRight.current?.querySelector("[data-toolkit-status]");
        const progressBar = craftRight.current?.querySelector("[data-toolkit-progress]");
        if (reduced) {
          hasToolkitPlayed = true;
          isToolkitAnimating = false;
          craftCards.forEach((card) => {
            const trace = card.querySelector("[data-craft-trace]");
            const head = card.querySelector("[data-craft-head]");
            const checks = card.querySelectorAll("[data-craft-check]");
            const names = card.querySelectorAll("[data-craft-name]");
            gsap.set(card, { opacity: 1, y: 0 });
            if (trace) gsap.set(trace, { strokeDashoffset: 0, strokeOpacity: 0.45 });
            if (head) gsap.set(head, { opacity: 1, y: 0 });
            if (checks) gsap.set(checks, { opacity: 1, scale: 1 });
            if (names) gsap.set(names, { opacity: 1, x: 0 });
          });
          if (statusEl) statusEl.textContent = "16 Capabilities Unlocked";
          if (progressBar) gsap.set(progressBar, { scaleX: 1, opacity: 0.35 });
          return;
        }

        isToolkitAnimating = true;
        hasToolkitPlayed = true;
        soundFX.playCabinetUnlock();
        if (statusEl) statusEl.textContent = "Unlocking Capabilities...";
        if (progressBar) {
          gsap.killTweensOf(progressBar);
          gsap.set(progressBar, { scaleX: 0, opacity: 1 });
          gsap.to(progressBar, { scaleX: 1, duration: 2.6, ease: "power1.inOut" });
        }
        craftCards.forEach((card) => {
          gsap.killTweensOf(card);
          const trace = card.querySelector("[data-craft-trace]");
          const head = card.querySelector("[data-craft-head]");
          const checks = card.querySelectorAll("[data-craft-check]");
          const names = card.querySelectorAll("[data-craft-name]");
          if (trace) gsap.killTweensOf(trace);
          if (head) gsap.killTweensOf(head);
          if (checks) gsap.killTweensOf(checks);
          if (names) gsap.killTweensOf(names);
          gsap.set(card, { opacity: 0, y: 14 });
          if (trace) gsap.set(trace, { strokeDashoffset: 100, strokeOpacity: 0.85 });
          if (head) gsap.set(head, { opacity: 0, y: 8 });
          if (checks) gsap.set(checks, { opacity: 0, scale: 0.3 });
          if (names) gsap.set(names, { opacity: 0, x: -8 });
        });

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          onComplete: () => {
            isToolkitAnimating = false;
            currentToolkitTl = null;
            if (statusEl) statusEl.textContent = "16 Capabilities Unlocked";
            if (progressBar) gsap.to(progressBar, { opacity: 0.35, duration: 0.4 });
          },
        });
        currentToolkitTl = tl;
        craftCards.forEach((card, ci) => {
          const cardDelay = ci * 0.55;
          const trace = card.querySelector("[data-craft-trace]");
          const head = card.querySelector("[data-craft-head]");
          const checks = card.querySelectorAll("[data-craft-check]");
          const names = card.querySelectorAll("[data-craft-name]");
          tl.to(card, { opacity: 1, y: 0, duration: 0.4 }, cardDelay);
          if (trace) tl.to(trace, { strokeDashoffset: 0, strokeOpacity: 0.45, duration: 0.5 }, cardDelay);
          if (head) tl.to(head, { opacity: 1, y: 0, duration: 0.35 }, cardDelay + 0.1);
          checks.forEach((chk, ki) => {
            tl.to(chk, { opacity: 1, scale: 1, duration: 0.25 }, cardDelay + 0.18 + ki * 0.08);
          });
          names.forEach((nm, ki) => {
            tl.to(nm, { opacity: 1, x: 0, duration: 0.25 }, cardDelay + 0.2 + ki * 0.08);
          });
        });
      };
      playToolkitShowcaseRef.current = playToolkitShowcase;

      // Pointer parallax for About & mouse hover for Hero
      if (!reduced) {
        const setPX = gsap.quickTo(profile.current, "x", { duration: 0.7, ease: "power2.out" });
        const setPY = gsap.quickTo(profile.current, "y", { duration: 0.7, ease: "power2.out" });
        const setTX = gsap.quickTo([aboutName.current, aboutPara.current], "x", { duration: 0.9, ease: "power2.out" });
        const setTY = gsap.quickTo([aboutName.current, aboutPara.current], "y", { duration: 0.9, ease: "power2.out" });

        const setSpotX = gsap.quickTo(heroSpotlightRef.current, "x", { duration: 0.65, ease: "power2.out" });
        const setSpotY = gsap.quickTo(heroSpotlightRef.current, "y", { duration: 0.65, ease: "power2.out" });
        const setOuterX = gsap.quickTo(heroRingOuterRef.current, "x", { duration: 1.1, ease: "power3.out" });
        const setOuterY = gsap.quickTo(heroRingOuterRef.current, "y", { duration: 1.1, ease: "power3.out" });
        const setInnerX = gsap.quickTo(heroRingInnerRef.current, "x", { duration: 0.9, ease: "power3.out" });
        const setInnerY = gsap.quickTo(heroRingInnerRef.current, "y", { duration: 0.9, ease: "power3.out" });
        const setInnerRot = gsap.quickTo(heroRingInnerRef.current, "rotate", { duration: 1.2, ease: "power2.out" });
        const setHeadX = gsap.quickTo([heroPre.current, heroVaultInline.current], "x", { duration: 0.8, ease: "power2.out" });
        const setHeadY = gsap.quickTo([heroPre.current, heroVaultInline.current], "y", { duration: 0.8, ease: "power2.out" });

        let hasMovedHeroMouse = false;
        const onPointer = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          setPX(nx * 26);
          setPY(ny * 18);
          setTX(nx * -10);
          setTY(ny * -7);

          if (activeSectionRef.current === "hero") {
            if (!hasMovedHeroMouse && heroSpotlightRef.current) {
              hasMovedHeroMouse = true;
              gsap.to(heroSpotlightRef.current, { opacity: 1, duration: 0.6, ease: "power2.out" });
            }
            setSpotX(e.clientX);
            setSpotY(e.clientY);
            setOuterX(nx * -32);
            setOuterY(ny * -24);
            setInnerX(nx * 20);
            setInnerY(ny * 16);
            setInnerRot(nx * 12);
            setHeadX(nx * 10);
            setHeadY(ny * 7);
          }
        };
        window.addEventListener("pointermove", onPointer, { passive: true });
        return () => window.removeEventListener("pointermove", onPointer);
      }

      // Hero Slide Entrance
      let introFinished = false;
      const finishIntro = () => {
        if (introFinished) return;
        introFinished = true;
        setIsIntroComplete(true);
        if (heroPreInner.current) gsap.set(heroPreInner.current, { yPercent: 0, opacity: 1 });
        if (heroVaultInner.current) gsap.set(heroVaultInner.current, { yPercent: 0, opacity: 1 });
        if (heroSubInner.current) gsap.set(heroSubInner.current, { yPercent: 0, opacity: 1 });
        if (vaultFloat.current) gsap.set(vaultFloat.current, { opacity: 0, transformOrigin: "left top" });
        if (heroVaultInline.current) gsap.set(heroVaultInline.current, { opacity: 1, x: 0, y: 0, scale: 1 });
        measure();
      };
      finishIntroRef.current = finishIntro;

      const run = () => {
        measure();
        if (isCancelled() || introFinished) return;

        const heroTl = gsap.timeline({
          delay: 0.25,
          defaults: { ease: "power3.out" },
          onComplete: () => {
            introFinished = true;
            setIsIntroComplete(true);
            measure();
          },
        });

        heroTl
          .fromTo(
            heroPreInner.current,
            { yPercent: 125, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1.25, ease: "power3.out" }
          )
          .fromTo(
            heroVaultInner.current,
            { yPercent: 125, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1.35, ease: "power3.out" },
            "-=0.85"
          )
          .fromTo(
            heroSubInner.current,
            { yPercent: 125, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1.1, ease: "power3.out" },
            "-=0.7"
          );
      };

      const handleResize = () => {
        measure();
        if (activeSectionRef.current !== "hero" && vaultFloat.current && !isTransitioningRef.current) {
          gsap.set(vaultFloat.current, {
            x: flipRef.current.ex,
            y: flipRef.current.ey,
            scale: flipRef.current.es,
          });
        }
      };
      window.addEventListener("resize", handleResize);

      (document.fonts?.ready ?? Promise.resolve()).then(() => {
        if (isCancelled()) return;
        measure();
        run();
      });
    }, root);

    return () => {
      cancelled = true;
      if (beyondResetTimerRef.current) {
        clearTimeout(beyondResetTimerRef.current);
        beyondResetTimerRef.current = null;
      }
      playToolkitShowcaseRef.current = null;
      ctx.revert();
    };
  }, [measure]);

  const currentCanonicalKey = activeSection === "craft" ? "skills" : activeSection;
  const currentMenuItem = MENU.find((m) => m.key === currentCanonicalKey) ?? MENU[0];
  const currentAccentColor =
    currentCanonicalKey === "journey"
      ? JOURNEY[activeChapterIndex]?.accent.join(" ")
      : currentCanonicalKey === "beyond"
      ? BEYOND[activeBeyondIndex]?.accent.join(" ")
      : ROOMS[currentCanonicalKey as keyof typeof ROOMS]?.accent?.join(" ") || "10 10 10";
  const currentChamberBg = getChamberBg(activeSection, activeChapterIndex, activeBeyondIndex);
  const isChamberActive = activeSection !== "hero";

  return (
    <main id="main-content" ref={root} className="relative h-screen h-[100dvh] w-full overflow-hidden select-none">
      {/* ------------------------------------------------------------ NAV */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 sm:px-[6vw] py-2.5 sm:py-[3.4vh]">
        <div className="relative">
          <button
            ref={navGhost}
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="font-excon font-bold leading-none opacity-0 pointer-events-none select-none rounded"
            style={{ fontSize: NAV_VAULT_SIZE }}
          >
            Vault.
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Chapter Badge & Editorial Menu Trigger */}
          <button
            ref={mobileNavTriggerRef}
            type="button"
            onClick={() => {
              soundFX.playModalOpen();
              lastActiveElementRef.current = mobileNavTriggerRef.current;
              setIsMobileNavOpen(true);
            }}
            onMouseEnter={() => soundFX.playHoverTick()}
            aria-label="Open editorial section navigation"
            aria-expanded={isMobileNavOpen}
            aria-controls="mobile-nav-drawer"
            className={`lg:hidden text-xs font-mono font-medium rounded-full px-3 py-1.5 backdrop-blur-md active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-white ${
              isChamberActive
                ? "text-white hover:text-white border border-white/15 bg-black/60"
                : "text-neutral-800 hover:text-black border border-black/10 bg-white/90"
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
              style={{ backgroundColor: `rgb(${currentAccentColor})` }}
            />
            <span className={`font-semibold ${isChamberActive ? "text-neutral-300" : "text-neutral-500"}`}>{currentMenuItem.numeral}</span>
            <span className={isChamberActive ? "text-white/30" : "text-black/20"}>/</span>
            <span className={`font-excon font-bold tracking-tight ${isChamberActive ? "text-white" : "text-ink"}`}>{currentMenuItem.label}</span>
            <span className={`${isChamberActive ? "text-white/50" : "text-black/40"} text-[0.65rem] ml-0.5`}>▾</span>
          </button>
          <button
            ref={letsTalk}
            type="button"
            onClick={() => switchSectionTo("talk")}
            onMouseEnter={() => soundFX.playHoverTick()}
            aria-label="Go to connect section"
            className={`group will-reveal relative overflow-hidden flex items-center gap-2 sm:gap-2.5 font-excon font-bold leading-none rounded-full border-2 px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-base transition-all duration-300 ease-out hover:scale-108 hover:-translate-y-0.5 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ${
              isChamberActive
                ? "text-white border-white/35 hover:border-white hover:bg-white hover:text-black hover:shadow-[0_12px_28px_rgba(255,255,255,0.18)]"
                : "text-ink border-ink hover:bg-ink hover:text-bg hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
            }`}
          >
            {/* Morphing Envelope Icon: Closed envelope by default, transforms into an open envelope with letter on hover */}
            <span className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shrink-0">
              {/* Closed Envelope (Default) */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full absolute transition-all duration-300 ease-out group-hover:opacity-0 group-hover:scale-75 group-hover:-translate-y-1.5"
              >
                <rect width="20" height="15" x="2" y="5" rx="2" />
                <path d="m2 5 10 7 10-7" />
              </svg>

              {/* Open Envelope with Letter (Hover transformation) */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full absolute transition-all duration-300 ease-out opacity-0 scale-75 translate-y-1.5 group-hover:opacity-100 group-hover:scale-110 group-hover:translate-y-0 group-hover:-rotate-6"
              >
                <path d="M21.2 8.4c.5.3.8.8.8 1.4v8.2c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V9.8c0-.6.3-1.1.8-1.4l7.2-4.1a2 2 0 0 1 2 0l7.2 4.1z" />
                <path d="m2 10 10 6 10-6" />
                <path d="m2 20 7-6" />
                <path d="m22 20-7-6" />
                <path d="M7 6V3c0-.6.4-1 1-1h8c.6 0 1 .4 1 1v3" />
              </svg>
            </span>
            <span className="tracking-wide transition-transform duration-300 ease-out group-hover:translate-x-0.5">
              Connect
            </span>
          </button>
        </div>

        <button
          ref={vaultFloat}
          type="button"
          tabIndex={activeSection === "hero" ? -1 : 0}
          aria-label="Vault, return to welcome screen"
          onClick={() => {
            if (activeSectionRef.current !== "hero") {
              returnToHero();
            }
          }}
          onMouseEnter={() => {
            if (activeSectionRef.current !== "hero") {
              soundFX.playHoverTick();
            }
          }}
          className={`text-glow pointer-events-auto fixed left-0 top-0 font-excon font-bold leading-none cursor-pointer active:scale-95 border-0 bg-transparent p-0 z-50 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 rounded transition-colors duration-500 ${
            isChamberActive ? "text-white" : "text-ink"
          }`}
          style={{ fontSize: HEADING_SIZE, willChange: "transform" }}
        >
          Vault.
        </button>
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
        <section
          id="hero"
          aria-label="Introduction"
          style={{ touchAction: "none" }}
          onTouchMove={(e) => {
            e.preventDefault();
          }}
          onClick={handleHeroClick}
          className={`absolute inset-0 z-10 flex flex-col items-center justify-center px-4 sm:px-6 text-center select-none touch-none ${
            isIntroComplete ? "cursor-pointer" : "cursor-default"
          }`}
        >
          {/* Interactive background hover animations */}
          <div
            ref={heroBgRef}
            className="pointer-events-none absolute inset-0 overflow-hidden select-none"
            aria-hidden="true"
          >
            {/* Aceternity Dot Distortion Shader Background */}
            <DotDistortionShader
              dotGap={26}
              dotSize={1.4}
              mouseRadius={140}
              distortionStrength={22}
              returnSpeed={0.08}
              friction={0.84}
              dotColorRgb={[0, 0, 0]}
            />

            {/* Cursor spotlight */}
            <div
              ref={heroSpotlightRef}
              className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full w-[640px] h-[640px] will-change-transform opacity-0 pointer-events-none transition-opacity duration-700"
              style={{
                background: "radial-gradient(circle, rgba(0,0,0,0.045) 0%, rgba(0,0,0,0.015) 38%, transparent 72%)",
              }}
            />

            {/* Concentric Architectural Vault Reticle Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Outer dashed ring */}
              <div
                ref={heroRingOuterRef}
                className="w-[min(88vw,620px)] h-[min(88vw,620px)] rounded-full border border-dashed border-black/[0.045] will-change-transform pointer-events-none"
              />
              {/* Inner concentric ring with cardinal ticks */}
              <div
                ref={heroRingInnerRef}
                className="absolute w-[min(62vw,420px)] h-[min(62vw,420px)] rounded-full border border-black/[0.065] will-change-transform flex items-center justify-center pointer-events-none"
              >
                {/* Cardinal tick marks */}
                <div className="absolute -top-1 w-2.5 h-[2px] bg-black/20" />
                <div className="absolute -bottom-1 w-2.5 h-[2px] bg-black/20" />
                <div className="absolute -left-1 h-2.5 w-[2px] bg-black/20" />
                <div className="absolute -right-1 h-2.5 w-[2px] bg-black/20" />
              </div>
            </div>

            {/* Technical Blueprint Corner Markings */}
            <div className="hidden sm:block absolute top-8 left-8 lg:top-12 lg:left-12 font-mono text-[9px] tracking-widest text-black/20 uppercase pointer-events-none">
              SEC // 001 · ENTRANCE
            </div>
            <div className="hidden sm:block absolute top-8 right-8 lg:top-12 lg:right-12 font-mono text-[9px] tracking-widest text-black/20 uppercase pointer-events-none">
              SYS // ARMED
            </div>
            <div className="hidden sm:block absolute bottom-8 left-8 lg:bottom-12 lg:left-12 font-mono text-[9px] tracking-widest text-black/20 uppercase pointer-events-none">
              MODE // EXPLORER
            </div>
            <div className="hidden sm:block absolute bottom-8 right-8 lg:bottom-12 lg:right-12 font-mono text-[9px] tracking-widest text-black/20 uppercase pointer-events-none">
              EST // 2024
            </div>
          </div>
          <h1
            className="text-glow font-excon font-bold leading-[1.08] sm:leading-[1.02] text-ink flex flex-col sm:inline-flex sm:flex-row items-center justify-center text-center gap-0 sm:gap-2 select-none pointer-events-none"
            style={{ fontSize: HEADING_SIZE }}
          >
            <span ref={heroPre} className="inline-block overflow-hidden py-1">
              <span ref={heroPreInner} className="inline-block will-change-transform">
                {HERO_PRE}
              </span>
            </span>
            <span ref={heroVaultInline} className="inline-block overflow-hidden py-1">
              <span ref={heroVaultInner} className="inline-block will-change-transform">
                {HERO_VAULT}
              </span>
            </span>
          </h1>

          <div
            ref={scrollIndicator}
            onClick={(e) => {
              e.stopPropagation();
              if (isIntroComplete) {
                proceedToFirstSection();
              }
            }}
            onMouseEnter={() => soundFX.playHoverTick()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                proceedToFirstSection();
              }
            }}
            aria-label="Continue to intro section"
            className="group mt-[3vh] sm:mt-[4.5vh] flex w-full flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 rounded-xl p-2"
            style={{ maxWidth: "min(90vw, 560px)" }}
          >
            <div className="overflow-hidden py-1">
              <p
                ref={heroSubInner}
                className="text-center font-excon font-bold leading-none text-ink transition-transform duration-200 group-hover:-translate-y-0.5 will-change-transform flex items-center justify-center gap-2"
                style={{ fontSize: "clamp(0.92rem, 2.1vw, 1.45rem)" }}
              >
                <span>{SUBTITLE}</span>
              </p>
            </div>
            <div className="mt-2.5 flex items-center gap-2 text-neutral-400 font-mono text-[0.65rem] sm:text-xs tracking-wider transition-opacity duration-300">
              <span className="hidden sm:inline border border-black/10 rounded px-2 py-0.5 bg-black/[0.03]">Press any key</span>
              <span className="sm:hidden border border-black/10 rounded px-2 py-0.5 bg-black/[0.03]">Tap anywhere</span>
              <span className="text-black/35">to enter</span>
            </div>
          </div>
        </section>

        {/* ---------------------------------------- MAIN PANEL (Chamber) */}
        <div
          ref={mainPanel}
          className="absolute inset-0 z-20 overflow-hidden"
          style={{
            backgroundColor: currentChamberBg,
            transition: "background-color 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Full-bleed Landscape Portrait Billboard for Section 01 (Intro) */}
          <div
            className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-700 ease-in-out ${
              currentCanonicalKey === "about" ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/profile.jpg"
              alt="Tharun S"
              className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
            />
            {/* Left-side scrim: ensures sidebar navigation is crystal clear */}
            <div className="hidden lg:block absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-black/85 via-black/45 to-transparent pointer-events-none" />
            {/* Right-side scrim: ensures Tharun's name and editorial copy are razor sharp */}
            <div className="absolute inset-y-0 right-0 w-full sm:w-[60%] lg:w-[50%] bg-gradient-to-l from-black/90 via-black/60 to-transparent pointer-events-none" />
            {/* Top & Bottom subtle vignettes */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          </div>

          <div className="relative mx-auto flex h-full max-w-[1480px] items-center px-4 sm:px-6 lg:px-[5vw] lg:gap-[4%]">
            {/* Left: accordion chapter menu (desktop only) */}
            <nav aria-label="Section navigation" className="hidden lg:flex w-[28%] shrink-0 relative z-10">
              <ul
                ref={menu}
                className="w-full flex flex-col justify-center gap-[0.55rem] font-excon font-bold leading-[1.05]"
              >
                {MENU.map((item) => {
                  const isActive = currentCanonicalKey === item.key;
                  const isMultiLine = item.key === "beyond" && isBeyondMultiLine;
                  return (
                    <li
                      key={item.key}
                      data-key={item.key}
                      className="group will-reveal select-none"
                      style={{
                        fontSize: item.key === "about" ? MENU_ACTIVE : MENU_SMALL,
                        color: item.key === "about" ? INK_LIGHT : INK_DIM_LIGHT,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => switchSectionTo(item.key)}
                        onMouseEnter={() => soundFX.playHoverTick()}
                        aria-current={isActive ? "true" : undefined}
                        className={`w-full text-left flex ${
                          isMultiLine ? "items-start" : "items-center"
                        } justify-between py-1 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 active:scale-[0.98] transition-transform duration-150 border-0 bg-transparent p-0 text-inherit font-inherit`}
                      >
                        <span
                          className={`inline-flex ${
                            isMultiLine ? "items-start" : "items-center"
                          } transition-transform duration-300 ease-out group-hover:translate-x-2.5 group-active:translate-x-1`}
                        >
                          {"lines" in item && item.lines ? (
                            <span
                              className={`inline-flex transition-all duration-300 ease-out ${
                                isMultiLine
                                  ? "flex-col items-start leading-[0.92]"
                                  : "flex-row items-baseline gap-[0.28em] leading-normal"
                              }`}
                            >
                              <span className="transition-colors duration-200 group-hover:text-white">
                                {item.lines[0]}
                              </span>
                              <span className="transition-colors duration-200 group-hover:text-white">
                                {item.lines[1]}
                              </span>
                            </span>
                          ) : (
                            <span className="transition-colors duration-200 group-hover:text-white whitespace-nowrap">
                              {item.label}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Right: swappable content */}
            <div className="relative h-full flex-1 w-full pb-16 lg:pb-0">
              {/* About / Intro Section */}
              <section
                id="about"
                aria-label="About Tharun S"
                ref={aboutRight}
                className="absolute inset-0 flex items-center justify-end will-change-[transform,opacity] px-2 sm:px-4 lg:pr-6 2xl:pr-10"
              >
                <h2 className="sr-only">About Tharun S</h2>
                <div className="w-full max-w-[480px] lg:max-w-[500px] flex flex-col items-start text-left relative z-10">
                  {/* Category / Location Eyebrow */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-xs sm:text-[0.78rem] uppercase font-bold tracking-widest text-emerald-300">
                      INTRODUCTION · SYSTEM OPERATOR
                    </span>
                  </div>

                  {/* Tharun S Name */}
                  <h3
                    ref={aboutName}
                    className="will-reveal font-excon font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.04] drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
                  >
                    Tharun S
                  </h3>

                  {/* Role Subhead */}
                  <p className="mt-2 font-excon font-bold text-base sm:text-lg text-emerald-400 tracking-wide flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                    Product Engineer &amp; Full-Stack Builder
                  </p>

                  {/* Narrative Bio */}
                  <p
                    ref={aboutPara}
                    className="will-reveal mt-3 sm:mt-4 font-inter leading-relaxed text-neutral-200 text-xs sm:text-sm md:text-base drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
                  >
                    I enjoy building products where thoughtful design meets reliable engineering.
                    Every project is an opportunity to create something intuitive, purposeful, and crafted
                    with attention to detail.
                  </p>

                  {/* Key Provenance Chips */}
                  <div
                    ref={profile}
                    className="mt-4 sm:mt-5 flex flex-wrap gap-2 text-xs font-medium"
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 backdrop-blur-md px-3 py-1 text-white/90 shadow-sm">
                      <span>📍</span>
                      <span>Tamil Nadu, India</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 backdrop-blur-md px-3 py-1 text-white/90 shadow-sm">
                      <span>🎓</span>
                      <span>MCA @ PSG Tech</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 backdrop-blur-md px-3 py-1 text-white/90 shadow-sm">
                      <span>💼</span>
                      <span>Ex-Bajaj Finserv</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 backdrop-blur-md px-3 py-1 text-white/90 shadow-sm">
                      <span>📊</span>
                      <span>B.Sc. Data Analytics</span>
                    </span>
                  </div>

                  {/* Interactive Next Chapter Pill Button */}
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => switchSectionTo("journey")}
                      onMouseEnter={() => soundFX.playHoverTick()}
                      aria-label="Continue to Journey section"
                      className="group inline-flex items-center gap-2 rounded-full bg-white hover:bg-neutral-100 text-black px-5 py-2.5 font-inter text-xs sm:text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(0,0,0,0.4)] cursor-pointer"
                    >
                      <span>Explore Journey</span>
                      <span className="font-mono transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => switchSectionTo("works")}
                      onMouseEnter={() => soundFX.playHoverTick()}
                      aria-label="Jump directly to projects"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/15 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Projects ↗</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Journey — Editorial Chapter Showcase */}
              <section
                id="journey"
                aria-label="Journey timeline"
                ref={journeyRight}
                className="absolute inset-0 flex items-center justify-center will-change-[transform,opacity]"
              >
                <h2 className="sr-only">Journey Chapters</h2>
                <div className="w-full max-w-[820px] 2xl:max-w-[880px] flex flex-col gap-2.5 sm:gap-3.5">
                  {/* Section Context Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 sm:pb-2.5">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="h-2 w-2 rounded-full bg-white" />
                      <span className="font-excon font-bold text-xs sm:text-sm uppercase tracking-wider text-white">
                        The Journey
                      </span>
                      <span className="text-white/30 hidden sm:inline">·</span>
                      <span className="font-inter text-[0.68rem] sm:text-xs text-neutral-400 hidden sm:inline">
                        Every chapter added something to the person I am today.
                      </span>
                    </div>
                  </div>

                  {/* Chapter Navigation Tabs / Bar */}
                  <div className="flex items-center justify-between">
                    <div
                      role="tablist"
                      aria-label="Journey chapter selector"
                      className="flex items-center gap-1 sm:gap-2 flex-wrap"
                    >
                      {JOURNEY.map((step, i) => (
                        <button
                          key={step.title}
                          type="button"
                          role="tab"
                          id={`journey-tab-${i}`}
                          aria-controls={`journey-card-${i}`}
                          aria-selected={i === activeChapterIndex}
                          tabIndex={i === activeChapterIndex ? 0 : -1}
                          aria-label={`Chapter: ${step.title}`}
                          data-jtab={i}
                          onClick={() => handleChapterClick(i)}
                          onKeyDown={(e) => handleChapterKeyDown(e, i)}
                          onMouseEnter={() => soundFX.playHoverTick()}
                          className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ${i === activeChapterIndex
                            ? "bg-white text-black shadow-sm"
                            : "bg-white/10 text-white/70 hover:text-white hover:bg-white/20"
                            }`}
                        >
                          <span
                            aria-hidden="true"
                            className="w-1.5 h-1.5 rounded-full transition-transform duration-300 ease-out group-hover:scale-150"
                            style={{ backgroundColor: `rgb(${step.accent.join(" ")})` }}
                          />
                          <span className="hidden md:inline">{step.title}</span>
                          <span className="md:hidden">
                            {step.title === "The Business Perspective" ? "Business" : step.title}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleChapterClick(Math.max(0, activeChapterIndex - 1))}
                        disabled={activeChapterIndex === 0}
                        aria-label="Previous chapter"
                        className="h-7 w-7 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 flex items-center justify-center text-xs font-mono text-neutral-300 hover:text-white hover:border-white/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChapterClick(Math.min(JOURNEY.length - 1, activeChapterIndex + 1))}
                        disabled={activeChapterIndex === JOURNEY.length - 1}
                        aria-label="Next chapter"
                        className="h-7 w-7 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 flex items-center justify-center text-xs font-mono text-neutral-300 hover:text-white hover:border-white/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
                      >
                        →
                      </button>
                    </div>
                  </div>

                  {/* Stacked Chapter Cards */}
                  <div className="relative h-[430px] sm:h-[400px] md:h-[375px] w-full">
                    {JOURNEY.map((step, i) => (
                      <div
                        key={step.title}
                        id={`journey-card-${i}`}
                        role="tabpanel"
                        aria-labelledby={`journey-tab-${i}`}
                        tabIndex={0}
                        data-jcard={i}
                        className="absolute inset-0 rounded-[20px] sm:rounded-[24px] bg-neutral-900/90 sm:bg-neutral-900/80 backdrop-blur-xl p-4 sm:p-6 md:p-7 border shadow-[0_16px_48px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-y-auto sm:overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white will-change-[transform,opacity]"
                        style={{
                          borderColor: `rgb(${step.accent.join(" ")} / 0.45)`,
                        }}
                      >
                        <div>
                          {/* Top row: Chapter metadata badge + Metric display */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span
                                  className="inline-flex items-center gap-1 sm:gap-1.5 text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md"
                                  style={{
                                    backgroundColor: `rgb(${step.accent.join(" ")} / 0.16)`,
                                    color: `rgb(${step.accent.join(" ")})`,
                                  }}
                                >
                                  <span
                                    aria-hidden="true"
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: `rgb(${step.accent.join(" ")})` }}
                                  />
                                  {step.title}
                                </span>
                                {step.period && (
                                  <span className="text-[0.65rem] sm:text-xs font-inter text-neutral-400 font-medium">
                                    {step.period}
                                  </span>
                                )}
                              </div>

                              <h3 className="mt-2 sm:mt-3 font-excon text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-white break-words">
                                {step.primary}
                              </h3>
                              {step.secondary && (
                                <p className="mt-0.5 sm:mt-1 font-inter text-xs sm:text-sm md:text-base text-neutral-300 font-medium">
                                  {step.secondary}
                                </p>
                              )}
                            </div>

                            {step.metric && (
                              <div className="flex flex-col items-start sm:items-end shrink-0 self-start rounded-xl sm:rounded-2xl bg-white/[0.05] border border-white/10 px-2.5 py-1.5 sm:px-4 sm:py-2 transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] cursor-default">
                                <div className="flex items-baseline font-excon font-bold text-lg sm:text-2xl md:text-3xl text-white leading-none">
                                  <span>{step.metric}</span>
                                  {step.metricUnit && (
                                    <span className="text-xs sm:text-lg font-light ml-0.5 text-neutral-300">
                                      {step.metricUnit}
                                    </span>
                                  )}
                                </div>
                                {step.metricLabel && (
                                  <span className="mt-0.5 text-[0.62rem] sm:text-[0.68rem] font-semibold uppercase tracking-widest text-neutral-400">
                                    {step.metricLabel}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="my-2 sm:my-3.5 h-px w-full bg-white/10" />

                          {/* Narrative Story */}
                          <p className="font-inter text-neutral-200 text-xs sm:text-sm md:text-[0.94rem] leading-relaxed max-w-[66ch]">
                            {step.body}
                          </p>
                        </div>

                        {/* Bottom row: Acquired skills */}
                        <div className="mt-2 sm:mt-3.5 pt-2 sm:pt-3 border-t border-white/10 flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="text-[0.65rem] sm:text-[0.7rem] uppercase font-semibold tracking-wider text-neutral-400 mr-1">
                            Acquired:
                          </span>
                          {step.skills.map((skill) => (
                            <span
                              key={skill}
                              className="group/pill inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 sm:px-3 sm:py-1 text-[0.68rem] sm:text-xs font-medium text-neutral-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15 hover:shadow-sm cursor-default"
                            >
                              <span
                                aria-hidden="true"
                                className="font-bold text-[0.65rem] sm:text-[0.7rem] transition-transform duration-200 group-hover/pill:scale-125"
                                style={{ color: `rgb(${step.accent.join(" ")})` }}
                              >
                                ✓
                              </span>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Closing Sign-Off Note */}
                  <div className="mt-2 sm:mt-2.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 border-t border-white/10 pt-2 sm:pt-2.5">
                    <span className="font-mono text-[0.68rem] sm:text-xs font-bold uppercase tracking-wider text-white shrink-0">
                      The story continues.
                    </span>
                    <p className="font-inter text-[0.68rem] sm:text-xs text-neutral-400 leading-normal">
                      I&apos;m still learning, experimenting, and figuring things out. Every chapter has given me a different perspective, and I&apos;m looking forward to seeing what I build with all of them.
                    </p>
                  </div>
                </div>
              </section>

              {/* Toolkit — The Cabinet of Accumulated Capabilities */}
              <section
                id="skills"
                aria-label="Toolkit & Capabilities"
                ref={craftRight}
                className="absolute inset-0 flex items-center justify-center will-change-[transform,opacity]"
              >
                <h2 className="sr-only">Toolkit &amp; Capabilities</h2>
                <div className="w-full max-w-[940px] 2xl:max-w-[1020px] flex flex-col gap-2.5 sm:gap-4">
                  {/* Context Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 sm:pb-2.5">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="font-excon font-bold text-xs sm:text-sm uppercase tracking-wider text-white">
                        Toolkit
                      </span>
                      <span className="text-white/30 hidden sm:inline">·</span>
                      <span className="font-inter text-[0.68rem] sm:text-xs text-neutral-400 hidden sm:inline">
                        16 Capabilities accumulated across the journey
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <span
                        data-toolkit-status
                        className="font-mono text-[0.68rem] sm:text-xs font-semibold text-neutral-400"
                      >
                        16 Capabilities Unlocked
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          playToolkitShowcaseRef.current?.(true);
                        }}
                        onMouseEnter={() => soundFX.playHoverTick()}
                        aria-label="Replay toolkit showcase animation"
                        className="group flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[0.65rem] sm:text-xs font-mono font-medium text-neutral-300 transition-all hover:border-white/35 hover:text-white hover:bg-white/10 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <span className="transition-transform duration-300 group-hover:rotate-180">↺</span>
                        <span className="hidden sm:inline">Replay</span>
                      </button>
                    </div>
                  </div>

                  {/* Video-style Progress Bar */}
                  <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden -mt-1 sm:-mt-2">
                    <div
                      data-toolkit-progress
                      className="h-full bg-cyan-400 origin-left transition-opacity duration-300"
                      style={{ transform: "scaleX(0)" }}
                    />
                  </div>

                  {/* 4 Cards Grid */}
                  <div className="grid w-full grid-cols-2 gap-2.5 sm:gap-6 lg:gap-8">
                    {CRAFT_CATEGORIES.map((cat, ci) => {
                      const tally = cat.skills.reduce<Record<number, number>>((m, s) => {
                        const o = originOf(s);
                        m[o] = (m[o] ?? 0) + 1;
                        return m;
                      }, {});
                      const dominant = Number(
                        Object.keys(tally).sort((a, b) => tally[Number(b)] - tally[Number(a)])[0]
                      );
                      return (
                        <div
                          key={cat.name}
                          data-craft-card={ci}
                          className="relative rounded-[16px] sm:rounded-[24px] p-3.5 sm:p-7 lg:p-8 transition-shadow duration-300 hover:shadow-[0_20px_48px_rgba(0,0,0,0.6)] bg-neutral-900/80 backdrop-blur-xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
                          style={
                            {
                              "--origin-rgb": JOURNEY[dominant].accent.join(" "),
                            } as React.CSSProperties
                          }
                        >
                          <svg
                            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                            aria-hidden
                          >
                            <rect
                              x="0.75"
                              y="0.75"
                              width="calc(100% - 1.5px)"
                              height="calc(100% - 1.5px)"
                              rx="16"
                              fill="none"
                              stroke="rgb(var(--origin-rgb))"
                              strokeOpacity="0.65"
                              strokeWidth="1.5"
                            />
                            <rect
                              data-craft-trace
                              x="0.75"
                              y="0.75"
                              width="calc(100% - 1.5px)"
                              height="calc(100% - 1.5px)"
                              rx="16"
                              fill="none"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              pathLength={100}
                              style={{
                                stroke: "rgb(var(--origin-rgb))",
                                strokeDasharray: 100,
                                strokeDashoffset: 100,
                                filter: "drop-shadow(0 0 6px rgb(var(--origin-rgb) / 0.55))",
                              }}
                            />
                          </svg>

                          <h3
                            data-craft-head
                            className="font-inter font-semibold uppercase text-white/60 text-[0.68rem] sm:text-xs tracking-wider"
                          >
                            {cat.name}
                          </h3>
                          <ul className="mt-2 sm:mt-5 space-y-1 sm:space-y-3.5">
                            {cat.skills.map((s) => {
                              const origin = originOf(s);
                              return (
                                <li
                                  key={s}
                                  data-craft-item
                                  onMouseEnter={() => soundFX.playHoverTick()}
                                  className="group relative flex items-baseline gap-1.5 sm:gap-3 font-inter text-neutral-200 text-xs sm:text-sm md:text-base transition-transform duration-200 ease-out hover:translate-x-1.5 hover:text-white cursor-default"
                                  style={
                                    {
                                      "--origin-rgb": JOURNEY[origin].accent.join(" "),
                                    } as React.CSSProperties
                                  }
                                >
                                  <span
                                    data-craft-check
                                    className="text-origin inline-block font-semibold text-xs sm:text-sm transition-transform duration-200 group-hover:scale-125 group-hover:rotate-6"
                                  >
                                    ✓
                                  </span>
                                  <span data-craft-name className="inline-block font-medium truncate sm:whitespace-normal">
                                    {s}
                                  </span>
                                  <span
                                    aria-hidden
                                    className="hidden sm:block pointer-events-none absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-md border border-white/15 px-2 py-1 font-inter uppercase text-white/85 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 text-[0.65rem] tracking-wider bg-neutral-800/95 shadow-md"
                                  >
                                    Earned during {JOURNEY[origin].title}
                                  </span>
                                  <span className="sr-only">
                                    , earned during {JOURNEY[origin].title}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Works — Expandable Project Showcase */}
              <section
                id="works"
                aria-label="Selected Works"
                ref={worksRight}
                className="absolute inset-0 flex items-center justify-center will-change-[transform,opacity]"
              >
                <h2 className="sr-only">Selected Projects</h2>
                <div className="w-full max-w-[880px] 2xl:max-w-[960px] flex flex-col gap-2 sm:gap-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 sm:pb-2.5">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-excon font-bold text-xs sm:text-sm uppercase tracking-wider text-white">
                        Selected Projects
                      </span>
                      <span className="text-white/30 hidden sm:inline">·</span>
                      <span className="font-inter text-[0.68rem] sm:text-xs text-neutral-400 hidden sm:inline">
                        Five core engineering systems engineered for depth and precision.
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 font-mono text-[0.65rem] text-neutral-400">
                      <span>Keys:</span>
                      <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-white/10 text-neutral-300 font-mono">1–5</kbd>
                      <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-white/10 text-neutral-300 font-mono">← / →</kbd>
                    </div>
                  </div>
                  <WorksExpandable />
                </div>
              </section>

              {/* Beyond Work — Personal life, hobbies, and disciplines */}
              <section
                id="beyond"
                aria-label="Beyond Work"
                ref={beyondRight}
                className="absolute inset-0 flex items-center justify-center will-change-[transform,opacity]"
              >
                <h2 className="sr-only">Off Script</h2>
                <div className="w-full max-w-[880px] 2xl:max-w-[960px] flex flex-col gap-2 sm:gap-4">
                  {/* Context Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 sm:pb-2.5">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="font-excon font-bold text-xs sm:text-sm uppercase tracking-wider text-white">
                        Off Script
                      </span>
                      <span className="text-white/30 hidden sm:inline">·</span>
                      <span className="font-inter text-[0.68rem] sm:text-xs text-neutral-400 hidden sm:inline">
                        A little more about the person behind the pixels.
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 font-mono text-[0.65rem] text-neutral-400">
                      <span>Keys:</span>
                      <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-white/10 text-neutral-300 font-mono">1–4</kbd>
                      <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-white/10 text-neutral-300 font-mono">← / →</kbd>
                    </div>
                  </div>

                  <OffScriptShowcase
                    activeIndex={activeBeyondIndex}
                    onSelectIndex={(idx) => handleBeyondChapterClick(idx)}
                  />
                </div>
              </section>

              {/* Connect — In-scroll contact destination */}
              <section
                id="talk"
                aria-label="Connect"
                ref={talkRight}
                className="absolute inset-0 flex items-center justify-center will-change-[transform,opacity]"
              >
                <h2 className="sr-only">Connect</h2>
                <div className="w-full max-w-[680px] rounded-[28px] sm:rounded-[36px] border border-white/10 bg-neutral-900/90 backdrop-blur-2xl p-6 sm:p-10 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col justify-between text-white">
                  <div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Available for opportunities
                      </span>
                    </div>

                    <h3 className="mt-4 sm:mt-5 font-excon text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
                      Let’s build something exceptional.
                    </h3>
                    <p className="mt-2 sm:mt-3 font-inter text-sm sm:text-base text-neutral-300 leading-relaxed max-w-[54ch]">
                      Have a product to build, an engineering opportunity, or just want to connect? Reach out directly or connect on social platforms.
                    </p>
                  </div>

                  <div className="mt-6 sm:mt-8 flex flex-col gap-3.5">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5 text-white">
                      <div>
                        <span className="block text-[0.7rem] uppercase font-semibold tracking-wider text-neutral-400">
                          Direct Communication
                        </span>
                        <a
                          href="mailto:tharun@example.com"
                          className="font-inter text-base sm:text-lg font-bold text-white hover:text-emerald-400 transition-colors"
                        >
                          tharun@example.com
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          className={`flex-1 sm:flex-initial rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white ${copiedEmail
                            ? "bg-emerald-600 text-white scale-105 shadow-md shadow-emerald-600/25"
                            : "bg-white text-black hover:bg-neutral-200 hover:shadow-sm"
                            }`}
                        >
                          {copiedEmail ? "Copied! ✓" : "Copy Email"}
                        </button>
                        <a
                          href="mailto:tharun@example.com"
                          className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
                        >
                          Send ↗
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={() => soundFX.playHoverTick()}
                        className="group flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15 hover:shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <span>GitHub</span>
                        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 font-mono">
                          ↗
                        </span>
                      </a>
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={() => soundFX.playHoverTick()}
                        className="group flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15 hover:shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <span>LinkedIn</span>
                        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 font-mono">
                          ↗
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------- MOBILE FLOATING SECTION NAV DOCK */}
      <nav
        aria-label="Quick section navigation"
        className={`lg:hidden fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] inset-x-0 mx-auto w-fit z-40 transition-all duration-300 pointer-events-auto select-none ${
          activeSection === "hero"
            ? "opacity-0 pointer-events-none translate-y-4"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="flex items-center gap-0.5 p-1 rounded-full bg-neutral-900/90 backdrop-blur-xl border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
          {MENU.map((item) => {
            const isActive = currentCanonicalKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => switchSectionTo(item.key)}
                onMouseEnter={() => soundFX.playHoverTick()}
                aria-current={isActive ? "true" : undefined}
                aria-label={`Go to section ${item.label}`}
                className={`flex items-center justify-center transition-all duration-300 ease-out active:scale-95 cursor-pointer rounded-full font-mono ${
                  isActive
                    ? "bg-white text-black px-3 py-1.5 gap-1.5 shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/10 px-2 py-1.5 text-xs font-medium"
                }`}
              >
                <span className={`text-[0.68rem] ${isActive ? "text-black/80 font-semibold" : "text-white/60 font-mono"}`}>
                  {item.numeral}
                </span>
                {isActive && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-black/40" />
                    <span className="font-excon font-bold text-xs tracking-tight whitespace-nowrap text-black">
                      {item.label}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ------------------------------------------- MOBILE FULLSCREEN EDITORIAL NAV */}
      {isMobileNavOpen && (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Section navigation"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-neutral-950 text-white p-6 sm:p-10 select-none animate-in fade-in duration-200"
        >
          {/* Top Bar inside modal */}
          <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="font-excon font-bold text-xl sm:text-2xl text-white">
                Vault.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                soundFX.playModalClose();
                setIsMobileNavOpen(false);
                lastActiveElementRef.current?.focus();
              }}
              onMouseEnter={() => soundFX.playHoverTick()}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-neutral-300 hover:text-white hover:border-white/35 hover:bg-white/10 transition-all active:scale-90 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close navigation"
            >
              <span className="font-mono text-base">✕</span>
            </button>
          </div>

          {/* Center Accordion Menu — exact same design pattern as desktop */}
          <nav aria-label="Mobile sections list" className="relative z-10 my-auto flex flex-col justify-center gap-3 sm:gap-4 py-4">
            {MENU.map((item) => {
              const isActive = currentCanonicalKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    soundFX.playMenuClick();
                    setIsMobileNavOpen(false);
                    switchSectionTo(item.key);
                  }}
                  onMouseEnter={() => soundFX.playHoverTick()}
                  aria-current={isActive ? "true" : undefined}
                  className="group flex items-baseline text-left transition-all duration-200 active:scale-[0.98] border-0 bg-transparent p-0 cursor-pointer"
                >
                  <span
                    className={`font-excon font-bold leading-none tracking-tight transition-all duration-200 ${
                      isActive
                        ? "text-3xl sm:text-4xl text-white"
                        : "text-xl sm:text-2xl text-white/40 group-hover:text-white/80 group-hover:translate-x-1.5"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Bottom quick contact footer inside modal */}
          <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-xs text-neutral-400 font-mono">
            <span>Tharun S · Portfolio</span>
            <button
              type="button"
              onClick={() => {
                soundFX.playMenuClick();
                setIsMobileNavOpen(false);
                switchSectionTo("talk");
              }}
              className="text-white font-semibold hover:underline cursor-pointer"
            >
              Get in touch →
            </button>
          </div>
        </div>
      )}

      {/* --------------------------------------------------- FOOTER LANDMARK */}
      <footer aria-label="Contact and portfolio credits" className="sr-only">
        <h2>Contact &amp; Links</h2>
        <p>Tharun S — Available for product design and engineering opportunities. Version 1.2.5.</p>
        <ul>
          <li><a href="mailto:tharun@example.com">tharun@example.com</a></li>
          <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
        </ul>
      </footer>
    </main>
  );
}
