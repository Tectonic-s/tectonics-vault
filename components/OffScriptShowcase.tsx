"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { soundFX } from "@/lib/audio";

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export type OffScriptChapter = {
  id: string;
  slug: string;
  numeral: string;
  title: string;
  category: string;
  headline: string;
  tagline: string;
  accent: readonly [number, number, number];
  body: string;
  mindset: string;
  mindsetSub: string;
  habits: string[];
  takeaway: string;
};

export const OFF_SCRIPT_CHAPTERS: OffScriptChapter[] = [
  {
    id: "move",
    slug: "move",
    numeral: "01",
    title: "Move",
    category: "PHYSICAL DISCIPLINES & SPORT",
    headline: "Find Your Pace",
    tagline: "Cricket, strength training, and the art of showing up.",
    accent: [235, 115, 60], // fiery terra / warm ember
    body:
      "Cricket, fitness, and the occasional attempt at picking up a new sport. I enjoy staying active and the process of getting a little better each time. It's less about chasing perfection and more about showing up.",
    mindset: "Consistency Over Perfection",
    mindsetSub: "The discipline of showing up, tracking progress, and finding momentum in repetition.",
    habits: ["Cricket", "Strength Training", "Fitness", "Boxing", "Athletics"],
    takeaway: "Physical exertion clears mental clutter. The lessons on the pitch carry straight into engineering: patience, reading the field, and recovering from mistakes.",
  },
  {
    id: "think",
    slug: "think",
    numeral: "02",
    title: "Think",
    category: "SYSTEMS, PSYCHOLOGY & COGNITION",
    headline: "Curiosity Has No Off Switch",
    tagline: "Connecting dots across human behaviour, decision theory, and mental models.",
    accent: [65, 120, 220], // sapphire / architectural blue
    body:
      "I'm fascinated by how things work — from human behaviour and psychology to decision-making and complex systems. I enjoy connecting ideas, questioning assumptions, and looking at everyday things from a different perspective.",
    mindset: "First-Principles Inquiry",
    mindsetSub: "Questioning default assumptions, identifying feedback loops, and understanding human motives.",
    habits: ["Psychology", "Human Behaviour", "Systems Thinking", "Decision Theory", "Mental Models"],
    takeaway: "The best systems are designed for human reality, not idealized logic. Understanding how people actually decide shapes how I architect software.",
  },
  {
    id: "create",
    slug: "create",
    numeral: "03",
    title: "Create",
    category: "PHOTOGRAPHY, CINEMA & EXPERIMENTS",
    headline: "Making Things Just Because",
    tagline: "Visual storytelling, playing with light, and noticing the subtle details.",
    accent: [160, 95, 225], // deep electric violet
    body:
      "Photography is one of my favourite ways to slow down and notice the details. I enjoy playing with light, composition, and visual storytelling. Add a little music, cinema, and an ever-growing list of creative experiments, and there's always something to explore.",
    mindset: "Deliberate Observation",
    mindsetSub: "Slowing down the aperture, studying light and negative space, and crafting mood through visual nuance.",
    habits: ["Photography", "Sony a6400", "Guitar", "Cinema", "Visual Storytelling", "Color Grading"],
    takeaway: "Code builds the machine, but taste and composition build the experience. Photography trains the eye for spacing, contrast, and balance.",
  },
  {
    id: "explore",
    slug: "explore",
    numeral: "04",
    title: "Explore",
    category: "EXPEDITIONS, ROADS & STORIES",
    headline: "Life Happens Outside the Screen",
    tagline: "Motorcycles, coastal dawns, and wandering without maps.",
    accent: [50, 165, 120], // evergreen / grounding sage
    body:
      "Long rides, spontaneous plans, new places, and mornings by the beach. I'm drawn to experiences that break the routine. And when I'm indoors, there's usually a good film, anime, or game waiting.",
    mindset: "Uncharted Horizons",
    mindsetSub: "Stepping away from screens to reset perspective through physical distance and open road.",
    habits: ["Motorcycles", "Road Trips", "Travel", "Anime", "Gaming", "Cinema"],
    takeaway: "Distance gives clarity. The best problem-solving often happens miles away from the keyboard, riding into the sunrise or absorbed in a great story.",
  },
];

