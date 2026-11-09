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
const SUBTITLE = "Scroll Down to explore";

const MENU: { key: string; label: string; numeral: string; lines?: string[] }[] = [
  { key: "about", label: "About", numeral: "01" },
  { key: "journey", label: "Journey", numeral: "02" },
  { key: "skills", label: "Skills", numeral: "03" },
  { key: "works", label: "Works", numeral: "04" },
  { key: "beyond", label: "Beyond Work", numeral: "05", lines: ["Beyond", "Work"] },
  { key: "talk", label: "Let’s Talk.", numeral: "06" },
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
    period: "2018 — 2020",
    accent: [201, 150, 92], // warm bronze — foundation, archive light
    lift: 0.07,
    metric: "89",
    metricUnit: "%",
    metricLabel: "Score",
    primary: "A.M.Jain School",
    secondary: "Higher Secondary · Science & Mathematics",
    skills: ["Curiosity", "Discipline", "Continuous Learning"],
    body:
      "Every story has a beginning. Mine started in a classroom, where curiosity slowly grew into a passion for learning, creating, and solving problems. Those early years became the foundation for everything that followed.",
  },
  {
    icon: "gradcap" as const,
    title: "Under-Graduate",
    period: "2020 — 2023",
    accent: [82, 186, 148], // emerald (named #064E3B) — growth, discovery
    lift: 0.065,
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
    period: "Jan 25 — Jul 25",
    accent: [212, 175, 95], // deep gold — leadership, executive light
    lift: 0.085,
    metric: "6+",
    metricUnit: "mos",
    metricLabel: "Experience",
    primary: "Bajaj Finserv",
    secondary: "Deputy Manager",
    skills: ["Communication", "Leadership", "Negotiation", "Client Management", "Business Strategy"],
    body:
      "Leading sales taught me that every conversation begins with understanding people. Managing relationships, solving customer problems, and taking ownership of results helped me build confidence, adaptability, and a stronger business mindset.",
  },
  {
    icon: "gradcap" as const,
    title: "Post Graduate",
    period: "2024 — Present",
    accent: [70, 155, 175], // slate cyan — engineering lab
    lift: 0.06,
    metric: "7.0",
    metricUnit: "",
    metricLabel: "CGPA",
    primary: "PSG College of Technology",
    secondary: "MCA · Master of Computer Applications",
    skills: ["Software Engineering", "System Design", "Full Stack Development", "Modern Development Practices"],
    body:
      "Returning to academia marked the beginning of a new chapter. With a stronger foundation and real-world experience behind me, I am now deepening my understanding of software engineering, system design, and modern application development.",
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
  { name: "Core Traits", skills: ["Curiosity", "Discipline", "Continuous Learning", "Leadership"] },
  { name: "Analytical", skills: ["Analytical Thinking", "Problem Solving", "Research", "Data Analysis"] },
  {
    name: "Working With People",
    skills: ["Communication", "Negotiation", "Client Management", "Business Strategy"],
  },
  {
    name: "Engineering",
    skills: [
      "Software Engineering",
      "System Design",
      "Full Stack Development",
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
  const heroVaultInline = useRef<HTMLSpanElement>(null);
  const scrollIndicator = useRef<HTMLButtonElement>(null);
  const ulPath = useRef<SVGPathElement>(null);
  const arrowStem = useRef<SVGLineElement>(null);
  const arrowHead = useRef<SVGPathElement>(null);

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

  const lockedSectionRef = useRef<"journey" | "beyond" | null>(null);
  const accumulatedDeltaRef = useRef(0);
  const isProgrammaticScrollRef = useRef(false);
  const rubberResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const switchJourneyChapterRef = useRef<((idx: number) => void) | null>(null);
  const switchBeyondChapterRef = useRef<((idx: number) => void) | null>(null);

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

  const handleHeroClick = () => {
    soundFX.unlockAudio();
    if (!hasInteracted) {
      setHasInteracted(true);
      setDecryptKey((k) => k + 1);
    }
  };

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
    soundFX.playMenuClick();
    lockedSectionRef.current = null;
    accumulatedDeltaRef.current = 0;
    isProgrammaticScrollRef.current = true;
    if (!lenisRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduced ? 0 : 0.85;
    switch (key) {
      case "about":
        lenisRef.current.scrollTo(window.innerHeight * 1.2, {
          duration: dur,
          onComplete: () => {
            setTimeout(() => { isProgrammaticScrollRef.current = false; }, 150);
          },
        });
        break;
      case "journey":
        lenisRef.current.scrollTo(window.innerHeight * 2.0, {
          duration: dur,
          onComplete: () => {
            setTimeout(() => {
              isProgrammaticScrollRef.current = false;
              lockedSectionRef.current = "journey";
            }, 150);
          },
        });
        break;
      case "skills":
      case "craft":
        lenisRef.current.scrollTo(window.innerHeight * 2.8, {
          duration: dur,
          onComplete: () => {
            setTimeout(() => { isProgrammaticScrollRef.current = false; }, 150);
          },
        });
        break;
      case "works":
        lenisRef.current.scrollTo(window.innerHeight * 4.6, {
          duration: dur,
          onComplete: () => {
            setTimeout(() => { isProgrammaticScrollRef.current = false; }, 150);
          },
        });
        break;
      case "beyond":
        lenisRef.current.scrollTo(window.innerHeight * 5.8, {
          duration: dur,
          onComplete: () => {
            setTimeout(() => {
              isProgrammaticScrollRef.current = false;
              lockedSectionRef.current = "beyond";
            }, 150);
          },
        });
        break;
      case "talk":
        lenisRef.current.scrollTo(window.innerHeight * 6.8, {
          duration: dur,
          onComplete: () => {
            setTimeout(() => { isProgrammaticScrollRef.current = false; }, 150);
          },
        });
        break;
    }
  };

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
    let cleanupEarlyGestures: (() => void) | null = null;

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
      gsap.set([ulPath.current, arrowStem.current, arrowHead.current], { opacity: 0 });

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
        });
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
      const switchJourneyChapter = (newIndex: number) => {
        const currentIndex = activeChapterRef.current;
        if (currentIndex === newIndex) return;
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
            { opacity: 1, y: 0, scale: 1, duration: 0.36, ease: "power2.out" }
          );
          jCards[newIndex].style.pointerEvents = "auto";
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

      const switchBeyondChapter = (newIndex: number) => {
        const currentIndex = activeBeyondRef.current;
        if (currentIndex === newIndex) return;
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
            { opacity: 1, y: 0, scale: 1, duration: 0.36, ease: "power2.out" }
          );
          bCards[newIndex].style.pointerEvents = "auto";
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

      const lockToSection = (section: "journey" | "beyond", anchorMultiplier: number) => {
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

      const releaseSection = (direction: "next" | "prev", locked: "journey" | "beyond") => {
        accumulatedDeltaRef.current = 0;
        lockedSectionRef.current = null;
        isProgrammaticScrollRef.current = true;

        const targetContainer = locked === "journey" ? journeyRight.current : beyondRight.current;
        if (targetContainer) {
          gsap.to(targetContainer, { y: 0, duration: 0.2 });
        }

        soundFX.playMenuClick();

        let targetScroll = 0;
        if (locked === "journey") {
          targetScroll = direction === "next" ? window.innerHeight * 2.8 : window.innerHeight * 1.2;
        } else {
          targetScroll = direction === "next" ? window.innerHeight * 6.8 : window.innerHeight * 4.6;
        }

        lenisRef.current?.scrollTo(targetScroll, {
          duration: 0.85,
          onComplete: () => {
            setTimeout(() => {
              isProgrammaticScrollRef.current = false;
            }, 180);
          },
        });
      };

      const onWheel = (e: WheelEvent) => {
        const locked = lockedSectionRef.current;
        if (!locked) return;

        e.preventDefault();
        accumulatedDeltaRef.current += e.deltaY;

        const targetContainer = locked === "journey" ? journeyRight.current : beyondRight.current;
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

        const targetContainer = locked === "journey" ? journeyRight.current : beyondRight.current;
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

      // Craft cards starting states
      gsap.set(q("[data-craft-card]"), { opacity: 0, y: 16 });
      gsap.set(q("[data-craft-trace]"), { strokeDashoffset: 100, strokeOpacity: 1 });
      gsap.set(q("[data-craft-head]"), { opacity: 0, y: 12 });
      gsap.set(q("[data-craft-check]"), { opacity: 0, scale: 0.4 });
      gsap.set(q("[data-craft-name]"), { opacity: 0, x: -10 });

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

      // ======== PHASE 1 — hero → About (scrubbed) ========
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

      // ======== PHASE 3b — Skills (Craft) Scroll-Triggered Scrubbing ========
      const craftTl = gsap.timeline({ defaults: { ease: "power1.inOut" } });
      craftCards.forEach((card, i) => {
        const trace = card.querySelector("[data-craft-trace]");
        const head = card.querySelector("[data-craft-head]");
        const checks = card.querySelectorAll("[data-craft-check]");
        const names = card.querySelectorAll("[data-craft-name]");
        const start = i * 0.4;
        craftTl
          .to(card, { opacity: 1, y: 0, duration: 0.4 }, start)
          .to(trace, { strokeDashoffset: 0, duration: 0.55 }, start)
          .to(head, { opacity: 1, y: 0, duration: 0.3 }, start + 0.15)
          .to(checks, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.06 }, start + 0.15)
          .to(names, { opacity: 1, x: 0, duration: 0.28, stagger: 0.05 }, start + 0.18)
          .to(trace, { strokeOpacity: 0.45, duration: 0.3 }, start + 0.35);
      });
      craftTl.to({}, { duration: 0.3 });

      let cabinetSoundPlayed = false;
      ScrollTrigger.create({
        trigger: root.current,
        start: () => "top+=" + window.innerHeight * 2.8 + " top",
        end: () => "top+=" + window.innerHeight * 3.8 + " top",
        scrub: 0.5,
        animation: craftTl,
        onEnter: () => {
          if (!cabinetSoundPlayed) {
            cabinetSoundPlayed = true;
            soundFX.playCabinetUnlock();
          }
        },
        onLeaveBack: () => {
          cabinetSoundPlayed = false;
          if (craftCount) craftCount.textContent = "0";
        },
        onUpdate: (self) => {
          const p = self.progress;
          if (craftCount) {
            if (p >= 0.85) craftCount.textContent = "16";
            else if (p >= 0.60) craftCount.textContent = "12";
            else if (p >= 0.35) craftCount.textContent = "8";
            else if (p >= 0.10) craftCount.textContent = "4";
            else craftCount.textContent = "0";
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
        start: () => "top+=" + window.innerHeight * 3.8 + " top",
        end: () => "top+=" + window.innerHeight * 4.4 + " top",
        scrub: true,
        animation: worksTransition,
        onEnter: () => setRoom(ROOMS.works.accent, ROOMS.works.lift, 0.8),
        onLeaveBack: () => setRoom(ROOMS.craft.accent, ROOMS.craft.lift, 0.8),
      });

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
        onEnter: () => setRoom(BEYOND[activeBeyondRef.current].accent, BEYOND[activeBeyondRef.current].lift, 0.8),
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
        if (ulPath.current) {
          const len = ulPath.current.getTotalLength();
          gsap.set(ulPath.current, { strokeDasharray: len, strokeDashoffset: 0 });
        }
        gsap.set([ulPath.current, arrowStem.current, arrowHead.current], { opacity: 1 });
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
        unlockScroll();
        ScrollTrigger.refresh();
        return;
      }

      // -------- Hero intro setup --------
      let introFinished = false;
      const finishIntro = () => {
        if (introFinished) return;
        introFinished = true;
        if (ulPath.current) {
          const len = ulPath.current.getTotalLength();
          gsap.set(ulPath.current, { strokeDasharray: len, strokeDashoffset: 0, opacity: 1 });
        }
        gsap.set([arrowStem.current, arrowHead.current], { opacity: 1 });
        measure();
        unlockScroll();
        ScrollTrigger.refresh();
      };
      finishIntroRef.current = finishIntro;
      finishIntro();

      const handleEarlyGesture = () => {
        finishIntro();
        window.removeEventListener("wheel", handleEarlyGesture);
        window.removeEventListener("touchstart", handleEarlyGesture);
      };
      window.addEventListener("wheel", handleEarlyGesture, { passive: true });
      window.addEventListener("touchstart", handleEarlyGesture, { passive: true });
      cleanupEarlyGestures = () => {
        window.removeEventListener("wheel", handleEarlyGesture);
        window.removeEventListener("touchstart", handleEarlyGesture);
      };

      const run = async () => {
        measure();
        if (isCancelled() || introFinished) return;

        // Slow cinematic decryption sequence:
        // 0.15s: "Welcome to my " decrypts character by character (~1.3s)
        // 1.45s: "Vault." decrypts with resonant mechanical ticks (~0.7s)
        // 2.20s: Subtitle "Scroll Down to explore" starts decrypting (~1.5s)
        // 3.30s: SVG underline stroke traces in over 0.65s
        // 3.90s: Bouncing arrow appears and scroll unlocks
        await new Promise((res) => setTimeout(res, 3300));
        if (isCancelled() || introFinished) return;

        if (ulPath.current) {
          const len = ulPath.current.getTotalLength();
          gsap.set(ulPath.current, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
          gsap.to(ulPath.current, { strokeDashoffset: 0, duration: 0.65, ease: "power2.inOut" });
        }

        await new Promise((res) => setTimeout(res, 450));
        if (isCancelled() || introFinished) return;

        gsap.to([arrowStem.current, arrowHead.current], { opacity: 1, duration: 0.3, ease: "power2.out" });

        gsap
          .timeline({ repeat: -1, repeatDelay: 1.2 })
          .to(arrowHead.current, { y: 6, duration: 0.5, ease: "sine.inOut" }, 0)
          .to(arrowStem.current, { attr: { y2: 68 }, duration: 0.5, ease: "sine.inOut" }, 0)
          .to(arrowHead.current, { y: 0, duration: 0.5, ease: "sine.inOut" }, 0.5)
          .to(arrowStem.current, { attr: { y2: 60 }, duration: 0.5, ease: "sine.inOut" }, 0.5);

        // Unlock scroll once intro decryption resolves
        await new Promise((res) => setTimeout(res, 400));
        finishIntro();
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
      cleanupEarlyGestures?.();
      unlockScroll();
      pointerListener?.();
      gsap.ticker.remove(tick);
      lenis.destroy();
      ctx.revert();
    };
  }, []);

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
          <button
            ref={mobileNavTriggerRef}
            type="button"
            onClick={() => {
              soundFX.playModalOpen();
              lastActiveElementRef.current = mobileNavTriggerRef.current;
              setIsMobileNavOpen(true);
            }}
            onMouseEnter={() => soundFX.playHoverTick()}
            aria-label="Open section navigation"
            aria-expanded={isMobileNavOpen}
            aria-controls="mobile-nav-drawer"
            className="lg:hidden text-xs font-semibold text-neutral-700 hover:text-black border border-black/12 rounded-full px-3 py-1.5 bg-white/85 backdrop-blur-sm active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-black/60" />
            <span>Sections</span>
          </button>
          <button
            ref={letsTalk}
            type="button"
            onClick={() => handleMenuClick("talk")}
            onMouseEnter={() => soundFX.playHoverTick()}
            aria-label="Scroll to contact section"
            className="group will-reveal flex items-center gap-1.5 sm:gap-2 font-excon font-bold leading-none text-ink rounded-full border-2 border-ink px-3.5 py-1.5 sm:px-5 sm:py-2.5 text-xs sm:text-sm transition-all duration-200 hover:bg-ink hover:text-bg hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] active:scale-95 active:translate-y-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            <span>Let&rsquo;s Talk.</span>
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
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 sm:px-6 text-center select-none"
        >
          <h1
            className="text-glow font-excon font-bold leading-[1.08] sm:leading-[1.02] text-ink flex flex-col sm:inline-flex sm:flex-row items-center justify-center text-center gap-0 sm:gap-2"
            style={{ fontSize: HEADING_SIZE }}
          >
            <span ref={heroPre} className="inline-block">
              {HERO_PRE}
            </span>
            <span ref={heroVaultInline} className="inline-block">
              {HERO_VAULT}
            </span>
          </h1>

          <button
            type="button"
            ref={scrollIndicator}
            onClick={() => {
              soundFX.playMenuClick();
              const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              lenisRef.current?.scrollTo(window.innerHeight * 1.15, { duration: reduced ? 0 : 1.0 });
            }}
            onMouseEnter={() => soundFX.playHoverTick()}
            aria-label="Scroll down to explore"
            className="group mt-[3vh] sm:mt-[4.5vh] flex w-full flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-[1.03] active:scale-95 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 rounded-xl p-2 border-0 bg-transparent"
            style={{ maxWidth: "min(90vw, 560px)" }}
          >
            <svg
              viewBox="0 0 640 26"
              className="w-full overflow-visible transition-opacity duration-300 group-hover:opacity-100"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: INK }}
              aria-hidden="true"
            >
              <path ref={ulPath} d="M4 12 H 604 Q 622 12 622 30" />
              <line ref={arrowStem} x1="622" y1="29" x2="622" y2="60" />
              <path ref={arrowHead} d="M611 49 L622 61 L633 49" />
            </svg>
            <p
              className="mt-[3vh] sm:mt-[4.5vh] text-center font-excon font-bold leading-none text-ink transition-transform duration-200 group-hover:-translate-y-0.5"
              style={{ fontSize: "clamp(0.95rem, 2.3vw, 1.55rem)" }}
            >
              {SUBTITLE}
            </p>
          </button>
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
                          {(item.key === "skills" || item.key === "craft") && (
                            <span
                              data-craft-count
                              aria-hidden="true"
                              className="inline-flex shrink-0 items-center justify-center rounded-full font-inter font-bold text-white bg-black shadow-sm transition-transform duration-300 ease-out group-hover:scale-125 group-hover:rotate-6"
                              style={{
                                width: "1.35rem",
                                height: "1.35rem",
                                fontSize: "0.72rem",
                                lineHeight: 1,
                              }}
                            >
                              16
                            </span>
                          )}
                        </span>
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className={`font-mono text-xs tracking-wider font-semibold opacity-60 ml-2 ${isMultiLine ? "mt-[0.25em]" : ""
                              } shrink-0`}
                          >
                            {item.numeral} / 06
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Right: swappable content */}
            <div className="relative h-full flex-1 w-full pb-14 lg:pb-0">
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
                <div className="w-full max-w-[820px] 2xl:max-w-[880px] flex flex-col gap-3 sm:gap-5">
                  {/* Chapter Navigation Tabs / Bar */}
                  <div className="flex items-center justify-between border-b border-black/8 pb-2.5 sm:pb-4">
                    <div
                      role="tablist"
                      aria-label="Journey chapter selector"
                      className="flex items-center gap-1 sm:gap-2"
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
                          aria-label={`Chapter 0${i + 1}: ${step.title}`}
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
                          <span>0{i + 1}</span>
                          <span className="hidden sm:inline font-normal opacity-75">{step.title}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => handleChapterClick(Math.max(0, activeChapterIndex - 1))}
                        disabled={activeChapterIndex === 0}
                        aria-label="Previous chapter"
                        className="h-7 w-7 rounded-full border border-black/10 flex items-center justify-center text-xs font-mono text-neutral-600 hover:text-black hover:border-black/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-black"
                      >
                        ←
                      </button>
                      <div className="flex items-center gap-1 text-xs font-mono font-medium text-neutral-400" aria-live="polite">
                        <span data-jcount className="font-bold text-neutral-800">
                          0{activeChapterIndex + 1}
                        </span>
                        <span>/</span>
                        <span>04</span>
                      </div>
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
                  <div className="relative h-[430px] sm:h-[400px] md:h-[370px] w-full">
                    {JOURNEY.map((step, i) => (
                      <div
                        key={step.title}
                        id={`journey-card-${i}`}
                        role="tabpanel"
                        aria-labelledby={`journey-tab-${i}`}
                        tabIndex={0}
                        data-jcard={i}
                        className="absolute inset-0 rounded-[20px] sm:rounded-[24px] bg-white p-4 sm:p-7 md:p-8 border shadow-[0_12px_36px_rgba(0,0,0,0.04)] flex flex-col justify-between overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black will-change-[transform,opacity]"
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
                                  Chapter 0{i + 1} · {step.title}
                                </span>
                                {step.period && (
                                  <span className="text-[0.65rem] sm:text-xs font-inter text-neutral-400 font-medium">
                                    {step.period}
                                  </span>
                                )}
                              </div>

                              <h3 className="mt-2 sm:mt-3.5 font-excon text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-ink break-words">
                                {step.primary}
                              </h3>
                              {step.secondary && (
                                <p className="mt-0.5 sm:mt-1 font-inter text-xs sm:text-sm md:text-base text-neutral-500 font-medium">
                                  {step.secondary}
                                </p>
                              )}
                            </div>

                            {step.metric && (
                              <div className="flex flex-col items-start sm:items-end shrink-0 self-start rounded-xl sm:rounded-2xl bg-neutral-50 border border-black/6 px-2.5 py-1.5 sm:px-4 sm:py-2.5 transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] cursor-default">
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
                          <div className="my-2.5 sm:my-5 h-px w-full bg-black/6" />

                          {/* Narrative Story */}
                          <p className="font-inter text-neutral-600 text-xs sm:text-sm md:text-[0.98rem] leading-relaxed max-w-[64ch] line-clamp-3 sm:line-clamp-none">
                            {step.body}
                          </p>
                        </div>

                        {/* Bottom row: Acquired skills */}
                        <div className="mt-2.5 sm:mt-5 pt-2 sm:pt-3.5 border-t border-black/5 flex flex-wrap items-center gap-1.5 sm:gap-2">
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
                </div>
              </section>

              {/* Skills — the cabinet of accumulated achievements */}
              <section
                id="skills"
                aria-label="Skills & Capabilities"
                ref={craftRight}
                className="absolute inset-0 flex items-center justify-center will-change-[transform,opacity]"
              >
                <h2 className="sr-only">Skills &amp; Capabilities</h2>
                <div className="grid w-full max-w-[940px] 2xl:max-w-[1020px] grid-cols-2 gap-2.5 sm:gap-6 lg:gap-8">
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
                            opacity: 0,
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
              </section>

              {/* Works — Expandable Project Showcase */}
              <section
                id="works"
                aria-label="Selected Works"
                ref={worksRight}
                className="absolute inset-0 flex items-center justify-center will-change-[transform,opacity]"
              >
                <h2 className="sr-only">Selected Works</h2>
                <div className="w-full max-w-[880px] 2xl:max-w-[960px] flex flex-col gap-2 sm:gap-4">
                  <div className="flex items-center justify-between border-b border-black/8 pb-2 sm:pb-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-excon font-bold text-xs sm:text-sm uppercase tracking-wider text-black">
                        Selected Works
                      </span>
                      <span className="text-black/30">·</span>
                      <span className="font-inter text-[0.68rem] sm:text-xs text-neutral-500">
                        Click card to inspect
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-neutral-400">04 Projects</span>
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
                          <span>0{i + 1}</span>
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
                      <div className="flex items-center gap-1 text-xs font-mono font-medium text-neutral-400" aria-live="polite">
                        <span data-bcount className="font-bold text-neutral-800">
                          0{activeBeyondIndex + 1}
                        </span>
                        <span>/</span>
                        <span>04</span>
                      </div>
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
                                0{i + 1} // {item.title}
                              </span>
                            </div>

                            {/* Headline */}
                            <div className="mt-3">
                              <h3 className="font-excon text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-ink leading-snug">
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
                                  className="inline-flex items-center rounded-full bg-neutral-100/80 px-2.5 sm:px-3 py-0.5 text-[0.68rem] sm:text-xs font-medium text-neutral-700 hover:bg-neutral-200/80 transition-colors cursor-default"
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

              {/* Let's Talk — In-scroll contact destination */}
              <section
                id="talk"
                aria-label="Let’s Talk"
                ref={talkRight}
                className="absolute inset-0 flex items-center justify-center will-change-[transform,opacity]"
              >
                <h2 className="sr-only">Let’s Talk</h2>
                <div className="w-full max-w-[680px] rounded-[28px] sm:rounded-[36px] border border-black/10 bg-white p-6 sm:p-10 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.06)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Available for opportunities
                      </span>
                      <span className="font-mono text-xs font-semibold text-neutral-400">06 / 06</span>
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

      {/* --------------------------------- MOBILE FLOATING SECTION NAV PILL */}
      <nav
        aria-label="Quick section navigation"
        className={`lg:hidden fixed bottom-4 inset-x-0 mx-auto w-fit z-40 transition-all duration-300 ${activeSection === "hero"
          ? "opacity-0 pointer-events-none translate-y-4"
          : "opacity-100 pointer-events-auto translate-y-0"
          }`}
      >
        <div className="flex items-center gap-1 p-1.5 rounded-full bg-white/95 backdrop-blur-md border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-x-auto max-w-[94vw] no-scrollbar">
          {MENU.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleMenuClick(item.key)}
                aria-current={isActive ? "true" : undefined}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-black ${isActive
                  ? "bg-black text-white shadow-sm"
                  : "text-black/60 hover:text-black hover:bg-black/[0.04]"
                  }`}
              >
                <span>{item.label}</span>
                {(item.key === "skills" || item.key === "craft") && (
                  <span
                    aria-hidden="true"
                    className={`inline-flex shrink-0 items-center justify-center rounded-full font-mono text-[0.62rem] px-1 h-3.5 ${isActive ? "bg-white text-black font-bold" : "bg-black/10 text-black"
                      }`}
                  >
                    16
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ------------------------------------------- MOBILE NAV DRAWER */}
      {isMobileNavOpen && (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Section navigation"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            className="fixed inset-0 bg-white/80 backdrop-blur-md transition-opacity"
            onClick={() => {
              soundFX.playModalClose();
              setIsMobileNavOpen(false);
              lastActiveElementRef.current?.focus();
            }}
          />
          <div className="relative w-full sm:max-w-[420px] rounded-t-[28px] sm:rounded-[28px] border border-black/10 bg-white p-6 shadow-2xl transition-all z-10 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-black/8">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                <h3 className="font-excon font-bold text-lg text-ink">
                  Sections
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFX.playModalClose();
                  setIsMobileNavOpen(false);
                  lastActiveElementRef.current?.focus();
                }}
                className="group flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-black transition-all hover:scale-105 active:scale-90 cursor-pointer focus-visible:ring-2 focus-visible:ring-black"
                aria-label="Close navigation"
              >
                <span className="transition-transform duration-200 group-hover:rotate-90">✕</span>
              </button>
            </div>

            <nav aria-label="Mobile sections list" className="mt-4 flex flex-col gap-1.5">
              {MENU.map((item) => {
                const isActive = activeSection === item.key;
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
                    className={`group flex items-center justify-between w-full px-4 py-3 rounded-2xl text-left transition-all duration-200 active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-black ${isActive
                      ? "bg-black text-white shadow-sm"
                      : "bg-neutral-50/80 text-neutral-800 hover:bg-black/5"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-xs tracking-wider ${isActive ? "text-white/70" : "text-neutral-400"
                          }`}
                      >
                        {item.numeral}
                      </span>
                      <span className="font-excon font-bold text-base">
                        {item.label}
                      </span>
                      {(item.key === "skills" || item.key === "craft") && (
                        <span
                          className={`inline-flex shrink-0 items-center justify-center rounded-full font-mono text-[0.65rem] px-1.5 h-4 font-bold ${isActive ? "bg-white text-black" : "bg-black text-white"
                            }`}
                        >
                          16
                        </span>
                      )}
                      {item.key === "works" && (
                        <span
                          className={`inline-flex shrink-0 items-center justify-center rounded-full font-mono text-[0.65rem] px-1.5 h-4 font-bold ${isActive ? "bg-white text-black" : "bg-black/10 text-neutral-700"
                            }`}
                        >
                          04
                        </span>
                      )}
                    </div>
                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    ) : (
                      <span className="font-mono text-xs opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                        ↗
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
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
