"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import ProfileSilhouette from "./ProfileSilhouette";
import { WorksExpandable } from "./WorksExpandable";
import { soundFX } from "@/lib/audio";

gsap.registerPlugin(ScrollTrigger);

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
const INK = "rgb(0 0 0)";
const INK_DIM = "rgb(123 123 123)";

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
  const root = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Hero
  const heroPre = useRef<HTMLSpanElement>(null);
  const heroPreInner = useRef<HTMLSpanElement>(null);
  const heroVaultInline = useRef<HTMLSpanElement>(null);
  const heroVaultInner = useRef<HTMLSpanElement>(null);
  const heroSubInner = useRef<HTMLParagraphElement>(null);
  const scrollIndicator = useRef<HTMLDivElement>(null);

  // Scroll Progress
  const scrollProgressBar = useRef<HTMLDivElement>(null);

  // Nav
  const navGhost = useRef<HTMLButtonElement>(null);
  const vaultFloat = useRef<HTMLButtonElement>(null);
  const letsTalk = useRef<HTMLButtonElement>(null);

  // Main panel (About, Journey, Craft, Works share it)
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
  const [decryptKey, setDecryptKey] = useState(0);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [isBeyondMultiLine, setIsBeyondMultiLine] = useState(false);
  const beyondResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const lockedSectionRef = useRef<"journey" | "skills" | "beyond" | null>(null);
  const accumulatedDeltaRef = useRef(0);
  const isProgrammaticScrollRef = useRef(false);
  const rubberResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const switchJourneyChapterRef = useRef<((idx: number) => void) | null>(null);
  const switchBeyondChapterRef = useRef<((idx: number) => void) | null>(null);
  const playToolkitShowcaseRef = useRef<((force?: boolean) => void) | null>(null);
  const ensureSectionLoadedRef = useRef<((key: string) => void) | null>(null);
  const navTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      lenisRef.current?.stop();
    } else {
      document.body.style.overflow = "auto";
      lenisRef.current?.start();
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

  const measureRef = useRef<() => void>(() => { });
  const finishIntroRef = useRef<() => void>(() => { });

  const handleCopyEmail = () => {
    soundFX.playSuccessChime();
    navigator.clipboard?.writeText("tharun@example.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleMenuClick = (key: string) => {
    if (navTimeoutRef.current) {
      clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = null;
    }
    soundFX.playMenuClick();
    lockedSectionRef.current = null;
    accumulatedDeltaRef.current = 0;
    isProgrammaticScrollRef.current = true;
    document.documentElement.classList.add("nav-animating");

    // Immediately load target section content so clicking left menu headers never lands on white blank space
    ensureSectionLoadedRef.current?.(key);

    if (!lenisRef.current) {
      isProgrammaticScrollRef.current = false;
      document.documentElement.classList.remove("nav-animating");
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isFromHero = activeSection === "hero" || window.scrollY < window.innerHeight * 0.5;
    const dur = reduced ? 0 : (isFromHero && key === "about" ? 1.6 : 0.6);
    const finishNav = (after?: () => void) => {
      navTimeoutRef.current = setTimeout(() => {
        ensureSectionLoadedRef.current?.(key);
        isProgrammaticScrollRef.current = false;
        document.documentElement.classList.remove("nav-animating");
        after?.();
      }, 100);
    };
    switch (key) {
      case "about":
        lenisRef.current.scrollTo(window.innerHeight * 1.2, {
          duration: dur,
          onComplete: () => finishNav(),
        });
        break;
      case "journey":
        lenisRef.current.scrollTo(window.innerHeight * 2.0, {
          duration: dur,
          onComplete: () => finishNav(() => { lockedSectionRef.current = "journey"; }),
        });
        break;
      case "skills":
      case "craft":
        lenisRef.current.scrollTo(window.innerHeight * 2.8, {
          duration: dur,
          onComplete: () =>
            finishNav(() => {
              lockedSectionRef.current = "skills";
            }),
        });
        break;
      case "works":
        lenisRef.current.scrollTo(window.innerHeight * 4.6, {
          duration: dur,
          onComplete: () => finishNav(),
        });
        break;
      case "beyond":
        lenisRef.current.scrollTo(window.innerHeight * 5.8, {
          duration: dur,
          onComplete: () => finishNav(() => { lockedSectionRef.current = "beyond"; }),
        });
        break;
      case "talk":
        lenisRef.current.scrollTo(window.innerHeight * 6.8, {
          duration: dur,
          onComplete: () => finishNav(),
        });
        break;
    }
  };

  const proceedToFirstSection = () => {
    if (isProgrammaticScrollRef.current) return;
    soundFX.unlockAudio();
    soundFX.playCabinetUnlock();
    if (!hasInteracted) {
      setHasInteracted(true);
      setDecryptKey((k) => k + 1);
    }
    handleMenuClick("about");
  };

  const handleHeroClick = () => {
    if (!isIntroComplete) return;
    proceedToFirstSection();
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (!isIntroComplete) return;
      if (activeSection !== "hero" && window.scrollY >= window.innerHeight * 0.5) return;
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

      proceedToFirstSection();
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!isIntroComplete) return;
      if (activeSection !== "hero" && window.scrollY >= window.innerHeight * 0.5) return;
      if (isMobileNavOpen) return;

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (["Tab", "Shift", "Control", "Alt", "Meta", "CapsLock", "Escape"].includes(e.key)) {
        return;
      }

      e.preventDefault();
      proceedToFirstSection();
    };

    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isIntroComplete, activeSection, isMobileNavOpen]);

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

  const handleBeyondTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = Math.min(BEYOND.length - 1, index + 1);
      switchBeyondChapterRef.current?.(next);
      document.getElementById(`beyond-tab-${next}`)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = Math.max(0, index - 1);
      switchBeyondChapterRef.current?.(prev);
      document.getElementById(`beyond-tab-${prev}`)?.focus();
    }
  };

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    const isCancelled = () => cancelled;

    // Pointer-parallax listener for the About room.
    let pointerListener: (() => void) | null = null;
    let cleanupWheelListeners: (() => void) | null = null;

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", (e: { progress?: number }) => {
      ScrollTrigger.update();
      if (scrollProgressBar.current) {
        const p =
          typeof e?.progress === "number"
            ? e.progress
            : window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        scrollProgressBar.current.style.transform = `scaleX(${Math.min(Math.max(p, 0), 1)})`;
      }
    });
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(500, 33);

    const blockEvent = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    const blockKeyScroll = (e: KeyboardEvent) => {
      if (
        ["Space", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(e.code) ||
        [" ", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(e.key)
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };

    let isIntroLocked = false;
    const lockScroll = () => {
      if (isIntroLocked) return;
      isIntroLocked = true;
      document.documentElement.classList.add("vault-locked");
      lenis.stop();
      window.addEventListener("wheel", blockEvent, { capture: true, passive: false });
      window.addEventListener("touchmove", blockEvent, { capture: true, passive: false });
      window.addEventListener("keydown", blockKeyScroll, { capture: true });
    };
    const unlockScroll = () => {
      if (!isIntroLocked) return;
      isIntroLocked = false;
      document.documentElement.classList.remove("vault-locked");
      lenis.start();
      window.removeEventListener("wheel", blockEvent, { capture: true });
      window.removeEventListener("touchmove", blockEvent, { capture: true });
      window.removeEventListener("keydown", blockKeyScroll, { capture: true });
    };

    // Hero "Vault." → nav-logo flight measurement.
    const flip = { sx: 0, sy: 0, ex: 0, ey: 0, es: 1 };
    const measure = () => {
      if (!heroVaultInline.current || !navGhost.current) return;
      const from = heroVaultInline.current.getBoundingClientRect();
      const to = navGhost.current.getBoundingClientRect();
      if (!from.height || !to.height) return;
      flip.sx = from.left;
      flip.sy = from.top;
      flip.ex = to.left;
      flip.ey = to.top;
      flip.es = to.height / from.height;
    };
    measureRef.current = measure;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);

      const menuItems = menu.current?.querySelectorAll("li") ?? [];

      const jCards = q("[data-jcard]") as HTMLElement[];
      const jTabs = q("[data-jtab]") as HTMLElement[];
      const jCount = q("[data-jcount]")[0] ?? null;
      const bCards = q("[data-bcard]") as HTMLElement[];
      const bTabs = q("[data-btab]") as HTMLElement[];
      const bCount = q("[data-bcount]")[0] ?? null;
      const blobs = q("[data-blob]");
      const craftCount = (q("[data-craft-count]")[0] as HTMLElement | undefined) ?? null;
      const craftCards = q("[data-craft-card]") as HTMLElement[];

      const setRoom = (accent: readonly number[], lift: number, dur = 0.9) =>
        gsap.to(root.current, {
          "--accent-rgb": accent.join(" "),
          "--accent-lift": lift,
          duration: reduced ? 0 : dur,
          ease: "power2.inOut",
          overwrite: "auto",
        });

      // -------- Starting states --------
      gsap.set(root.current, {
        "--accent-rgb": ROOMS.welcome.accent.join(" "),
        "--accent-lift": ROOMS.welcome.lift,
      });
      gsap.set(mainPanel.current, { yPercent: 100 });
      gsap.set(vaultFloat.current, { opacity: 0, transformOrigin: "left top" });

      // Initialize all menu items consistently
      menuItems.forEach((li) => {
        const isAbout = li.getAttribute("data-key") === "about";
        gsap.set(li, {
          fontSize: isAbout ? getActiveMenuSize() : MENU_SMALL,
          color: isAbout ? INK : INK_DIM,
        });
      });

      // Authoritative Left Accordion Menu Controller
      let currentActiveKey = "about";
      const setActiveMenu = (key: string, immediate = false) => {
        if (currentActiveKey === key && !immediate) return;
        currentActiveKey = key;

        // Manage multi-line layout for Beyond Work with seamless transition timing
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
            // Keep multi-line layout during GSAP font-size shrink (380ms) to prevent card overlap
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
            color: isActive ? INK : INK_DIM,
            duration: immediate ? 0 : 0.38,
            ease: "power2.out",
            overwrite: "auto",
          });
        });
      };

      const updateActiveMenuFromScroll = (immediate = false) => {
        if (isProgrammaticScrollRef.current) return;
        const scrollY = window.scrollY;
        const h = window.innerHeight;
        if (scrollY < h * 0.7) {
          setActiveSection("hero");
        } else if (scrollY < h * 1.6) {
          setActiveMenu("about", immediate);
          setActiveSection("about");
        } else if (scrollY < h * 2.4) {
          setActiveMenu("journey", immediate);
          setActiveSection("journey");
        } else if (scrollY < h * 4.0) {
          setActiveMenu("skills", immediate);
          setActiveSection("skills");
        } else if (scrollY < h * 5.2) {
          setActiveMenu("works", immediate);
          setActiveSection("works");
        } else if (scrollY < h * 6.4) {
          setActiveMenu("beyond", immediate);
          setActiveSection("beyond");
        } else {
          setActiveMenu("talk", immediate);
          setActiveSection("talk");
        }
      };

      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: () => updateActiveMenuFromScroll(false),
        onRefresh: () => updateActiveMenuFromScroll(true),
      });

      gsap.set(journeyRight.current, { autoAlpha: 0, y: 34 });
      gsap.set(craftRight.current, { autoAlpha: 0, y: 34 });
      gsap.set(worksRight.current, { autoAlpha: 0, y: 34 });
      gsap.set(beyondRight.current, { autoAlpha: 0, y: 34 });
      gsap.set(talkRight.current, { autoAlpha: 0, y: 34 });

      // Journey cards starting states:
      jCards.forEach((card, i) => {
        gsap.set(card, {
          opacity: i === 0 ? 1 : 0,
          y: i === 0 ? 0 : 20,
          pointerEvents: i === 0 ? "auto" : "none",
        });
      });

      // Craft cards starting states (visible by default; automated showcase animates them sequentially when scrolled into)
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

      // Beyond cards starting states:
      bCards.forEach((card, i) => {
        gsap.set(card, {
          opacity: i === 0 ? 1 : 0,
          y: i === 0 ? 0 : 20,
          pointerEvents: i === 0 ? "auto" : "none",
        });
      });

      // In-place Chapter & Category Transition Engines
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
            tab.classList.add("bg-black", "text-white", "shadow-sm");
            tab.classList.remove("bg-black/[0.04]", "text-black/60");
            tab.setAttribute("aria-selected", "true");
            tab.setAttribute("tabindex", "0");
          } else {
            tab.classList.remove("bg-black", "text-white", "shadow-sm");
            tab.classList.add("bg-black/[0.04]", "text-black/60");
            tab.setAttribute("aria-selected", "false");
            tab.setAttribute("tabindex", "-1");
          }
        });

        if (jCount) jCount.textContent = `0${newIndex + 1}`;
        setRoom(JOURNEY[newIndex].accent, JOURNEY[newIndex].lift, 0.45);
      };
      switchJourneyChapterRef.current = switchJourneyChapter;

      let isBeyondCardAnimating = false;
      const switchBeyondChapter = (newIndex: number) => {
        const currentIndex = activeBeyondRef.current;
        if (currentIndex === newIndex || isBeyondCardAnimating) return;
        isBeyondCardAnimating = true;
        soundFX.playTabSwitch();
        activeBeyondRef.current = newIndex;
        setActiveBeyondIndex(newIndex);

        const direction = newIndex > currentIndex ? 1 : -1;

        if (bCards[currentIndex]) {
          gsap.to(bCards[currentIndex], {
            opacity: 0,
            y: -14 * direction,
            scale: 0.98,
            duration: 0.3,
            ease: "power2.out",
          });
          bCards[currentIndex].style.pointerEvents = "none";
        }

        if (bCards[newIndex]) {
          gsap.fromTo(
            bCards[newIndex],
            { opacity: 0, y: 16 * direction, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.36,
              ease: "power2.out",
              onComplete: () => {
                isBeyondCardAnimating = false;
              },
            }
          );
          bCards[newIndex].style.pointerEvents = "auto";

          // Masked kinetic line reveal on the category headline:
          const headline = bCards[newIndex].querySelector("[data-bhead]");
          if (headline) {
            gsap.fromTo(
              headline,
              { yPercent: 120, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.65, ease: "power4.out", delay: 0.05 }
            );
          }

          // Micro-stagger on the interest tags:
          const pills = bCards[newIndex].querySelectorAll("[data-bpill]");
          if (pills.length) {
            gsap.fromTo(
              pills,
              { y: 8, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.32, stagger: 0.03, ease: "power3.out", delay: 0.12 }
            );
          }
        } else {
          isBeyondCardAnimating = false;
        }

        bTabs.forEach((tab, i) => {
          if (i === newIndex) {
            tab.classList.add("bg-black", "text-white", "shadow-sm");
            tab.classList.remove("bg-black/[0.04]", "text-black/60");
            tab.setAttribute("aria-selected", "true");
            tab.setAttribute("tabindex", "0");
          } else {
            tab.classList.remove("bg-black", "text-white", "shadow-sm");
            tab.classList.add("bg-black/[0.04]", "text-black/60");
            tab.setAttribute("aria-selected", "false");
            tab.setAttribute("tabindex", "-1");
          }
        });

        if (bCount) bCount.textContent = `0${newIndex + 1}`;
        setRoom(BEYOND[newIndex].accent, BEYOND[newIndex].lift, 0.45);
      };
      switchBeyondChapterRef.current = switchBeyondChapter;

      // Magnetic Snap & Section Locking with Tactile Rubber-Band Friction
      const FRICTION_THRESHOLD = 95;

      const lockToSection = (section: "journey" | "skills" | "beyond", anchorMultiplier: number) => {
        if (isProgrammaticScrollRef.current) return;
        lockedSectionRef.current = section;
        accumulatedDeltaRef.current = 0;
        isProgrammaticScrollRef.current = true;
        lenisRef.current?.scrollTo(window.innerHeight * anchorMultiplier, {
          duration: 0.55,
          onComplete: () => {
            setTimeout(() => {
              isProgrammaticScrollRef.current = false;
              lockedSectionRef.current = section;
            }, 80);
          },
        });
      };

      const releaseSection = (direction: "next" | "prev", locked: "journey" | "skills" | "beyond") => {
        accumulatedDeltaRef.current = 0;
        lockedSectionRef.current = null;
        isProgrammaticScrollRef.current = true;

        const targetContainer =
          locked === "journey"
            ? journeyRight.current
            : locked === "skills"
            ? craftRight.current
            : beyondRight.current;
        if (targetContainer) {
          gsap.to(targetContainer, { y: 0, duration: 0.2 });
        }

        soundFX.playMenuClick();

        let targetScroll = 0;
        if (locked === "journey") {
          targetScroll = direction === "next" ? window.innerHeight * 2.8 : window.innerHeight * 1.2;
        } else if (locked === "skills") {
          targetScroll = direction === "next" ? window.innerHeight * 4.6 : window.innerHeight * 2.0;
        } else {
          targetScroll = direction === "next" ? window.innerHeight * 6.8 : window.innerHeight * 4.6;
        }

        document.documentElement.classList.add("nav-animating");
        lenisRef.current?.scrollTo(targetScroll, {
          duration: 0.85,
          onComplete: () => {
            setTimeout(() => {
              isProgrammaticScrollRef.current = false;
              document.documentElement.classList.remove("nav-animating");
            }, 180);
          },
        });
      };

      const onWheel = (e: WheelEvent) => {
        if (isProgrammaticScrollRef.current) {
          e.preventDefault();
          return;
        }
        // Remove scroll feature from Hero: only tapping anywhere or pressing any key continues
        if (window.scrollY < window.innerHeight * 0.5) {
          e.preventDefault();
          return;
        }
        const locked = lockedSectionRef.current;
        if (!locked) return;

        e.preventDefault();
        accumulatedDeltaRef.current += e.deltaY;

        const targetContainer =
          locked === "journey"
            ? journeyRight.current
            : locked === "skills"
            ? craftRight.current
            : beyondRight.current;
        if (targetContainer) {
          const rubberY = -Math.sign(accumulatedDeltaRef.current) * Math.min(Math.pow(Math.abs(accumulatedDeltaRef.current), 0.72) * 0.75, 14);
          gsap.to(targetContainer, {
            y: rubberY,
            duration: 0.1,
            overwrite: "auto",
          });
        }

        if (rubberResetTimerRef.current) clearTimeout(rubberResetTimerRef.current);
        rubberResetTimerRef.current = setTimeout(() => {
          accumulatedDeltaRef.current = 0;
          if (targetContainer) {
            gsap.to(targetContainer, { y: 0, duration: 0.35, ease: "elastic.out(1, 0.4)" });
          }
        }, 160);

        if (accumulatedDeltaRef.current >= FRICTION_THRESHOLD) {
          releaseSection("next", locked);
        } else if (accumulatedDeltaRef.current <= -FRICTION_THRESHOLD) {
          releaseSection("prev", locked);
        }
      };

      let touchStartY = 0;
      let touchStartX = 0;

      const onTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      };

      const onTouchMove = (e: TouchEvent) => {
        if (isProgrammaticScrollRef.current) {
          e.preventDefault();
          return;
        }
        // Remove scroll feature from Hero: only tapping anywhere or pressing any key continues
        if (window.scrollY < window.innerHeight * 0.5) {
          e.preventDefault();
          return;
        }
        const locked = lockedSectionRef.current;
        if (!locked) return;

        const deltaY = touchStartY - e.touches[0].clientY;
        const deltaX = touchStartX - e.touches[0].clientX;

        if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && Math.abs(deltaX) > 40) {
          if (deltaX > 0) {
            if (locked === "journey") {
              switchJourneyChapter(Math.min(JOURNEY.length - 1, activeChapterRef.current + 1));
            } else {
              switchBeyondChapter(Math.min(BEYOND.length - 1, activeBeyondRef.current + 1));
            }
          } else {
            if (locked === "journey") {
              switchJourneyChapter(Math.max(0, activeChapterRef.current - 1));
            } else {
              switchBeyondChapter(Math.max(0, activeBeyondRef.current - 1));
            }
          }
          touchStartX = e.touches[0].clientX;
          return;
        }

        e.preventDefault();
        accumulatedDeltaRef.current += deltaY * 1.5;

        const targetContainer =
          locked === "journey"
            ? journeyRight.current
            : locked === "skills"
            ? craftRight.current
            : beyondRight.current;
        if (targetContainer) {
          const rubberY = -Math.sign(accumulatedDeltaRef.current) * Math.min(Math.abs(accumulatedDeltaRef.current) * 0.1, 14);
          gsap.to(targetContainer, { y: rubberY, duration: 0.1, overwrite: "auto" });
        }

        if (accumulatedDeltaRef.current >= FRICTION_THRESHOLD) {
          releaseSection("next", locked);
        } else if (accumulatedDeltaRef.current <= -FRICTION_THRESHOLD) {
          releaseSection("prev", locked);
        }
      };

      const onTouchEnd = () => {
        accumulatedDeltaRef.current = 0;
        if (journeyRight.current) gsap.to(journeyRight.current, { y: 0, duration: 0.35, ease: "elastic.out(1, 0.4)" });
        if (beyondRight.current) gsap.to(beyondRight.current, { y: 0, duration: 0.35, ease: "elastic.out(1, 0.4)" });
      };

      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", onTouchEnd, { passive: true });
      cleanupWheelListeners = () => {
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchEnd);
      };



      // ---------------- About: an occupied room, not a still ----------------
      const portrait = q("[data-portrait]")[0] ?? null;
      const portraitGlow = q("[data-portrait-glow]")[0] ?? null;
      const sheen = q("[data-sheen]")[0] ?? null;
      const pPortrait = q('[data-parallax="portrait"]')[0] ?? null;
      const pText = q('[data-parallax="text"]')[0] ?? null;

      if (!reduced) {
        gsap.to(portrait, {
          y: -7,
          duration: 4.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
        gsap.to(portraitGlow, {
          opacity: 0.55,
          scale: 1.06,
          duration: 5.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          transformOrigin: "50% 50%",
        });
        gsap
          .timeline({ repeat: -1, repeatDelay: 6.5 })
          .fromTo(
            sheen,
            { xPercent: 0, opacity: 0 },
            { xPercent: 620, opacity: 0.32, duration: 1.7, ease: "power2.inOut" }
          )
          .to(sheen, { opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.5");

        const setPX = gsap.quickTo(pPortrait, "x", { duration: 0.9, ease: "power3" });
        const setPY = gsap.quickTo(pPortrait, "y", { duration: 0.9, ease: "power3" });
        const setTX = gsap.quickTo(pText, "x", { duration: 1.1, ease: "power3" });
        const setTY = gsap.quickTo(pText, "y", { duration: 1.1, ease: "power3" });
        const onPointer = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          setPX(nx * 26);
          setPY(ny * 18);
          setTX(nx * -10);
          setTY(ny * -7);
        };
        window.addEventListener("pointermove", onPointer, { passive: true });
        pointerListener = () => window.removeEventListener("pointermove", onPointer);
      }

      // ======== PHASE 1 — hero → About (scrubbed, playful cinematic vault opening) ========
      const spatial = gsap.timeline({ defaults: { ease: "none" } });
      spatial
        // Wordmark flight: smooth spatial glide with subtle playful rotation
        .fromTo(
          vaultFloat.current,
          { x: () => flip.sx, y: () => flip.sy, scale: 1, rotate: 0 },
          { x: () => flip.ex, y: () => flip.ey, scale: () => flip.es, rotate: -2, duration: 0.78, ease: "power2.inOut" },
          0
        )
        // Hero subtitle sinks playfully with slight scale down
        .to(scrollIndicator.current, { y: 36, scale: 0.92, opacity: 0, duration: 0.4, ease: "power2.in" }, 0)
        // "Welcome to my" floats up with slight scale down
        .to(heroPre.current, { yPercent: -90, scale: 0.94, opacity: 0, duration: 0.44, ease: "power2.in" }, 0)
        // Main panel rises like a vault chamber door
        .to(mainPanel.current, { yPercent: 0, duration: 0.76, ease: "power2.out" }, 0)
        // Vault wordmark settles straight as it docks in nav
        .to(vaultFloat.current, { rotate: 0, duration: 0.22, ease: "back.out(2)" }, 0.78)
        // "Connect" pill button drops in with a springy pop
        .fromTo(letsTalk.current, { y: -24, scale: 0.85, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.32, ease: "back.out(2)" }, 0.68)
        // Left Accordion menu items cascade in like a domino deck from left with a playful bounce
        .fromTo(menuItems, { x: -36, opacity: 0, scale: 0.92 }, { x: 0, opacity: 1, scale: 1, duration: 0.38, stagger: 0.055, ease: "back.out(1.6)" }, 0.7)
        // Profile portrait springs up with a joyful slight tilt and settles
        .fromTo(profile.current, { scale: 0.8, rotate: -4, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.42, ease: "back.out(1.8)" }, 0.72)
        // "Tharun S" heading rises with spring
        .fromTo(aboutName.current, { y: 30, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.36, ease: "back.out(1.5)" }, 0.78)
        // Bio paragraph fades and settles into place
        .fromTo(aboutPara.current, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.36, ease: "power3.out" }, 0.82);

      const swapToFloat = () => {
        gsap.set(heroVaultInline.current, { opacity: 0 });
        gsap.set(vaultFloat.current, { opacity: 1 });
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
        onEnter: () => {
          swapToFloat();
          setActiveSection("about");
          setRoom(ROOMS.about.accent, ROOMS.about.lift, 1.2);
        },
        onLeaveBack: () => {
          swapToInline();
          setActiveSection("hero");
          setRoom(ROOMS.welcome.accent, ROOMS.welcome.lift, 1.2);
        },
      });

      // ======== PHASE 2a — About → Journey (scrubbed) ========
      const enterJourney = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      enterJourney
        .to(aboutRight.current, { autoAlpha: 0, y: -28, duration: 0.4 }, 0)
        .to(journeyRight.current, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.25);

      ScrollTrigger.create({
        trigger: root.current,
        start: () => "top+=" + window.innerHeight * 1.4 + " top",
        end: () => "top+=" + window.innerHeight * 1.9 + " top",
        scrub: true,
        animation: enterJourney,
        onEnter: () => setRoom(JOURNEY[activeChapterRef.current].accent, JOURNEY[activeChapterRef.current].lift, 0.8),
        onLeaveBack: () => setRoom(ROOMS.about.accent, ROOMS.about.lift, 0.8),
      });

      // ======== PHASE 2b — Journey Magnetic Snap & Lock ========
      ScrollTrigger.create({
        trigger: root.current,
        start: () => "top+=" + window.innerHeight * 1.85 + " top",
        end: () => "top+=" + window.innerHeight * 2.15 + " top",
        onEnter: () => {
          if (!isProgrammaticScrollRef.current && lockedSectionRef.current !== "journey") {
            lockToSection("journey", 2.0);
          }
        },
        onEnterBack: () => {
          if (!isProgrammaticScrollRef.current && lockedSectionRef.current !== "journey") {
            lockToSection("journey", 2.0);
          }
        },
        onLeave: () => {
          if (lockedSectionRef.current === "journey" && !isProgrammaticScrollRef.current) {
            lockedSectionRef.current = null;
          }
        },
        onLeaveBack: () => {
          if (lockedSectionRef.current === "journey" && !isProgrammaticScrollRef.current) {
            lockedSectionRef.current = null;
          }
        },
      });

      // ======== PHASE 3a — Journey → Skills Panel Entrance ========
      const craftTransition = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      craftTransition
        .to(journeyRight.current, { autoAlpha: 0, y: -28, duration: 0.4 }, 0)
        .to(craftRight.current, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.25);

      ScrollTrigger.create({
        trigger: root.current,
        start: () => "top+=" + window.innerHeight * 2.2 + " top",
        end: () => "top+=" + window.innerHeight * 2.7 + " top",
        scrub: true,
        animation: craftTransition,
        onEnter: () => setRoom(ROOMS.craft.accent, ROOMS.craft.lift, 0.8),
        onLeaveBack: () => setRoom(JOURNEY[activeChapterRef.current].accent, JOURNEY[activeChapterRef.current].lift, 0.8),
      });

      // ======== PHASE 3b — Skills Video-Like Showcase (Section-Only Animation) ========
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

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
          const trace = card.querySelector("[data-craft-trace]");
          const head = card.querySelector("[data-craft-head]");
          const checks = card.querySelectorAll("[data-craft-check]");
          const names = card.querySelectorAll("[data-craft-name]");
          const startTime = ci * 0.58;

          tl.to(
            card,
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              onStart: () => {
                soundFX.playHoverTick();
              },
            },
            startTime
          )
            .to(trace, { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut" }, startTime + 0.04)
            .to(head, { opacity: 1, y: 0, duration: 0.22 }, startTime + 0.12)
            .to(
              checks,
              {
                opacity: 1,
                scale: 1,
                duration: 0.25,
                stagger: 0.06,
                ease: "back.out(1.5)",
              },
              startTime + 0.18
            )
            .to(
              names,
              {
                opacity: 1,
                x: 0,
                duration: 0.22,
                stagger: 0.06,
              },
              startTime + 0.2
            )
            .to(trace, { strokeOpacity: 0.45, duration: 0.25 }, startTime + 0.52);
        });
      };
      playToolkitShowcaseRef.current = playToolkitShowcase;

      ScrollTrigger.create({
        trigger: root.current,
        start: () => "top+=" + window.innerHeight * 2.65 + " top",
        end: () => "top+=" + window.innerHeight * 3.0 + " top",
        onEnter: () => {
          if (!isProgrammaticScrollRef.current && lockedSectionRef.current !== "skills") {
            lockToSection("skills", 2.8);
            if (!hasToolkitPlayed) {
              playToolkitShowcase();
            }
          }
        },
        onEnterBack: () => {
          if (!isProgrammaticScrollRef.current && lockedSectionRef.current !== "skills") {
            lockToSection("skills", 2.8);
          }
        },
        onLeave: () => {
          if (lockedSectionRef.current === "skills" && !isProgrammaticScrollRef.current) {
            lockedSectionRef.current = null;
          }
        },
        onLeaveBack: () => {
          if (lockedSectionRef.current === "skills" && !isProgrammaticScrollRef.current) {
            lockedSectionRef.current = null;
          }
        },
      });

      // ======== PHASE 4 — Craft → Works ========
      const worksTransition = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      worksTransition
        .to(craftRight.current, { autoAlpha: 0, y: -28, duration: 0.4 }, 0)
        .to(worksRight.current, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.25);

      ScrollTrigger.create({
        trigger: root.current,
        start: () => "top+=" + window.innerHeight * 3.6 + " top",
        end: () => "top+=" + window.innerHeight * 4.3 + " top",
        scrub: true,
        animation: worksTransition,
        onEnter: () => setRoom(ROOMS.works.accent, ROOMS.works.lift, 0.8),
        onLeaveBack: () => setRoom(ROOMS.craft.accent, ROOMS.craft.lift, 0.8),
      });

      // Ensure Section Loaded Engine (Immediate visual loading on left menu header clicks)
      const ensureSectionLoaded = (sectionKey: string) => {
        const canonical = sectionKey === "craft" ? "skills" : sectionKey;
        setActiveMenu(canonical, false);
        setActiveSection(canonical);

        const isInsideVault = window.scrollY >= window.innerHeight * 0.5;
        if (isInsideVault) {
          if (mainPanel.current) {
            gsap.to(mainPanel.current, { yPercent: 0, duration: 0.25, ease: "power2.out", overwrite: "auto" });
          }
          if (heroVaultInline.current) gsap.to(heroVaultInline.current, { opacity: 0, duration: 0.2, overwrite: "auto" });
          if (vaultFloat.current) gsap.to(vaultFloat.current, { opacity: 1, duration: 0.2, overwrite: "auto" });
        }

        const panels: Record<string, HTMLElement | null> = {
          about: aboutRight.current,
          journey: journeyRight.current,
          skills: craftRight.current,
          craft: craftRight.current,
          works: worksRight.current,
          beyond: beyondRight.current,
          talk: talkRight.current,
        };

        Object.entries(panels).forEach(([k, panel]) => {
          if (!panel) return;
          const isTarget = k === canonical || (canonical === "skills" && k === "craft");
          if (isTarget) {
            gsap.to(panel, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });
          } else if (k !== "craft") {
            gsap.to(panel, { autoAlpha: 0, duration: 0.2, overwrite: "auto" });
          }
        });

        if (canonical === "skills") {
          hasToolkitPlayed = true;
          isToolkitAnimating = false;
          if (currentToolkitTl) {
            currentToolkitTl.kill();
            currentToolkitTl = null;
          }
          craftCards.forEach((card) => {
            const trace = card.querySelector("[data-craft-trace]");
            const head = card.querySelector("[data-craft-head]");
            const checks = card.querySelectorAll("[data-craft-check]");
            const names = card.querySelectorAll("[data-craft-name]");
            gsap.to(card, { opacity: 1, y: 0, duration: 0.25, overwrite: "auto" });
            if (trace) gsap.to(trace, { strokeDashoffset: 0, strokeOpacity: 0.45, duration: 0.25, overwrite: "auto" });
            if (head) gsap.to(head, { opacity: 1, y: 0, duration: 0.25, overwrite: "auto" });
            if (checks) gsap.to(checks, { opacity: 1, scale: 1, duration: 0.25, overwrite: "auto" });
            if (names) gsap.to(names, { opacity: 1, x: 0, duration: 0.25, overwrite: "auto" });
          });
          const progressBar = craftRight.current?.querySelector("[data-toolkit-progress]");
          if (progressBar) gsap.to(progressBar, { scaleX: 1, opacity: 0.35, duration: 0.25, overwrite: "auto" });
          const statusEl = craftRight.current?.querySelector("[data-toolkit-status]");
          if (statusEl) statusEl.textContent = "16 Capabilities Unlocked";
          setRoom(ROOMS.craft.accent, ROOMS.craft.lift, 0.45);
        } else if (canonical === "journey") {
          jCards.forEach((card, i) => {
            const isActive = i === activeChapterRef.current;
            gsap.to(card, {
              opacity: isActive ? 1 : 0,
              y: isActive ? 0 : 20,
              duration: 0.25,
              overwrite: "auto",
            });
            card.style.pointerEvents = isActive ? "auto" : "none";
          });
          setRoom(JOURNEY[activeChapterRef.current].accent, JOURNEY[activeChapterRef.current].lift, 0.45);
        } else if (canonical === "beyond") {
          bCards.forEach((card, i) => {
            const isActive = i === activeBeyondRef.current;
            gsap.to(card, {
              opacity: isActive ? 1 : 0,
              y: isActive ? 0 : 20,
              duration: 0.25,
              overwrite: "auto",
            });
            card.style.pointerEvents = isActive ? "auto" : "none";
          });
          setRoom(BEYOND[activeBeyondRef.current].accent, BEYOND[activeBeyondRef.current].lift, 0.45);
        } else if (canonical === "works") {
          setRoom(ROOMS.works.accent, ROOMS.works.lift, 0.45);
        } else if (canonical === "talk") {
          setRoom(ROOMS.talk.accent, ROOMS.talk.lift, 0.45);
        } else if (canonical === "about") {
          setRoom(ROOMS.about.accent, ROOMS.about.lift, 0.45);
        }
      };
      ensureSectionLoadedRef.current = ensureSectionLoaded;

      // ======== PHASE 5a — Works → Beyond Work ========
      const worksToBeyond = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      worksToBeyond
        .to(worksRight.current, { autoAlpha: 0, y: -28, duration: 0.4 }, 0)
        .to(beyondRight.current, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.25);

      ScrollTrigger.create({
        trigger: root.current,
        start: () => "top+=" + window.innerHeight * 5.1 + " top",
        end: () => "top+=" + window.innerHeight * 5.7 + " top",
        scrub: true,
        animation: worksToBeyond,
        onEnter: () => {
          setRoom(BEYOND[activeBeyondRef.current].accent, BEYOND[activeBeyondRef.current].lift, 0.8);
          const activeCard = bCards[activeBeyondRef.current];
          if (activeCard) {
            const headline = activeCard.querySelector("[data-bhead]");
            if (headline) {
              gsap.fromTo(
                headline,
                { yPercent: 120, opacity: 0 },
                { yPercent: 0, opacity: 1, duration: 0.65, ease: "power4.out" }
              );
            }
          }
        },
        onLeaveBack: () => setRoom(ROOMS.works.accent, ROOMS.works.lift, 0.8),
      });

      // ======== PHASE 5b — Beyond Work Magnetic Snap & Lock ========
      ScrollTrigger.create({
        trigger: root.current,
        start: () => "top+=" + window.innerHeight * 5.65 + " top",
        end: () => "top+=" + window.innerHeight * 5.95 + " top",
        onEnter: () => {
          if (!isProgrammaticScrollRef.current && lockedSectionRef.current !== "beyond") {
            lockToSection("beyond", 5.8);
          }
        },
        onEnterBack: () => {
          if (!isProgrammaticScrollRef.current && lockedSectionRef.current !== "beyond") {
            lockToSection("beyond", 5.8);
          }
        },
        onLeave: () => {
          if (lockedSectionRef.current === "beyond" && !isProgrammaticScrollRef.current) {
            lockedSectionRef.current = null;
          }
        },
        onLeaveBack: () => {
          if (lockedSectionRef.current === "beyond" && !isProgrammaticScrollRef.current) {
            lockedSectionRef.current = null;
          }
        },
      });

      // ======== PHASE 6 — Beyond Work → Let's Talk ========
      const beyondToTalk = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      beyondToTalk
        .to(beyondRight.current, { autoAlpha: 0, y: -28, duration: 0.4 }, 0)
        .to(talkRight.current, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.25);

      ScrollTrigger.create({
        trigger: root.current,
        start: () => "top+=" + window.innerHeight * 6.0 + " top",
        end: () => "top+=" + window.innerHeight * 6.6 + " top",
        scrub: true,
        animation: beyondToTalk,
        onEnter: () => setRoom(ROOMS.talk.accent, ROOMS.talk.lift, 0.8),
        onLeaveBack: () => setRoom(BEYOND[activeBeyondRef.current].accent, BEYOND[activeBeyondRef.current].lift, 0.8),
      });

      // -------- Reduced motion --------
      if (reduced) {
        if (heroPreInner.current) gsap.set(heroPreInner.current, { yPercent: 0, opacity: 1 });
        if (heroVaultInner.current) gsap.set(heroVaultInner.current, { yPercent: 0, opacity: 1 });
        if (heroSubInner.current) gsap.set(heroSubInner.current, { yPercent: 0, opacity: 1 });
        gsap.set(craftCards, { opacity: 1, y: 0 });
        craftCards.forEach((card) => {
          const trace = card.querySelector("[data-craft-trace]");
          const head = card.querySelector("[data-craft-head]");
          const checks = card.querySelectorAll("[data-craft-check]");
          const names = card.querySelectorAll("[data-craft-name]");
          if (trace) gsap.set(trace, { strokeDashoffset: 0, strokeOpacity: 0.45 });
          if (head) gsap.set(head, { opacity: 1, y: 0 });
          if (checks) gsap.set(checks, { opacity: 1, scale: 1 });
          if (names) gsap.set(names, { opacity: 1, x: 0 });
        });
        if (craftCount) craftCount.textContent = "16";
        bCards.forEach((c, i) => {
          gsap.set(c, {
            opacity: i === 0 ? 1 : 0,
            y: 0,
            pointerEvents: i === 0 ? "auto" : "none",
          });
        });
        measure();
        setIsIntroComplete(true);
        unlockScroll();
        ScrollTrigger.refresh();
        return;
      }

      // -------- Hero Slide Entrance --------
      lockScroll();

      let introFinished = false;
      const finishIntro = () => {
        if (introFinished) return;
        introFinished = true;
        setIsIntroComplete(true);
        if (heroPreInner.current) gsap.set(heroPreInner.current, { yPercent: 0, opacity: 1 });
        if (heroVaultInner.current) gsap.set(heroVaultInner.current, { yPercent: 0, opacity: 1 });
        if (heroSubInner.current) gsap.set(heroSubInner.current, { yPercent: 0, opacity: 1 });
        measure();
        unlockScroll();
        ScrollTrigger.refresh();
      };
      finishIntroRef.current = finishIntro;

      const run = () => {
        measure();
        if (isCancelled() || introFinished) {
          unlockScroll();
          return;
        }

        const heroTl = gsap.timeline({
          delay: 0.25,
          defaults: { ease: "power3.out" },
          onComplete: () => {
            introFinished = true;
            setIsIntroComplete(true);
            measure();
            unlockScroll();
            ScrollTrigger.refresh();
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

      (document.fonts?.ready ?? Promise.resolve()).then(() => {
        if (isCancelled()) return;
        measure();
        ScrollTrigger.refresh();
        run();
      });
    }, root);

    return () => {
      cancelled = true;
      if (beyondResetTimerRef.current) {
        clearTimeout(beyondResetTimerRef.current);
        beyondResetTimerRef.current = null;
      }
      if (rubberResetTimerRef.current) {
        clearTimeout(rubberResetTimerRef.current);
        rubberResetTimerRef.current = null;
      }
      cleanupWheelListeners?.();
      unlockScroll();
      ensureSectionLoadedRef.current = null;
      playToolkitShowcaseRef.current = null;
      if (navTimeoutRef.current) {
        clearTimeout(navTimeoutRef.current);
        navTimeoutRef.current = null;
      }
      pointerListener?.();
      gsap.ticker.remove(tick);
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  const currentCanonicalKey = activeSection === "craft" ? "skills" : activeSection;
  const currentMenuItem = MENU.find((m) => m.key === currentCanonicalKey) ?? MENU[0];
  const currentAccentColor =
    currentCanonicalKey === "journey"
      ? JOURNEY[activeChapterIndex]?.accent.join(" ")
      : currentCanonicalKey === "beyond"
      ? BEYOND[activeBeyondIndex]?.accent.join(" ")
      : ROOMS[currentCanonicalKey as keyof typeof ROOMS]?.accent?.join(" ") || "10 10 10";

  return (
    <main id="main-content" ref={root} className="relative h-[800vh] w-full">
      {/* ---------------------------------- VIEWPORT SCROLL PROGRESS HAIRLINE */}
      <div
        aria-hidden
        ref={scrollProgressBar}
        className="fixed top-0 left-0 right-0 z-[100] h-[2.5px] bg-black/85 origin-left pointer-events-none shadow-[0_1px_4px_rgba(0,0,0,0.12)] will-change-transform"
        style={{ transform: "scaleX(0)" }}
      />

      {/* ------------------------------------------------------------ NAV */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 sm:px-[6vw] py-2.5 sm:py-[3.4vh]">
        <div className="relative">
          <button
            ref={navGhost}
            type="button"
            onClick={() => {
              soundFX.playMenuClick();
              const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              lenisRef.current?.scrollTo(0, { duration: reduced ? 0 : 1.2 });
            }}
            aria-label="Vault, return to top"
            className="font-excon font-bold leading-none opacity-0 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded"
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
            className="lg:hidden text-xs font-mono font-medium text-neutral-800 hover:text-black border border-black/10 rounded-full px-3 py-1.5 bg-white/90 backdrop-blur-md active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-black"
          >
            <span
              className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
              style={{ backgroundColor: `rgb(${currentAccentColor})` }}
            />
            <span className="font-semibold text-neutral-500">{currentMenuItem.numeral}</span>
            <span className="text-black/20">/</span>
            <span className="font-excon font-bold tracking-tight text-ink">{currentMenuItem.label}</span>
            <span className="text-black/40 text-[0.65rem] ml-0.5">▾</span>
          </button>
          <button
            ref={letsTalk}
            type="button"
            onClick={() => handleMenuClick("talk")}
            onMouseEnter={() => soundFX.playHoverTick()}
            aria-label="Scroll to connect section"
            className="group will-reveal flex items-center gap-1.5 sm:gap-2 font-excon font-bold leading-none text-ink rounded-full border-2 border-ink px-3.5 py-1.5 sm:px-5 sm:py-2.5 text-xs sm:text-sm transition-all duration-200 hover:bg-ink hover:text-bg hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] active:scale-95 active:translate-y-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            <span>Connect</span>
            <span aria-hidden="true" className="inline-block transition-transform duration-200 ease-out group-hover:translate-y-0.5 font-mono text-[0.85em]">
              ↓
            </span>
          </button>
        </div>

        <button
          ref={vaultFloat}
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => {
            soundFX.playMenuClick();
            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            lenisRef.current?.scrollTo(0, { duration: reduced ? 0 : 1.2 });
          }}
          className="text-glow pointer-events-auto fixed left-0 top-0 font-excon font-bold leading-none text-ink cursor-pointer active:scale-95 transition-transform duration-150 border-0 bg-transparent p-0"
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
          onClick={handleHeroClick}
          className={`absolute inset-0 z-10 flex flex-col items-center justify-center px-4 sm:px-6 text-center select-none ${
            isIntroComplete ? "cursor-pointer" : "cursor-default"
          }`}
        >
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

        {/* ---------------------------------------- MAIN PANEL (About / Journey) */}
        <div ref={mainPanel} className="absolute inset-0 z-20 bg-bg">
          {/* Panel atmosphere — the panel is opaque (it occludes the hero as it
              rolls up), so it carries its own lighting layers. */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="vault-radial" />
            <div className="vault-grain" />
            <div className="vault-vignette" />
          </div>
          <div className="relative mx-auto flex h-full max-w-[1480px] items-center px-4 sm:px-6 lg:px-[5vw] lg:gap-[4%]">
            {/* Left: accordion chapter menu (desktop only) */}
            <nav aria-label="Section navigation" className="hidden lg:flex w-[28%] shrink-0">
              <ul
                ref={menu}
                className="w-full flex flex-col justify-center gap-[0.55rem] font-excon font-bold leading-[1.05]"
              >
                {MENU.map((item) => {
                  const isActive = activeSection === item.key;
                  const isMultiLine = item.key === "beyond" && isBeyondMultiLine;
                  return (
                    <li
                      key={item.key}
                      data-key={item.key}
                      className="group will-reveal select-none"
                      style={{
                        fontSize: item.key === "about" ? MENU_ACTIVE : MENU_SMALL,
                        color: item.key === "about" ? INK : INK_DIM,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleMenuClick(item.key)}
                        onMouseEnter={() => soundFX.playHoverTick()}
                        aria-current={isActive ? "true" : undefined}
                        className={`w-full text-left flex ${isMultiLine ? "items-start" : "items-center"
                          } justify-between py-1 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 active:scale-[0.98] transition-transform duration-150 border-0 bg-transparent p-0 text-inherit font-inherit`}
                      >
                        <span
                          className={`inline-flex ${isMultiLine ? "items-start" : "items-center"
                            } gap-3 transition-transform duration-300 ease-out group-hover:translate-x-2.5 group-active:translate-x-1`}
                        >
                          <span
                            className={`font-mono text-xs sm:text-sm tracking-wider transition-opacity duration-200 ${isMultiLine ? "mt-[0.22em]" : ""
                              } ${isActive ? "opacity-100 font-bold" : "opacity-45"}`}
                          >
                            {item.numeral}
                          </span>
                          {"lines" in item && item.lines ? (
                            <span
                              className={`inline-flex transition-all duration-300 ease-out ${isMultiLine
                                ? "flex-col items-start leading-[0.92]"
                                : "flex-row items-baseline gap-[0.28em] leading-normal"
                                }`}
                            >
                              <span className="transition-colors duration-200 group-hover:text-black">
                                {item.lines[0]}
                              </span>
                              <span className="transition-colors duration-200 group-hover:text-black">
                                {item.lines[1]}
                              </span>
                            </span>
                          ) : (
                            <span className="transition-colors duration-200 group-hover:text-black whitespace-nowrap">
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
              {/* About */}
              <section
                id="about"
                aria-label="About Tharun S"
                ref={aboutRight}
                className="absolute inset-0 flex items-center justify-center will-change-[transform,opacity]"
              >
                <h2 className="sr-only">About Tharun S</h2>
                <div className="flex w-full max-w-[440px] flex-col items-center text-center">
                  <div ref={profile} className="will-reveal relative w-[clamp(160px,18vw,280px)]">
                    <div data-portrait-glow aria-hidden className="hidden" />
                    <div data-parallax="portrait">
                      <div
                        data-portrait
                        className="aspect-square overflow-hidden rounded-[26px] sm:rounded-[36px] border-[10px] sm:border-[12px] md:border-[16px] border-black bg-white shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.12)] hover:scale-[1.02] transition-all duration-500 ease-out cursor-default"
                      >
                        <ProfileSilhouette />
                      </div>
                    </div>
                  </div>
                  <div data-parallax="text" className="w-full mt-5 sm:mt-7 flex flex-col items-center text-center">
                    <h3
                      ref={aboutName}
                      className="will-reveal font-excon font-bold leading-none text-ink text-2xl sm:text-3xl lg:text-4xl text-center"
                    >
                      Tharun S
                    </h3>
                    <p
                      ref={aboutPara}
                      className="will-reveal mt-3 sm:mt-4 font-inter leading-relaxed text-ink/85 text-xs sm:text-sm md:text-base max-w-[42ch] text-center"
                    >
                      I enjoy building products where thoughtful design meets reliable
                      engineering. Every project is an opportunity to create something
                      intuitive, purposeful, and crafted with attention to detail.
                    </p>
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
                  <div className="flex items-center justify-between border-b border-black/8 pb-2 sm:pb-2.5">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="h-2 w-2 rounded-full bg-neutral-900" />
                      <span className="font-excon font-bold text-xs sm:text-sm uppercase tracking-wider text-black">
                        The Journey
                      </span>
                      <span className="text-black/30 hidden sm:inline">·</span>
                      <span className="font-inter text-[0.68rem] sm:text-xs text-neutral-500 hidden sm:inline">
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
                          className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${i === activeChapterIndex
                            ? "bg-black text-white shadow-sm"
                            : "bg-black/[0.04] text-black/60 hover:text-black hover:bg-black/[0.08]"
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
                        className="h-7 w-7 rounded-full border border-black/10 flex items-center justify-center text-xs font-mono text-neutral-600 hover:text-black hover:border-black/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-black"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChapterClick(Math.min(JOURNEY.length - 1, activeChapterIndex + 1))}
                        disabled={activeChapterIndex === JOURNEY.length - 1}
                        aria-label="Next chapter"
                        className="h-7 w-7 rounded-full border border-black/10 flex items-center justify-center text-xs font-mono text-neutral-600 hover:text-black hover:border-black/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-black"
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
                        className="absolute inset-0 rounded-[20px] sm:rounded-[24px] bg-white p-4 sm:p-6 md:p-7 border shadow-[0_12px_36px_rgba(0,0,0,0.04)] flex flex-col justify-between overflow-y-auto sm:overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black will-change-[transform,opacity]"
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
                                    backgroundColor: `rgb(${step.accent.join(" ")} / 0.12)`,
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

                              <h3 className="mt-2 sm:mt-3 font-excon text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-ink break-words">
                                {step.primary}
                              </h3>
                              {step.secondary && (
                                <p className="mt-0.5 sm:mt-1 font-inter text-xs sm:text-sm md:text-base text-neutral-500 font-medium">
                                  {step.secondary}
                                </p>
                              )}
                            </div>

                            {step.metric && (
                              <div className="flex flex-col items-start sm:items-end shrink-0 self-start rounded-xl sm:rounded-2xl bg-neutral-50 border border-black/6 px-2.5 py-1.5 sm:px-4 sm:py-2 transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] cursor-default">
                                <div className="flex items-baseline font-excon font-bold text-lg sm:text-2xl md:text-3xl text-ink leading-none">
                                  <span>{step.metric}</span>
                                  {step.metricUnit && (
                                    <span className="text-xs sm:text-lg font-light ml-0.5 text-neutral-600">
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
                          <div className="my-2 sm:my-3.5 h-px w-full bg-black/6" />

                          {/* Narrative Story */}
                          <p className="font-inter text-neutral-600 text-xs sm:text-sm md:text-[0.94rem] leading-relaxed max-w-[66ch]">
                            {step.body}
                          </p>
                        </div>

                        {/* Bottom row: Acquired skills */}
                        <div className="mt-2 sm:mt-3.5 pt-2 sm:pt-3 border-t border-black/5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="text-[0.65rem] sm:text-[0.7rem] uppercase font-semibold tracking-wider text-neutral-400 mr-1">
                            Acquired:
                          </span>
                          {step.skills.map((skill) => (
                            <span
                              key={skill}
                              className="group/pill inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-black/8 bg-neutral-50/70 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[0.68rem] sm:text-xs font-medium text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-black/20 hover:bg-white hover:shadow-sm cursor-default"
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
                  <div className="mt-2 sm:mt-2.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 border-t border-black/[0.06] pt-2 sm:pt-2.5">
                    <span className="font-mono text-[0.68rem] sm:text-xs font-bold uppercase tracking-wider text-neutral-800 shrink-0">
                      The story continues.
                    </span>
                    <p className="font-inter text-[0.68rem] sm:text-xs text-neutral-500 leading-normal">
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
                  <div className="flex items-center justify-between border-b border-black/8 pb-2 sm:pb-2.5">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="h-2 w-2 rounded-full bg-neutral-900" />
                      <span className="font-excon font-bold text-xs sm:text-sm uppercase tracking-wider text-black">
                        Toolkit
                      </span>
                      <span className="text-black/30 hidden sm:inline">·</span>
                      <span className="font-inter text-[0.68rem] sm:text-xs text-neutral-500 hidden sm:inline">
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
                        className="group flex items-center gap-1 rounded-full border border-black/10 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[0.65rem] sm:text-xs font-mono font-medium text-neutral-600 transition-all hover:border-black/30 hover:text-black hover:bg-black/5 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-black"
                      >
                        <span className="transition-transform duration-300 group-hover:rotate-180">↺</span>
                        <span className="hidden sm:inline">Replay</span>
                      </button>
                    </div>
                  </div>

                  {/* Video-style Progress Bar */}
                  <div className="h-[2px] w-full bg-black/5 rounded-full overflow-hidden -mt-1 sm:-mt-2">
                    <div
                      data-toolkit-progress
                      className="h-full bg-black origin-left transition-opacity duration-300"
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
                          className="relative rounded-[16px] sm:rounded-[24px] p-3.5 sm:p-7 lg:p-8 transition-shadow duration-300 hover:shadow-[0_20px_48px_rgba(0,0,0,0.08)] bg-white shadow-[0_12px_36px_rgba(0,0,0,0.05)]"
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
                            className="font-inter font-semibold uppercase text-black/50 text-[0.68rem] sm:text-xs tracking-wider"
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
                                  className="group relative flex items-baseline gap-1.5 sm:gap-3 font-inter text-[#1a1a1a] text-xs sm:text-sm md:text-base transition-transform duration-200 ease-out hover:translate-x-1.5 cursor-default"
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
                                    className="hidden sm:block pointer-events-none absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-md border border-black/10 px-2 py-1 font-inter uppercase text-black/75 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 text-[0.65rem] tracking-wider bg-white/95 shadow-md"
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
                  <div className="flex items-center justify-between border-b border-black/8 pb-2 sm:pb-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-excon font-bold text-xs sm:text-sm uppercase tracking-wider text-black">
                        Selected Projects
                      </span>
                      <span className="text-black/30">·</span>
                      <span className="font-inter text-[0.68rem] sm:text-xs text-neutral-500">
                        Click card to inspect
                      </span>
                    </div>
                  </div>
                  <WorksExpandable
                    onModalChange={(isOpen: boolean) => {
                      if (isOpen) {
                        lenisRef.current?.stop();
                      } else {
                        lenisRef.current?.start();
                      }
                    }}
                  />
                </div>
              </section>

              {/* Beyond Work — Personal life, hobbies, and disciplines */}
              <section
                id="beyond"
                aria-label="Beyond Work"
                ref={beyondRight}
                className="absolute inset-0 flex items-center justify-center will-change-[transform,opacity]"
              >
                <h2 className="sr-only">Beyond Work</h2>
                <div className="w-full max-w-[840px] 2xl:max-w-[900px] flex flex-col justify-center">
                  {/* Editorial Intro */}
                  <div className="mb-2.5 sm:mb-3.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
                      <p className="font-mono text-[0.68rem] sm:text-xs uppercase tracking-wider font-semibold text-neutral-500">
                        A little more about the person behind the pixels.
                      </p>
                    </div>
                    <p className="font-inter text-xs sm:text-[0.84rem] text-neutral-600 leading-relaxed max-w-[70ch]">
                      I&apos;m curious by default and rarely stick to just one thing. Some days you&apos;ll find me behind a camera, on a cricket field, exploring a new place, or getting lost in a film. I enjoy learning, making things, and finding inspiration in places that have nothing to do with work.
                    </p>
                  </div>

                  {/* Navigation Tabs Header */}
                  <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-black/8 mb-3 sm:mb-4">
                    <div
                      role="tablist"
                      aria-label="Beyond Work Categories"
                      className="flex items-center gap-1 sm:gap-2 flex-wrap"
                    >
                      {BEYOND.map((item, i) => (
                        <button
                          key={item.title}
                          id={`beyond-tab-${i}`}
                          role="tab"
                          type="button"
                          aria-selected={i === activeBeyondIndex}
                          aria-controls={`beyond-card-${i}`}
                          tabIndex={i === activeBeyondIndex ? 0 : -1}
                          data-btab={i}
                          onClick={() => handleBeyondChapterClick(i)}
                          onKeyDown={(e) => handleBeyondTabKeyDown(e, i)}
                          onMouseEnter={() => soundFX.playHoverTick()}
                          className={`group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-black ${
                            i === activeBeyondIndex
                              ? "bg-black text-white shadow-sm"
                              : "bg-black/[0.04] text-black/60 hover:text-black hover:bg-black/[0.08]"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className="w-1.5 h-1.5 rounded-full transition-transform duration-300 ease-out group-hover:scale-150"
                            style={{ backgroundColor: `rgb(${item.accent.join(" ")})` }}
                          />
                          <span className="font-normal opacity-85">{item.title}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => handleBeyondChapterClick(Math.max(0, activeBeyondIndex - 1))}
                        disabled={activeBeyondIndex === 0}
                        aria-label="Previous category"
                        className="h-7 w-7 rounded-full border border-black/10 flex items-center justify-center text-xs font-mono text-neutral-600 hover:text-black hover:border-black/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-black"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBeyondChapterClick(Math.min(BEYOND.length - 1, activeBeyondIndex + 1))}
                        disabled={activeBeyondIndex === BEYOND.length - 1}
                        aria-label="Next category"
                        className="h-7 w-7 rounded-full border border-black/10 flex items-center justify-center text-xs font-mono text-neutral-600 hover:text-black hover:border-black/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-black"
                      >
                        →
                      </button>
                    </div>
                  </div>

                  {/* Stacked Minimalist Cards */}
                  <div className="relative h-[290px] sm:h-[260px] md:h-[240px] w-full">
                    {BEYOND.map((item, i) => {
                      const isCurrent = i === activeBeyondIndex;
                      return (
                        <div
                          key={item.title}
                          id={`beyond-card-${i}`}
                          role="tabpanel"
                          aria-labelledby={`beyond-tab-${i}`}
                          tabIndex={0}
                          data-bcard={i}
                          className="absolute inset-0 rounded-[20px] sm:rounded-[24px] bg-white p-5 sm:p-6 md:p-7 border shadow-[0_12px_36px_rgba(0,0,0,0.03)] flex flex-col justify-between overflow-y-auto sm:overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black will-change-[transform,opacity]"
                          style={{
                            borderColor: `rgb(${item.accent.join(" ")} / 0.35)`,
                          }}
                        >
                          <div className="flex flex-col">
                            {/* Minimal Category Header */}
                            <div className="flex items-center gap-2 pb-2.5 border-b border-black/[0.05]">
                              <span
                                aria-hidden="true"
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: `rgb(${item.accent.join(" ")})`,
                                  boxShadow: `0 0 8px rgb(${item.accent.join(" ")} / 0.6)`,
                                }}
                              />
                              <span className="font-mono text-[0.72rem] sm:text-xs uppercase tracking-wider font-bold text-neutral-800">
                                {item.title}
                              </span>
                            </div>

                            {/* Headline with Masked Kinetic Line Slide */}
                            <div className="mt-3 overflow-hidden py-1">
                              <h3
                                data-bhead
                                className="font-excon text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-ink leading-snug will-change-transform"
                              >
                                {item.headline}
                              </h3>
                            </div>

                            {/* Narrative Story */}
                            <p className="mt-2.5 font-inter text-neutral-600 text-xs sm:text-sm md:text-[0.92rem] leading-relaxed max-w-[66ch]">
                              {item.body}
                            </p>
                          </div>

                          {/* Minimal Interest / Focus Tags */}
                          {item.habits && item.habits.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-black/[0.05] flex flex-wrap items-center gap-1.5 sm:gap-2">
                              {item.habits.map((habit) => (
                                <span
                                  key={habit}
                                  data-bpill
                                  className="inline-flex items-center rounded-full bg-neutral-100/80 px-2.5 sm:px-3 py-0.5 text-[0.68rem] sm:text-xs font-medium text-neutral-700 hover:bg-neutral-200/80 transition-colors cursor-default will-change-transform"
                                >
                                  {habit}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Closing Sign-Off Note */}
                  <div className="mt-3 sm:mt-3.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 border-t border-black/[0.06] pt-2.5 sm:pt-3">
                    <span className="font-mono text-[0.68rem] sm:text-xs font-bold uppercase tracking-wider text-neutral-800 shrink-0">
                      Still figuring it out.
                    </span>
                    <p className="font-inter text-[0.68rem] sm:text-xs text-neutral-500 leading-normal">
                      There&apos;s always something new to learn, somewhere new to go, or something new to make. I like keeping room for all of it.
                    </p>
                  </div>
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
                <div className="w-full max-w-[680px] rounded-[28px] sm:rounded-[36px] border border-black/10 bg-white p-6 sm:p-10 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.06)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Available for opportunities
                      </span>
                    </div>

                    <h3 className="mt-4 sm:mt-5 font-excon text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink">
                      Let’s build something exceptional.
                    </h3>
                    <p className="mt-2 sm:mt-3 font-inter text-sm sm:text-base text-neutral-500 leading-relaxed max-w-[54ch]">
                      Have a product to build, an engineering opportunity, or just want to connect? Reach out directly or connect on social platforms.
                    </p>
                  </div>

                  <div className="mt-6 sm:mt-8 flex flex-col gap-3.5">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-black/8 bg-neutral-50/80 p-4 sm:p-5">
                      <div>
                        <span className="block text-[0.7rem] uppercase font-semibold tracking-wider text-neutral-400">
                          Direct Communication
                        </span>
                        <a
                          href="mailto:tharun@example.com"
                          className="font-inter text-base sm:text-lg font-bold text-neutral-900 hover:underline"
                        >
                          tharun@example.com
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          className={`flex-1 sm:flex-initial rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-black ${copiedEmail
                            ? "bg-emerald-600 text-white scale-105 shadow-md shadow-emerald-600/25"
                            : "bg-black text-white hover:bg-neutral-800 hover:shadow-sm"
                            }`}
                        >
                          {copiedEmail ? "Copied! ✓" : "Copy Email"}
                        </button>
                        <a
                          href="mailto:tharun@example.com"
                          className="rounded-full border border-black/15 bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-neutral-100 transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-black"
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
                        className="group flex items-center justify-center gap-2 rounded-2xl border border-black/8 bg-white py-3.5 text-xs sm:text-sm font-semibold text-neutral-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-black/25 hover:bg-neutral-50 hover:shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-black"
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
                        className="group flex items-center justify-center gap-2 rounded-2xl border border-black/8 bg-white py-3.5 text-xs sm:text-sm font-semibold text-neutral-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-black/25 hover:bg-neutral-50 hover:shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-black"
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
        <div className="flex items-center gap-0.5 p-1 rounded-full bg-white/90 backdrop-blur-xl border border-black/10 shadow-[0_12px_36px_rgba(0,0,0,0.12)]">
          {MENU.map((item) => {
            const isActive = currentCanonicalKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleMenuClick(item.key)}
                onMouseEnter={() => soundFX.playHoverTick()}
                aria-current={isActive ? "true" : undefined}
                aria-label={`Go to section ${item.label}`}
                className={`flex items-center justify-center transition-all duration-300 ease-out active:scale-95 cursor-pointer rounded-full font-mono ${
                  isActive
                    ? "bg-black text-white px-3 py-1.5 gap-1.5 shadow-sm"
                    : "text-black/50 hover:text-black hover:bg-black/5 px-2 py-1.5 text-xs font-medium"
                }`}
              >
                <span className={`text-[0.68rem] ${isActive ? "text-white/70 font-semibold" : "text-black/60 font-mono"}`}>
                  {item.numeral}
                </span>
                {isActive && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/40" />
                    <span className="font-excon font-bold text-xs tracking-tight whitespace-nowrap text-white">
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
          className="fixed inset-0 z-50 flex flex-col justify-between bg-bg p-6 sm:p-10 select-none animate-in fade-in duration-200"
        >
          {/* Atmosphere layers matching vault */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="vault-radial" />
            <div className="vault-grain" />
            <div className="vault-vignette" />
          </div>

          {/* Top Bar inside modal */}
          <div className="relative z-10 flex items-center justify-between pb-4 border-b border-black/8">
            <div className="flex items-center gap-2">
              <span className="font-excon font-bold text-xl sm:text-2xl text-ink">
                Vault.
              </span>
              <span className="font-mono text-xs text-neutral-400">/ Index</span>
            </div>
            <button
              type="button"
              onClick={() => {
                soundFX.playModalClose();
                setIsMobileNavOpen(false);
                lastActiveElementRef.current?.focus();
              }}
              onMouseEnter={() => soundFX.playHoverTick()}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-neutral-500 hover:text-black hover:border-black/30 hover:bg-black/5 transition-all active:scale-90 cursor-pointer focus-visible:ring-2 focus-visible:ring-black"
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
                    handleMenuClick(item.key);
                  }}
                  onMouseEnter={() => soundFX.playHoverTick()}
                  aria-current={isActive ? "true" : undefined}
                  className="group flex items-baseline gap-3.5 sm:gap-5 text-left transition-all duration-200 active:scale-[0.98] border-0 bg-transparent p-0 cursor-pointer"
                >
                  <span
                    className={`font-mono text-xs sm:text-sm tracking-widest transition-opacity duration-200 ${
                      isActive ? "text-ink font-bold opacity-100" : "text-ink/35 group-hover:text-ink/60"
                    }`}
                  >
                    {item.numeral}
                  </span>
                  <span
                    className={`font-excon font-bold leading-none tracking-tight transition-all duration-200 ${
                      isActive
                        ? "text-3xl sm:text-4xl text-ink"
                        : "text-xl sm:text-2xl text-ink/40 group-hover:text-ink/80 group-hover:translate-x-1.5"
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <span
                      className="w-2 h-2 rounded-full mb-1 animate-pulse"
                      style={{
                        backgroundColor: `rgb(${
                          item.key === "journey"
                            ? JOURNEY[activeChapterIndex]?.accent.join(" ")
                            : item.key === "beyond"
                            ? BEYOND[activeBeyondIndex]?.accent.join(" ")
                            : ROOMS[item.key as keyof typeof ROOMS]?.accent?.join(" ") || "10 10 10"
                        })`,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom quick contact footer inside modal */}
          <div className="relative z-10 flex items-center justify-between pt-4 border-t border-black/8 text-xs text-neutral-500 font-mono">
            <span>Tharun S · Portfolio</span>
            <button
              type="button"
              onClick={() => {
                soundFX.playMenuClick();
                setIsMobileNavOpen(false);
                handleMenuClick("talk");
              }}
              className="text-black font-semibold hover:underline cursor-pointer"
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
          <li><a href="https://github.com">GitHub</a></li>
          <li><a href="https://linkedin.com">LinkedIn</a></li>
        </ul>
      </footer>
    </main>
  );
}