/* -------------------------------------------------------------------------- */
/* GENERATIVE BLUEPRINT SCHEMATIC FOR OFF SCRIPT                              */
/* -------------------------------------------------------------------------- */
function OffScriptBlueprint({ chapter }: { chapter: OffScriptChapter }) {
  const accentRgb = chapter.accent.join(" ");

  return (
    <div className="relative w-full h-full min-h-[220px] sm:min-h-[260px] flex flex-col justify-between p-4 sm:p-5 overflow-hidden bg-[#0d0f12] text-white/90 select-none font-mono">
      {/* Background Coordinate Grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Dynamic Ambient Spotlight */}
      <div
        className="absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `rgb(${accentRgb} / 0.15)` }}
      />

      {/* Top Coordinate Header */}
      <div className="relative z-10 flex items-center justify-between text-[0.62rem] sm:text-[0.68rem] tracking-widest uppercase text-white/45 border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: `rgb(${accentRgb})` }}
          />
          <span>OFF_SCRIPT // {chapter.numeral} · {chapter.title.toUpperCase()}</span>
        </div>
        <span>ARCHIVE // PERSONAL</span>
      </div>

      {/* Center Thematic Vector Schematic */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center py-4">
        {chapter.id === "move" && (
          <svg className="w-24 h-16 sm:w-32 sm:h-20 stroke-orange-400 fill-none" viewBox="0 0 120 60">
            <path
              d="M10 35 L 35 35 L 45 10 L 55 50 L 65 25 L 75 40 L 85 35 L 110 35"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="45" cy="10" r="3" fill="#fb923c" />
            <circle cx="55" cy="50" r="3" fill="#fb923c" />
          </svg>
        )}
        {chapter.id === "think" && (
          <svg className="w-20 h-20 sm:w-24 sm:h-24 stroke-sky-400 fill-none" viewBox="0 0 80 80">
            <circle cx="40" cy="20" r="8" strokeWidth="2" />
            <circle cx="20" cy="55" r="7" strokeWidth="2" />
            <circle cx="60" cy="55" r="7" strokeWidth="2" />
            <line x1="40" y1="28" x2="20" y2="48" strokeWidth="1.5" strokeDasharray="3 2" />
            <line x1="40" y1="28" x2="60" y2="48" strokeWidth="1.5" strokeDasharray="3 2" />
            <line x1="27" y1="55" x2="53" y2="55" strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="40" cy="42" r="3" fill="#38bdf8" />
          </svg>
        )}
        {chapter.id === "create" && (
          <svg className="w-20 h-20 sm:w-24 sm:h-24 stroke-purple-400 fill-none" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="30" strokeWidth="2" strokeDasharray="4 2" />
            <circle cx="40" cy="40" r="18" strokeWidth="2.5" />
            <circle cx="40" cy="40" r="6" fill="#c084fc" />
            <line x1="40" y1="10" x2="40" y2="22" strokeWidth="2" />
            <line x1="40" y1="58" x2="40" y2="70" strokeWidth="2" />
            <line x1="10" y1="40" x2="22" y2="40" strokeWidth="2" />
            <line x1="58" y1="40" x2="70" y2="40" strokeWidth="2" />
          </svg>
        )}
        {chapter.id === "explore" && (
          <svg className="w-24 h-18 sm:w-28 sm:h-20 stroke-emerald-400 fill-none" viewBox="0 0 100 60">
            <path
              d="M5 45 Q 25 25 50 40 T 95 20"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M5 55 Q 35 35 65 50 T 95 35"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              strokeOpacity="0.5"
            />
            <circle cx="50" cy="40" r="3.5" fill="#34d399" />
            <circle cx="95" cy="20" r="3.5" fill="#34d399" />
          </svg>
        )}
        <div className="mt-2 text-center">
          <span className="font-excon font-bold text-base sm:text-lg text-white tracking-wide">
            {chapter.headline}
          </span>
          <p className="text-[0.65rem] text-white/50 tracking-wider">
            UPLOAD // public/{chapter.slug}.png
          </p>
        </div>
      </div>

      {/* Bottom Technical Status */}
      <div className="relative z-10 flex items-center justify-between text-[0.6rem] text-white/40 border-t border-white/10 pt-2">
        <span>MINDSET // {chapter.mindset}</span>
        <span style={{ color: `rgb(${accentRgb})` }}>ACTIVE_PURSUIT</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DYNAMIC PHOTO CANVAS WITH AUTO RESOLUTION & BLUEPRINT FALLBACK             */
/* -------------------------------------------------------------------------- */
function OffScriptImageCanvas({ chapter }: { chapter: OffScriptChapter }) {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  // Candidate paths where user can drop move.png, think.png, etc.
  const candidatePaths = [
    `/${chapter.slug}.png`,
    `/beyond/${chapter.slug}.png`,
    `/projects/${chapter.slug}.png`,
    `/${chapter.id}.png`,
    `/beyond/${chapter.id}.png`,
  ];

  const handleImageError = () => {
    if (currentSrcIndex < candidatePaths.length - 1) {
      setCurrentSrcIndex((i) => i + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[220px] sm:min-h-[280px] lg:min-h-[320px] rounded-[18px] sm:rounded-[22px] overflow-hidden bg-neutral-950 border border-black/10 shadow-[0_16px_40px_rgba(0,0,0,0.12)] flex items-center justify-center group">
      {/* Studio Window Bar */}
      <div className="absolute top-0 inset-x-0 h-7 bg-black/60 backdrop-blur-md z-20 flex items-center justify-between px-3.5 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500/80" />
          <span className="h-2 w-2 rounded-full bg-amber-500/80" />
          <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
        </div>
        <span className="font-mono text-[0.62rem] text-white/50 tracking-wider">
          {chapter.slug}.png
        </span>
        <span className="font-mono text-[0.6rem] text-white/35">
          {chapter.numeral}/04
        </span>
      </div>

      {!hasFailedAll ? (
        <div className="w-full h-full pt-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={candidatePaths[currentSrcIndex]}
            alt={chapter.headline}
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="w-full h-full pt-7">
          <OffScriptBlueprint chapter={chapter} />
        </div>
      )}

      {/* Glass Sheen */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08]" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN OFF SCRIPT SHOWCASE COMPONENT                                         */
/* -------------------------------------------------------------------------- */
export function OffScriptShowcase({
  activeIndex,
  onSelectIndex,
  onModalChange,
}: {
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  onModalChange?: (isOpen: boolean) => void;
}) {
  const [activeModalChapter, setActiveModalChapter] = useState<OffScriptChapter | null>(null);
  const mounted = useIsMounted();
  const modalRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const selectedChapter = OFF_SCRIPT_CHAPTERS[activeIndex] ?? OFF_SCRIPT_CHAPTERS[0];

  const handlePrev = () => {
    const nextIdx = activeIndex === 0 ? OFF_SCRIPT_CHAPTERS.length - 1 : activeIndex - 1;
    onSelectIndex(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = activeIndex === OFF_SCRIPT_CHAPTERS.length - 1 ? 0 : activeIndex + 1;
    onSelectIndex(nextIdx);
  };

  const openModal = (chapter: OffScriptChapter, trigger?: HTMLElement | null) => {
    soundFX.playModalOpen();
    if (trigger) lastTriggerRef.current = trigger;
    setActiveModalChapter(chapter);
  };

  const closeModal = () => {
    soundFX.playModalClose();
    setActiveModalChapter(null);
    lastTriggerRef.current?.focus();
  };

  useEffect(() => {
    const onModalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && activeModalChapter) {
        closeModal();
      }
    };

    if (activeModalChapter) {
      document.body.style.overflow = "hidden";
      onModalChange?.(true);
    } else {
      document.body.style.overflow = "auto";
      onModalChange?.(false);
    }

    window.addEventListener("keydown", onModalKeyDown);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", onModalKeyDown);
    };
  }, [activeModalChapter, onModalChange]);

  useOutsideClick(modalRef, () => {
    if (activeModalChapter) {
      closeModal();
    }
  });

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-4 select-none">
      {/* ------------------------------------------------------------------ */}
      {/* TOP INTERACTIVE INDEX RAIL                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-1.5 scrollbar-none">
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/10 w-full sm:w-auto">
          {OFF_SCRIPT_CHAPTERS.map((item, idx) => {
            const isCurrent = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundFX.playTabSwitch();
                  onSelectIndex(idx);
                }}
                onMouseEnter={() => soundFX.playHoverTick()}
                aria-label={`Select chapter ${item.numeral} ${item.title}`}
                className={`group relative px-3 sm:px-4 py-1.5 rounded-full font-excon text-xs sm:text-sm font-bold tracking-tight transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isCurrent ? "text-black" : "text-neutral-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {isCurrent && (
                  <motion.div
                    layoutId="activeBeyondRailPill"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-white rounded-full shadow-sm"
                  />
                )}
                <span className="relative z-10 font-mono text-[0.65rem] sm:text-[0.72rem] opacity-75">
                  {item.numeral}
                </span>
                <span className="relative z-10">{item.title}</span>
                <span
                  className="relative z-10 h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-125"
                  style={{ backgroundColor: `rgb(${item.accent.join(" ")})` }}
                />
              </button>
            );
          })}
        </div>

        {/* Stepper Buttons */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            onMouseEnter={() => soundFX.playHoverTick()}
            aria-label="Previous chapter"
            className="px-2.5 py-1 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white font-mono text-xs transition-all active:scale-95 cursor-pointer"
          >
            Prev
          </button>
          <span className="font-mono text-xs text-neutral-400 px-1">
            {selectedChapter.numeral} / 04
          </span>
          <button
            type="button"
            onClick={handleNext}
            onMouseEnter={() => soundFX.playHoverTick()}
            aria-label="Next chapter"
            className="px-2.5 py-1 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white font-mono text-xs transition-all active:scale-95 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN CINEMATIC STAGE: SPLIT NARRATIVE & VISUAL PHOTO CANVAS        */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedChapter.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative w-full rounded-[24px] sm:rounded-[28px] overflow-hidden border border-white/[0.08] hover:border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl p-5 sm:p-7 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 lg:gap-8 items-center transition-all duration-300"
          style={{
            background: `radial-gradient(ellipse 90% 60% at 0% 0%, rgb(${selectedChapter.accent.join(" ")} / 0.12) 0%, transparent 70%), rgba(18, 18, 22, 0.75)`,
          }}
        >
          {/* Left Column (7 cols): Editorial Story & Disciplines */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3.5 sm:space-y-4">
            <div>
              {/* Category Breadcrumb & Chapter Tag */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0 shadow-sm"
                    style={{
                      backgroundColor: `rgb(${selectedChapter.accent.join(" ")})`,
                      boxShadow: `0 0 8px rgb(${selectedChapter.accent.join(" ")} / 0.75)`,
                    }}
                  />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    {`${selectedChapter.numeral} // ${selectedChapter.category}`}
                  </span>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-medium px-2.5 py-0.5 rounded-full border border-white/10 bg-white/[0.04] text-neutral-300"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: `rgb(${selectedChapter.accent.join(" ")})` }}
                  />
                  Chapter {selectedChapter.numeral}
                </span>
              </div>

              {/* Title & Tagline */}
              <h3 className="font-excon text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-white leading-[1.08]">
                {selectedChapter.headline}
              </h3>
              <p className="mt-1 font-inter text-base sm:text-lg font-medium text-neutral-200 leading-snug">
                {selectedChapter.tagline}
              </p>
            </div>

            {/* Mindset Callout Card */}
            <div
              className="rounded-2xl border p-3.5 sm:p-4 transition-colors"
              style={{
                backgroundColor: `rgb(${selectedChapter.accent.join(" ")} / 0.08)`,
                borderColor: `rgb(${selectedChapter.accent.join(" ")} / 0.25)`,
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-xs uppercase font-bold tracking-widest text-neutral-400">
                  Core Mindset
                </span>
                <span
                  className="font-excon font-bold text-base sm:text-lg"
                  style={{ color: `rgb(${selectedChapter.accent.join(" ")})` }}
                >
                  {selectedChapter.mindset}
                </span>
              </div>
              <p className="font-inter text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {selectedChapter.mindsetSub}
              </p>
            </div>

            {/* Narrative Story Excerpt */}
            <p className="font-inter text-sm sm:text-base text-neutral-300 leading-relaxed line-clamp-3">
              {selectedChapter.body}
            </p>

            {/* Habits & Focus Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedChapter.habits.map((habit) => (
                <span
                  key={habit}
                  className="rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1 font-inter text-xs font-medium text-neutral-200 transition-colors"
                >
                  {habit}
                </span>
              ))}
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={(e) => openModal(selectedChapter, e.currentTarget)}
                onMouseEnter={() => soundFX.playHoverTick()}
                className="rounded-full bg-white hover:bg-neutral-200 text-black px-5 py-2.5 font-inter text-xs sm:text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>Read Story & Reflections</span>
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): Dynamic Photo / Blueprint Frame */}
          <div
            onClick={(e) => openModal(selectedChapter, e.currentTarget)}
            className="lg:col-span-5 w-full cursor-pointer transition-transform duration-300 hover:scale-[1.015]"
            title={`Click to read ${selectedChapter.headline}`}
          >
            <OffScriptImageCanvas key={selectedChapter.slug} chapter={selectedChapter} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ------------------------------------------------------------------ */}
      {/* EXPANDED STORY & REFLECTIONS DOSSIER MODAL                         */}
      {/* ------------------------------------------------------------------ */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {activeModalChapter && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
                {/* Frosted Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-md"
                  onClick={closeModal}
                />

                {/* Modal Container */}
                <motion.div
                  ref={modalRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="offscript-modal-title"
                  initial={{ opacity: 0, scale: 0.96, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 8 }}
                  transition={{
                    duration: 0.22,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative w-full max-w-[640px] max-h-[88vh] flex flex-col bg-neutral-950 rounded-[24px] sm:rounded-[28px] border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.6)] text-white overflow-hidden z-10"
                >
                  {/* Close Button with ESC hint */}
                  <button
                    className="group absolute top-3.5 sm:top-4 right-3.5 sm:right-4 z-30 flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white hover:text-black transition-all hover:scale-105 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
                    onClick={closeModal}
                    onMouseEnter={() => soundFX.playHoverTick()}
                    aria-label="Close dialog"
                  >
                    <span className="text-[0.68rem] font-mono uppercase tracking-wider opacity-60 group-hover:opacity-100">
                      esc
                    </span>
                    <span className="transition-transform duration-200 group-hover:rotate-90">
                      <CloseIcon />
                    </span>
                  </button>

                  {/* Header Showcase Visual */}
                  <div className="relative h-44 sm:h-56 w-full shrink-0 overflow-hidden bg-neutral-950">
                    <OffScriptImageCanvas key={activeModalChapter.slug} chapter={activeModalChapter} />
                  </div>

                  {/* Modal Body */}
                  <div className="flex flex-col flex-1 overflow-y-auto p-5 sm:p-7 md:p-8 space-y-5">
                    {/* Header */}
                    <div className="pb-4 border-b border-white/10">
                      <span className="font-mono text-[0.68rem] sm:text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        {`${activeModalChapter.numeral} // ${activeModalChapter.category}`}
                      </span>
                      <h3
                        id="offscript-modal-title"
                        className="mt-1 font-excon text-2xl sm:text-3xl font-bold tracking-tight text-white"
                      >
                        {activeModalChapter.headline}
                      </h3>
                      <p className="mt-1 font-inter text-xs sm:text-sm font-medium text-neutral-300">
                        {activeModalChapter.tagline}
                      </p>
                    </div>

                    {/* Mindset Card */}
                    <div
                      className="rounded-2xl border p-4 sm:p-4.5"
                      style={{
                        backgroundColor: `rgb(${activeModalChapter.accent.join(" ")} / 0.08)`,
                        borderColor: `rgb(${activeModalChapter.accent.join(" ")} / 0.25)`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-400">
                          Mindset & Approach
                        </span>
                        <span
                          className="font-excon font-bold text-sm sm:text-base"
                          style={{ color: `rgb(${activeModalChapter.accent.join(" ")})` }}
                        >
                          {activeModalChapter.mindset}
                        </span>
                      </div>
                      <p className="font-inter text-xs sm:text-sm text-neutral-300 leading-relaxed">
                        {activeModalChapter.mindsetSub}
                      </p>
                    </div>

                    {/* Full Narrative Essay */}
                    <div className="space-y-1.5">
                      <span className="block font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-400">
                        The Story
                      </span>
                      <p className="font-inter text-xs sm:text-sm text-neutral-300 leading-relaxed">
                        {activeModalChapter.body}
                      </p>
                    </div>

                    {/* Philosophical Takeaway Callout */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-4.5 space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-white" />
                        <span className="font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-400">
                          Engineering Parallel
                        </span>
                      </div>
                      <p className="font-inter text-xs sm:text-sm text-neutral-300 leading-relaxed italic">
                        &ldquo;{activeModalChapter.takeaway}&rdquo;
                      </p>
                    </div>

                    {/* Disciplines & Focus Pills */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <span className="block font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-400">
                        Core Disciplines & Pursuits
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeModalChapter.habits.map((habit) => (
                          <span
                            key={habit}
                            className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 font-inter text-[0.7rem] font-medium text-neutral-200"
                          >
                            {habit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

export default OffScriptShowcase;

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </svg>
);

