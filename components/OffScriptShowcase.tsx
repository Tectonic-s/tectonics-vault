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
/* MINIMAL ARTWORK FALLBACK CANVAS FOR OFF SCRIPT                             */
/* -------------------------------------------------------------------------- */
function OffScriptBlueprint({ chapter }: { chapter: OffScriptChapter }) {
  const accentRgb = chapter.accent.join(" ");

  return (
    <div className="relative w-full h-full min-h-[220px] sm:min-h-[280px] flex flex-col items-center justify-center p-8 overflow-hidden bg-[#f8f9fa] text-neutral-900 select-none">
      {/* Subtle coordinate grid */}
      <div
        className="absolute inset-0 opacity-[0.045] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.4) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Dynamic Ambient Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 45%, rgb(${accentRgb} / 0.16) 0%, transparent 65%)`,
        }}
      />

      {/* Crisp Thematic Vector Artwork */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-5">
        {chapter.id === "move" && (
          <svg className="w-28 h-20 sm:w-36 sm:h-24 stroke-orange-600 fill-none" viewBox="0 0 120 60">
            <path
              d="M10 35 L 35 35 L 45 10 L 55 50 L 65 25 L 75 40 L 85 35 L 110 35"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="45" cy="10" r="3" fill="#ea580c" />
            <circle cx="55" cy="50" r="3" fill="#ea580c" />
          </svg>
        )}
        {chapter.id === "think" && (
          <svg className="w-24 h-24 sm:w-28 sm:h-28 stroke-sky-600 fill-none" viewBox="0 0 80 80">
            <circle cx="40" cy="20" r="8" strokeWidth="2" />
            <circle cx="20" cy="55" r="7" strokeWidth="2" />
            <circle cx="60" cy="55" r="7" strokeWidth="2" />
            <line x1="40" y1="28" x2="20" y2="48" strokeWidth="1.5" strokeDasharray="3 2" />
            <line x1="40" y1="28" x2="60" y2="48" strokeWidth="1.5" strokeDasharray="3 2" />
            <line x1="27" y1="55" x2="53" y2="55" strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="40" cy="42" r="3" fill="#0284c7" />
          </svg>
        )}
        {chapter.id === "create" && (
          <svg className="w-24 h-24 sm:w-28 sm:h-28 stroke-purple-600 fill-none" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="30" strokeWidth="2" strokeDasharray="4 2" />
            <circle cx="40" cy="40" r="18" strokeWidth="2.5" />
            <circle cx="40" cy="40" r="6" fill="#9333ea" />
            <line x1="40" y1="10" x2="40" y2="22" strokeWidth="2" />
            <line x1="40" y1="58" x2="40" y2="70" strokeWidth="2" />
            <line x1="10" y1="40" x2="22" y2="40" strokeWidth="2" />
            <line x1="58" y1="40" x2="70" y2="40" strokeWidth="2" />
          </svg>
        )}
        {chapter.id === "explore" && (
          <svg className="w-28 h-20 sm:w-32 sm:h-24 stroke-emerald-600 fill-none" viewBox="0 0 100 60">
            <path
              d="M5 45 Q 25 25 50 40 T 95 20"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M5 55 Q 35 35 65 50 T 95 35"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              strokeOpacity="0.45"
            />
            <circle cx="50" cy="40" r="3.5" fill="#059669" />
            <circle cx="95" cy="20" r="3.5" fill="#059669" />
          </svg>
        )}
        <span className="font-excon font-bold text-sm sm:text-base text-neutral-800 tracking-wide">
          {chapter.title}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DYNAMIC PHOTO CANVAS WITH AUTO RESOLUTION & MINIMAL ARTWORK FALLBACK       */
/* -------------------------------------------------------------------------- */
function OffScriptImageCanvas({ chapter }: { chapter: OffScriptChapter }) {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);

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
    <div className="relative w-full h-full min-h-[240px] sm:min-h-[300px] rounded-2xl overflow-hidden bg-[#f8f9fa] border border-black/[0.08] shadow-[0_12px_32px_rgba(15,23,42,0.06)] flex items-center justify-center group">
      {!hasFailedAll ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={candidatePaths[currentSrcIndex]}
          alt={chapter.headline}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <OffScriptBlueprint chapter={chapter} />
      )}

      {/* Subtle glass sheen */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30" />
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
    <div className="w-full flex flex-col gap-4 sm:gap-5 select-none">
      {/* ------------------------------------------------------------------ */}
      {/* TOP INTERACTIVE INDEX RAIL                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-black/[0.04] border border-black/[0.08] w-full sm:w-auto">
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
                aria-label={`Select chapter ${item.title}`}
                className={`group relative px-3.5 sm:px-4 py-1.5 rounded-full font-excon text-xs sm:text-sm font-bold tracking-tight transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 ${
                  isCurrent ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900 hover:bg-black/[0.04]"
                }`}
              >
                {isCurrent && (
                  <motion.div
                    layoutId="activeBeyondRailPill"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-white rounded-full shadow-xs border border-black/[0.06]"
                  />
                )}
                <span className="relative z-10">{item.title}</span>
                <span
                  className="relative z-10 h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-125"
                  style={{ backgroundColor: `rgb(${item.accent.join(" ")})` }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN EDITORIAL STAGE: SPACIOUS NARRATIVE & MINIMAL VISUAL CANVAS   */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedChapter.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative w-full rounded-[24px] sm:rounded-[32px] overflow-hidden border border-black/[0.07] hover:border-black/[0.14] shadow-[0_14px_40px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)] backdrop-blur-2xl bg-white/95 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-8 lg:gap-10 items-center transition-all duration-300"
        >
          {/* Left Column (7 cols): Calm Narrative Storytelling */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              {/* Category Eyebrow */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: `rgb(${selectedChapter.accent.join(" ")})`,
                    boxShadow: `0 0 8px rgb(${selectedChapter.accent.join(" ")} / 0.55)`,
                  }}
                />
                <span className="font-mono text-xs font-medium uppercase tracking-wider text-neutral-500">
                  {selectedChapter.category}
                </span>
              </div>

              {/* Headline & Story */}
              <h3 className="font-excon text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-neutral-900 leading-[1.08]">
                {selectedChapter.headline}
              </h3>
              <p className="mt-3 font-inter text-sm sm:text-base text-neutral-600 leading-relaxed max-w-[46ch]">
                {selectedChapter.body}
              </p>
            </div>

            {/* Clean Hairline Focus Strip (Mindset label removed) */}
            <div className="border-t border-black/10 pt-4 flex flex-wrap items-center justify-between gap-3">
              <span
                className="font-excon font-bold text-sm sm:text-base"
                style={{
                  color: `color-mix(in srgb, rgb(${selectedChapter.accent.join(" ")}) 74%, #000000)`,
                }}
              >
                {selectedChapter.mindset}
              </span>
              <span className="font-mono text-xs text-neutral-500">
                {selectedChapter.habits.slice(0, 3).join(" · ")}
              </span>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={(e) => openModal(selectedChapter, e.currentTarget)}
                onMouseEnter={() => soundFX.playHoverTick()}
                className="rounded-full bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 font-inter text-xs sm:text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 cursor-pointer"
              >
                Read Reflections
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): Visual Canvas */}
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
                  className="fixed inset-0 bg-black/30 backdrop-blur-md"
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
                  className="relative w-full max-w-[640px] max-h-[88vh] flex flex-col bg-white/95 backdrop-blur-2xl rounded-[24px] sm:rounded-[28px] border border-black/10 shadow-[0_24px_64px_rgba(15,23,42,0.16)] text-neutral-900 overflow-hidden z-10"
                >
                  {/* Close Button with ESC hint */}
                  <button
                    className="group absolute top-3.5 sm:top-4 right-3.5 sm:right-4 z-30 flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-black/10 text-neutral-800 backdrop-blur-md hover:bg-neutral-900 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-neutral-900"
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
                  <div className="relative h-44 sm:h-56 w-full shrink-0 overflow-hidden bg-neutral-100">
                    <OffScriptImageCanvas key={activeModalChapter.slug} chapter={activeModalChapter} />
                  </div>

                  {/* Modal Body */}
                  <div className="flex flex-col flex-1 overflow-y-auto p-5 sm:p-7 md:p-8 space-y-5">
                    {/* Header */}
                    <div className="pb-4 border-b border-black/10">
                      <span className="font-mono text-[0.68rem] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        {`${activeModalChapter.numeral} // ${activeModalChapter.category}`}
                      </span>
                      <h3
                        id="offscript-modal-title"
                        className="mt-1 font-excon text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900"
                      >
                        {activeModalChapter.headline}
                      </h3>
                      <p className="mt-1 font-inter text-xs sm:text-sm font-medium text-neutral-600">
                        {activeModalChapter.tagline}
                      </p>
                    </div>

                    {/* Approach Card */}
                    <div
                      className="rounded-2xl border p-4 sm:p-4.5"
                      style={{
                        backgroundColor: `rgb(${activeModalChapter.accent.join(" ")} / 0.08)`,
                        borderColor: `rgb(${activeModalChapter.accent.join(" ")} / 0.25)`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-500">
                          Perspective
                        </span>
                        <span
                          className="font-excon font-bold text-sm sm:text-base"
                          style={{
                            color: `color-mix(in srgb, rgb(${activeModalChapter.accent.join(" ")}) 74%, #000000)`,
                          }}
                        >
                          {activeModalChapter.mindset}
                        </span>
                      </div>
                      <p className="font-inter text-xs sm:text-sm text-neutral-700 leading-relaxed">
                        {activeModalChapter.mindsetSub}
                      </p>
                    </div>

                    {/* Full Narrative Essay */}
                    <div className="space-y-1.5">
                      <span className="block font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-500">
                        The Story
                      </span>
                      <p className="font-inter text-xs sm:text-sm text-neutral-700 leading-relaxed">
                        {activeModalChapter.body}
                      </p>
                    </div>

                    {/* Philosophical Takeaway Callout */}
                    <div className="rounded-2xl border border-black/[0.08] bg-neutral-50/90 p-4 sm:p-4.5 space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-neutral-900" />
                        <span className="font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-500">
                          Engineering Parallel
                        </span>
                      </div>
                      <p className="font-inter text-xs sm:text-sm text-neutral-700 leading-relaxed italic">
                        &ldquo;{activeModalChapter.takeaway}&rdquo;
                      </p>
                    </div>

                    {/* Disciplines & Focus Pills */}
                    <div className="space-y-2 pt-2 border-t border-black/10">
                      <span className="block font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-500">
                        Core Disciplines & Pursuits
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeModalChapter.habits.map((habit) => (
                          <span
                            key={habit}
                            className="rounded-full border border-black/10 bg-neutral-100 px-2.5 py-0.5 font-inter text-[0.7rem] font-medium text-neutral-800"
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

