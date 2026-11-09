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

export type WorkProject = {
  numeral: string;
  title: string;
  category: string;
  tagline: string;
  status: "Completed" | "Completed & Live" | "Completed · v2.0 Stable" | "In Progress · v2.0" | "In Progress";
  description: string;
  src: string;
  ctaText: string;
  ctaLink: string;
  tags: string[];
  metrics: string;
  metricLabel: string;
  metricDetail: string;
  isSpecialSignature?: boolean;
  overview: string;
  featureHeading: string;
  featureDescription: string;
  resources?: { label: string; url?: string; note?: string }[];
};

export const PROJECTS: WorkProject[] = [
  {
    numeral: "01",
    title: "RepayIQ",
    category: "FINTECH / PERSONAL FINANCE",
    tagline: "A calmer, smarter way to stay ahead of debt.",
    status: "Completed",
    description:
      "An offline-first personal debt management application that simplifies EMI tracking, automates payment reminders, and transforms complex CIBIL credit reports into actionable financial insights.",
    src: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop",
    ctaText: "GitHub Repo ↗",
    ctaLink: "https://github.com/Tectonic-s/RepayIQ",
    tags: ["Flutter", "Dart", "Riverpod", "SQLite", "Firebase", "Syncfusion PDF", "GoRouter"],
    metrics: "₹0 Cloud Dependency",
    metricLabel: "Cloud dependency for CIBIL analysis",
    metricDetail: "Credit report processing and financial intelligence performed entirely on-device.",
    overview:
      "RepayIQ is a cross-platform financial management application designed to help individuals and families stay on top of their loan commitments. It combines a centralized EMI dashboard, payment history, automated reminders, and financial calculators with an offline-first SQLite architecture and real-time Firebase synchronization.",
    featureHeading: "On-Device Credit Intelligence & Dossier Generator",
    featureDescription:
      "Engineered a privacy-focused CIBIL report processing engine that parses password-protected credit bureau PDFs, reconstructs fragmented text streams, extracts loan obligations, and derives missing interest rates using numerical binary search. Generates structured financial dossiers directly on-device without transmitting sensitive documents to external servers.",
    resources: [
      { label: "GitHub Repository", url: "https://github.com/Tectonic-s/RepayIQ" },
      { label: "Architecture", note: "README.md" },
      { label: "Roadmap", note: "FUTURE_SCOPE.md" },
    ],
  },
  {
    numeral: "02",
    title: "Tectonics Vault",
    category: "CREATIVE ENGINEERING / INTERACTIVE WEB",
    tagline: "An interactive editorial portfolio engineered through motion, mathematics, and sound.",
    status: "Completed & Live",
    description:
      "A high-performance interactive portfolio platform combining cinematic scroll choreography, mathematical FLIP transitions, procedural audio synthesis, and accessible web interactions.",
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    ctaText: "GitHub Repo ↗",
    ctaLink: "https://github.com/Tectonic-s/tectonics-vault",
    tags: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS v4",
      "GSAP",
      "Lenis",
      "Web Audio API",
      "Three.js",
      "Zustand",
    ],
    metrics: "100% Tharun",
    metricLabel: "Personal signature. Zero templates.",
    metricDetail: "A playful reminder that every detail of the experience carries its creator's identity.",
    isSpecialSignature: true,
    overview:
      "Tectonics Vault is an interactive editorial portfolio that presents engineering projects, professional progression, technical skills, and creative explorations through a carefully choreographed single-page experience. Its custom scroll engine synchronizes nested interactive sections with a virtual 700vh canvas while preserving keyboard accessibility and reduced-motion support.",
    featureHeading: "Mathematical FLIP & Tactile Scroll Engine",
    featureDescription:
      "Implemented a single-element FLIP transition that morphs the introductory hero heading into the persistent navigation logo using calculated bounding-box transformations. Combined with a custom nonlinear rubber-band gesture engine and a procedural Web Audio synthesizer, the platform delivers tactile interactions without relying on external audio assets.",
    resources: [
      { label: "Live Deployment", note: "Current Experience" },
      { label: "GitHub Repository", url: "https://github.com/Tectonic-s/tectonics-vault" },
    ],
  },
  {
    numeral: "03",
    title: "Sannidhi (சந்நிதி)",
    category: "CIVICTECH / SMART PILGRIMAGE",
    tagline: "The intelligent operating system for sacred temples and pilgrimages.",
    status: "Completed · v2.0 Stable",
    description:
      "A multi-role temple management ecosystem integrating digital reservations, offline QR verification, real-time crowd telemetry, AI assistance, and transparent digital donations.",
    src: "https://images.unsplash.com/photo-1600100397608-f010f44e837a?q=80&w=1200&auto=format&fit=crop",
    ctaText: "GitHub Repo ↗",
    ctaLink: "https://github.com/Tectonic-s/Sannidhi",
    tags: ["Flutter", "Dart", "Provider", "Node.js", "Express", "SQLite", "Firebase", "Cashfree", "Google Gemini", "JWT"],
    metrics: "3-Tier Verification",
    metricLabel: "Offline-resilient gate verification",
    metricDetail: "Cloud → Backend → Local fallback, designed to maintain entry operations during network interruptions.",
    overview:
      "Sannidhi is a cross-platform pilgrimage management application designed around the operational challenges of high-footfall temples. It connects devotees, gate staff, and temple administrators through dedicated interfaces for digital bookings, QR-based entry, crowd monitoring, emergency broadcasts, and donation management.",
    featureHeading: "Offline-Resilient Gate Verification & Crowd Telemetry",
    featureDescription:
      "Developed a multi-layer QR verification pipeline with cloud, backend, and local fallback mechanisms to maintain gate operations during network interruptions. Integrated GPS geofencing, booking data, and demographic multipliers into a crowd estimation engine to improve campus occupancy visibility and queue management.",
    resources: [
      { label: "Mobile App Repository", url: "https://github.com/Tectonic-s/Sannidhi" },
      { label: "Backend Repository", url: "https://github.com/Tectonic-s/sannidhi-backend" },
      { label: "Production v2.0 Release", url: "https://github.com/Tectonic-s/Sannidhi/releases/tag/v2.0" },
    ],
  },
  {
    numeral: "04",
    title: "PhotoVault",
    category: "SYSTEMS ENGINEERING / STORAGE INFRASTRUCTURE",
    tagline: "Intelligent media consolidation with zero-compromise data integrity.",
    status: "In Progress · v2.0",
    description:
      "A high-performance Python CLI engine for consolidating, deduplicating, and reconstructing metadata across large photo libraries from different ecosystems.",
    src: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
    ctaText: "GitHub Repo ↗",
    ctaLink: "https://github.com/Tectonic-s/PhotoVault",
    tags: [
      "Python 3.12+",
      "SQLite",
      "Pillow",
      "piexif",
      "SHA-256",
      "ProcessPoolExecutor",
      "QuickTime Binary Parsing",
      "Rich",
      "pytest",
    ],
    metrics: "128 KB Selective Hashing",
    metricLabel: "Selective head/tail hashing",
    metricDetail: "A three-stage deduplication sieve that avoids unnecessary full-file hashing by sampling candidate files first.",
    overview:
      "PhotoVault is a media migration and organization engine designed to consolidate fragmented photo libraries, particularly Google Photos Takeout archives and Apple photo collections. It reconstructs stripped EXIF metadata, preserves Apple Live Photo relationships, resolves filename collisions, and organizes media into chronological directory structures.",
    featureHeading: "Tiered Deduplication & Live Photo Preservation",
    featureDescription:
      "Engineered a three-stage deduplication system that eliminates unnecessary disk reads through file-size partitioning and partial hashing before executing targeted cryptographic verification. Implements custom QuickTime binary parsing, Google Takeout JSON metadata reconstruction, and synchronized HEIC/MOV collision handling to preserve native Live Photo functionality.",
    resources: [
      { label: "GitHub Repository", url: "https://github.com/Tectonic-s/PhotoVault" },
      { label: "Architecture", note: "learning.md" },
      { label: "Technical Docs", note: "generate_pdf.py" },
    ],
  },
  {
    numeral: "05",
    title: "ASCEND",
    category: "CAREER TECHNOLOGY / AI PRODUCT ENGINEERING",
    tagline: "Turning every career attempt into a measurable step forward.",
    status: "In Progress",
    description:
      "A distraction-free career operating system that transforms job applications, interview experiences, and recruitment outcomes into structured insights and personalized preparation.",
    src: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1200&auto=format&fit=crop",
    ctaText: "Design Spec ↗",
    ctaLink: "#",
    tags: [
      "Flutter",
      "Dart",
      "Riverpod 3",
      "Supabase",
      "PostgreSQL",
      "OpenRouter API",
      "Google Gemini",
      "SharedPreferences",
    ],
    metrics: "5 → 1 Career Loop",
    metricLabel: "One continuous career improvement loop",
    metricDetail: "Application → Outcome → Debrief → Pattern Synthesis → Targeted Preparation.",
    overview:
      "ASCEND is a cross-platform career companion built for students, graduates, and early-career professionals navigating competitive recruitment processes. It combines application pipeline management, company intelligence, resume conversion tracking, interview preparation, and contextual AI coaching into a unified career progression system.",
    featureHeading: "Context-Grounded AI Career Intelligence",
    featureDescription:
      "Built an AI-powered career companion that combines application history, Pre-Placement Talk intelligence, interview schedules, and previous reflections to generate personalized preparation strategies. Its integrated debrief engine and resume A/B attribution system turn recruitment outcomes into actionable insights for continuous improvement.",
    resources: [
      { label: "Repository", note: "Private / Local Repository" },
      { label: "Design Specification", note: "design.md" },
      { label: "Database Architecture", note: "supabase_schema.sql" },
    ],
  },
];

export function WorksExpandable({
  projects = PROJECTS,
  onModalChange,
}: {
  projects?: WorkProject[];
  onModalChange?: (isOpen: boolean) => void;
}) {
  const [active, setActive] = useState<WorkProject | null>(null);
  const mounted = useIsMounted();
  const ref = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const closeModal = () => {
    soundFX.playModalClose();
    setActive(null);
    lastTriggerRef.current?.focus();
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
      onModalChange?.(true);
    } else {
      document.body.style.overflow = "auto";
      onModalChange?.(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, onModalChange]);

  useOutsideClick(ref, () => {
    if (active) {
      closeModal();
    }
  });

  return (
    <>
      {/* Silky Case Study Dialog - Portaled to document.body */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {active && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
                {/* Translucent White Frosted Backdrop across the ENTIRE viewport */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="fixed inset-0 bg-white/80 backdrop-blur-md"
                  onClick={closeModal}
                />

                {/* Modal Container */}
                <motion.div
                  ref={ref}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="works-modal-title"
                  initial={{ opacity: 0, scale: 0.96, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 8 }}
                  transition={{
                    duration: 0.22,
                    ease: [0.16, 1, 0.3, 1], // Apple fluid easing
                  }}
                  className="relative w-full max-w-[620px] max-h-[88vh] flex flex-col bg-white rounded-[24px] sm:rounded-[28px] border border-black/10 shadow-[0_24px_64px_rgba(0,0,0,0.12)] overflow-hidden z-10"
                >
                  {/* Close Button with ESC hint */}
                  <button
                    className="group absolute top-3 sm:top-4 right-3 sm:right-4 z-20 flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-black/75 text-white backdrop-blur-md hover:bg-black transition-all hover:scale-105 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
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

                  {/* Hero Image */}
                  <div className="relative h-40 sm:h-52 w-full shrink-0 overflow-hidden bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={active.src}
                      alt={active.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
                    <div className="absolute bottom-3 left-4 sm:left-6 flex items-center gap-2">
                      <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 font-mono text-[0.68rem] font-semibold text-white/90 uppercase tracking-wider border border-white/10">
                        {active.numeral} // {active.category}
                      </span>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="flex flex-col flex-1 overflow-y-auto p-4 sm:p-6 md:p-7 space-y-5">
                    {/* Header: Title, Tagline & CTA */}
                    <div className="flex items-start justify-between gap-3 sm:gap-4 pb-4 border-b border-black/6">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 id="works-modal-title" className="font-excon text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                            {active.title}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.5 font-mono text-[0.62rem] sm:text-[0.68rem] font-medium border ${
                              active.status.includes("Completed")
                                ? "border-emerald-500/20 bg-emerald-50 text-emerald-800"
                                : "border-amber-500/20 bg-amber-50 text-amber-800"
                            }`}
                          >
                            {active.status}
                          </span>
                        </div>
                        <p className="mt-1 font-inter text-xs sm:text-sm font-medium text-neutral-600 leading-snug">
                          {active.tagline}
                        </p>
                      </div>

                      {active.ctaLink && active.ctaLink !== "#" ? (
                        <a
                          href={active.ctaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-full bg-black px-3.5 py-2 sm:px-4 sm:py-2.5 font-inter text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:scale-105 active:scale-95"
                        >
                          {active.ctaText}
                        </a>
                      ) : (
                        <span className="shrink-0 rounded-full bg-neutral-100 border border-black/10 px-3.5 py-2 sm:px-4 sm:py-2.5 font-inter text-xs font-semibold text-neutral-600">
                          {active.ctaText}
                        </span>
                      )}
                    </div>

                    {/* Standout Metric / Signature Highlight Card */}
                    {active.isSpecialSignature ? (
                      <div className="rounded-2xl border-2 border-dashed border-neutral-900/15 bg-neutral-50/80 p-4 sm:p-4.5 relative overflow-hidden">
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <span className="font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-400">
                            Creator Signature
                          </span>
                          <span className="rounded-full border border-black bg-black text-white px-2.5 py-0.5 font-mono text-[0.68rem] font-bold tracking-wider flex items-center gap-1 shadow-sm">
                            <span className="text-amber-400">✦</span> 100% Tharun
                          </span>
                        </div>
                        <p className="font-excon font-bold text-sm sm:text-base text-neutral-900">
                          {active.metricLabel}
                        </p>
                        <p className="mt-1 font-inter text-xs text-neutral-600 leading-relaxed">
                          {active.metricDetail}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-black/8 bg-neutral-50/90 p-4 sm:p-4.5">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-400">
                            Standout Metric
                          </span>
                          <span className="font-excon font-bold text-base sm:text-lg text-emerald-700">
                            {active.metrics}
                          </span>
                        </div>
                        <p className="font-inter font-semibold text-xs sm:text-sm text-neutral-900">
                          {active.metricLabel}
                        </p>
                        <p className="mt-1 font-inter text-xs text-neutral-600 leading-relaxed">
                          {active.metricDetail}
                        </p>
                      </div>
                    )}

                    {/* Project Overview */}
                    <div className="space-y-1.5">
                      <span className="block font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-400">
                        Project Overview
                      </span>
                      <p className="font-inter text-xs sm:text-sm text-neutral-700 leading-relaxed">
                        {active.overview}
                      </p>
                    </div>

                    {/* Feature Highlight Callout */}
                    <div className="rounded-2xl border border-black/8 bg-white p-4 sm:p-4.5 shadow-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-ink" />
                        <span className="font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-500">
                          Feature Highlight
                        </span>
                      </div>
                      <h4 className="font-excon font-bold text-sm sm:text-base text-ink">
                        {active.featureHeading}
                      </h4>
                      <p className="font-inter text-xs sm:text-sm text-neutral-600 leading-relaxed">
                        {active.featureDescription}
                      </p>
                    </div>

                    {/* Tech Stack Pills */}
                    <div className="space-y-2 pt-2 border-t border-black/6">
                      <span className="block font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-400">
                        Technology Stack
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {active.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-black/8 bg-neutral-50 px-2.5 py-0.5 font-inter text-[0.7rem] font-medium text-neutral-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Links & Resources */}
                    {active.resources && active.resources.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-black/6">
                        <span className="block font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-400">
                          Links & Documentation
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {active.resources.map((res) => (
                            <div
                              key={res.label}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-black/8 bg-neutral-50 px-2.5 py-1 text-xs font-inter text-neutral-700"
                            >
                              <span className="font-semibold text-neutral-900">{res.label}:</span>
                              {res.url ? (
                                <a
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-black underline underline-offset-2 hover:text-emerald-700 font-mono text-[0.7rem]"
                                >
                                  View ↗
                                </a>
                              ) : (
                                <span className="font-mono text-[0.7rem] text-neutral-500">{res.note}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Grid of Work Cards */}
      <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 max-h-[64vh] overflow-y-auto pr-1">
        {projects.map((card) => (
          <motion.button
            type="button"
            key={card.title}
            aria-haspopup="dialog"
            aria-label={`Inspect ${card.title} - ${card.category}`}
            onClick={(e) => {
              soundFX.playModalOpen();
              lastTriggerRef.current = e.currentTarget;
              setActive(card);
            }}
            onMouseEnter={() => soundFX.playHoverTick()}
            whileHover={{ y: -4, scale: 1.008 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="group relative flex flex-col justify-between text-left w-full rounded-[20px] sm:rounded-[22px] border border-black/8 bg-white p-3.5 sm:p-4 md:p-4.5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:border-black/20 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 cursor-pointer"
          >
            <div>
              {/* Header: Numeral, Category & Status */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[0.62rem] sm:text-[0.68rem] font-semibold uppercase tracking-wider text-neutral-400">
                  {card.numeral} // {card.category}
                </span>
                <span
                  className={`flex items-center gap-1 font-mono text-[0.6rem] sm:text-[0.64rem] font-medium px-2 py-0.5 rounded-full border ${
                    card.status.includes("Completed")
                      ? "border-emerald-500/20 bg-emerald-50/80 text-emerald-800"
                      : "border-amber-500/20 bg-amber-50/80 text-amber-800"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      card.status.includes("Completed") ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  {card.status}
                </span>
              </div>

              {/* Main Content Row: Image + Text */}
              <div className="mt-2.5 sm:mt-3 flex gap-3 sm:gap-3.5 items-center">
                <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 border border-black/6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.src}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-excon font-bold text-base sm:text-lg text-ink tracking-tight truncate group-hover:text-black transition-colors">
                      {card.title}
                    </h3>
                    <span
                      aria-hidden="true"
                      className="font-mono text-xs text-neutral-400 group-hover:text-black transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    >
                      ↗
                    </span>
                  </div>
                  <p className="mt-0.5 font-inter text-xs text-neutral-500 line-clamp-1 leading-relaxed">
                    {card.tagline}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Row: Tags + Standout Metric + Inspect Pill */}
            <div className="mt-3 pt-2.5 border-t border-black/6 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap min-w-0">
                {card.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/6 bg-neutral-50 px-2 py-0.5 font-inter text-[0.62rem] sm:text-[0.66rem] font-medium text-neutral-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {card.isSpecialSignature ? (
                  <span className="rounded-full border border-neutral-900 bg-neutral-900 text-white px-2 py-0.5 font-mono text-[0.62rem] sm:text-[0.66rem] font-bold tracking-wider flex items-center gap-1 shadow-xs">
                    <span className="text-amber-400">✦</span> 100% Tharun
                  </span>
                ) : (
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-50 px-2 py-0.5 font-mono text-[0.62rem] sm:text-[0.66rem] font-semibold text-emerald-800">
                    {card.metrics}
                  </span>
                )}

                <span
                  aria-hidden="true"
                  className="rounded-full border border-black/10 bg-neutral-100 group-hover:bg-black group-hover:text-white px-2.5 py-0.5 font-inter text-[0.66rem] sm:text-xs font-semibold text-neutral-800 transition-all duration-200 group-hover:scale-105 active:scale-95"
                >
                  Inspect
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </>
  );
}

export default WorksExpandable;

export const CloseIcon = () => {
  return (
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
};
