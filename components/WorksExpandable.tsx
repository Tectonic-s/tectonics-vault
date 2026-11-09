"use client";

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
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
  id: string;
  slug: string;
  numeral: string;
  title: string;
  category: string;
  tagline: string;
  status: "Completed" | "Completed & Live" | "Completed · v2.0 Stable" | "In Progress · v2.0" | "In Progress";
  description: string;
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
  blueprintType: "fintech" | "vault" | "civic" | "storage" | "career";
  resources?: { label: string; url?: string; note?: string }[];
};

export const PROJECTS: WorkProject[] = [
  {
    id: "repayiq",
    slug: "repayiq",
    numeral: "01",
    title: "RepayIQ",
    category: "FINTECH / PERSONAL FINANCE",
    tagline: "A calmer, smarter way to stay ahead of debt.",
    status: "Completed",
    description:
      "An offline-first personal debt management application that simplifies EMI tracking, automates payment reminders, and transforms complex CIBIL credit reports into actionable financial insights.",
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
    blueprintType: "fintech",
    resources: [
      { label: "GitHub Repository", url: "https://github.com/Tectonic-s/RepayIQ" },
      { label: "Architecture", note: "README.md" },
      { label: "Roadmap", note: "FUTURE_SCOPE.md" },
    ],
  },
  {
    id: "vault",
    slug: "tectonics-vault",
    numeral: "02",
    title: "Tectonics Vault",
    category: "CREATIVE ENGINEERING / INTERACTIVE WEB",
    tagline: "An interactive editorial portfolio engineered through motion, mathematics, and sound.",
    status: "Completed & Live",
    description:
      "A high-performance interactive portfolio platform combining cinematic scroll choreography, mathematical FLIP transitions, procedural audio synthesis, and accessible web interactions.",
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
    blueprintType: "vault",
    resources: [
      { label: "Live Deployment", note: "Current Experience" },
      { label: "GitHub Repository", url: "https://github.com/Tectonic-s/tectonics-vault" },
    ],
  },
  {
    id: "sannidhi",
    slug: "sannidhi",
    numeral: "03",
    title: "Sannidhi (சந்நிதி)",
    category: "CIVICTECH / SMART PILGRIMAGE",
    tagline: "The intelligent operating system for sacred temples and pilgrimages.",
    status: "Completed · v2.0 Stable",
    description:
      "A multi-role temple management ecosystem integrating digital reservations, offline QR verification, real-time crowd telemetry, AI assistance, and transparent digital donations.",
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
    blueprintType: "civic",
    resources: [
      { label: "Mobile App Repository", url: "https://github.com/Tectonic-s/Sannidhi" },
      { label: "Backend Repository", url: "https://github.com/Tectonic-s/sannidhi-backend" },
      { label: "Production v2.0 Release", url: "https://github.com/Tectonic-s/Sannidhi/releases/tag/v2.0" },
    ],
  },
  {
    id: "photovault",
    slug: "photovault",
    numeral: "04",
    title: "PhotoVault",
    category: "SYSTEMS ENGINEERING / STORAGE INFRASTRUCTURE",
    tagline: "Intelligent media consolidation with zero-compromise data integrity.",
    status: "In Progress · v2.0",
    description:
      "A high-performance Python CLI engine for consolidating, deduplicating, and reconstructing metadata across large photo libraries from different ecosystems.",
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
    blueprintType: "storage",
    resources: [
      { label: "GitHub Repository", url: "https://github.com/Tectonic-s/PhotoVault" },
      { label: "Architecture", note: "learning.md" },
      { label: "Technical Docs", note: "generate_pdf.py" },
    ],
  },
  {
    id: "ascend",
    slug: "ascend",
    numeral: "05",
    title: "ASCEND",
    category: "CAREER TECHNOLOGY / AI PRODUCT ENGINEERING",
    tagline: "Turning every career attempt into a measurable step forward.",
    status: "In Progress",
    description:
      "A distraction-free career operating system that transforms job applications, interview experiences, and recruitment outcomes into structured insights and personalized preparation.",
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
    blueprintType: "career",
    resources: [
      { label: "Repository", note: "Private / Local Repository" },
      { label: "Design Specification", note: "design.md" },
      { label: "Database Architecture", note: "supabase_schema.sql" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* ARCHITECTURAL BLUEPRINT FALLBACK CANVAS                                    */
/* Renders a high-craft generative technical schematic when app-name.png      */
/* is loading or not yet uploaded in public/                                  */
/* -------------------------------------------------------------------------- */
function BlueprintSchematic({ project }: { project: WorkProject }) {
  return (
    <div className="relative w-full h-full min-h-[220px] sm:min-h-[260px] flex flex-col justify-between p-4 sm:p-5 overflow-hidden bg-[#0d0f12] text-white/90 select-none font-mono">
      {/* Background Architectural Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Ambient Radial Spotlight */}
      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top Header: System Coordinate & Category */}
      <div className="relative z-10 flex items-center justify-between text-[0.62rem] sm:text-[0.68rem] tracking-widest uppercase text-white/45 border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>SPEC // {project.numeral} · {project.blueprintType.toUpperCase()}</span>
        </div>
        <span>ARCHIVE_NODE // 2024</span>
      </div>

      {/* Center Visual: Thematic SVG Vector Schematic */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center py-4">
        {project.blueprintType === "fintech" && (
          <svg className="w-24 h-16 sm:w-32 sm:h-20 stroke-emerald-400/80 fill-none" viewBox="0 0 120 60">
            <path d="M5 45 Q 35 48 55 25 T 115 10" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="5" y1="52" x2="115" y2="52" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4" />
            <circle cx="55" cy="25" r="3.5" fill="#34d399" />
            <circle cx="115" cy="10" r="3.5" fill="#34d399" />
          </svg>
        )}
        {project.blueprintType === "vault" && (
          <svg className="w-20 h-20 sm:w-24 sm:h-24 stroke-white/70 fill-none" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="40" cy="40" r="22" strokeWidth="2" />
            <circle cx="40" cy="40" r="6" fill="white" />
            <line x1="40" y1="4" x2="40" y2="12" strokeWidth="2" />
            <line x1="40" y1="68" x2="40" y2="76" strokeWidth="2" />
            <line x1="4" y1="40" x2="12" y2="40" strokeWidth="2" />
            <line x1="68" y1="40" x2="76" y2="40" strokeWidth="2" />
          </svg>
        )}
        {project.blueprintType === "civic" && (
          <svg className="w-20 h-20 sm:w-24 sm:h-24 stroke-amber-300/80 fill-none" viewBox="0 0 80 80">
            <path d="M15 70 L 15 35 L 40 10 L 65 35 L 65 70 Z" strokeWidth="2" />
            <path d="M30 70 L 30 45 Q 40 38 50 45 L 50 70" strokeWidth="2" />
            <line x1="40" y1="10" x2="40" y2="2" strokeWidth="2.5" />
          </svg>
        )}
        {project.blueprintType === "storage" && (
          <svg className="w-22 h-18 sm:w-28 sm:h-20 stroke-sky-400/80 fill-none" viewBox="0 0 100 60">
            <rect x="10" y="8" width="80" height="12" rx="3" strokeWidth="1.8" />
            <rect x="10" y="24" width="80" height="12" rx="3" strokeWidth="1.8" />
            <rect x="10" y="40" width="80" height="12" rx="3" strokeWidth="1.8" />
            <circle cx="80" cy="14" r="2" fill="#38bdf8" />
            <circle cx="80" cy="30" r="2" fill="#38bdf8" />
            <circle cx="80" cy="46" r="2" fill="#38bdf8" />
          </svg>
        )}
        {project.blueprintType === "career" && (
          <svg className="w-24 h-16 sm:w-28 sm:h-20 stroke-purple-400/80 fill-none" viewBox="0 0 110 50">
            <circle cx="15" cy="25" r="6" strokeWidth="2" />
            <line x1="21" y1="25" x2="45" y2="25" strokeWidth="2" strokeDasharray="3 2" />
            <circle cx="55" cy="25" r="7" strokeWidth="2.5" />
            <line x1="62" y1="25" x2="88" y2="25" strokeWidth="2" strokeDasharray="3 2" />
            <circle cx="95" cy="25" r="6" strokeWidth="2" fill="#c084fc" />
          </svg>
        )}
        <div className="mt-2 text-center">
          <span className="font-excon font-bold text-base sm:text-lg text-white tracking-wide">
            {project.title}
          </span>
          <p className="text-[0.65rem] text-white/50 tracking-wider">
            UPLOAD // public/{project.slug}.png
          </p>
        </div>
      </div>

      {/* Bottom Technical Tag */}
      <div className="relative z-10 flex items-center justify-between text-[0.6rem] text-white/40 border-t border-white/10 pt-2">
        <span>CORE // {project.metrics}</span>
        <span className="text-emerald-400/80">STANDBY_OK</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DYNAMIC PROJECT IMAGE DISPLAY WITH AUTOMATIC LOCAL FILE RESOLUTION         */
/* -------------------------------------------------------------------------- */
function ProjectImageCanvas({ project }: { project: WorkProject }) {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  // Candidate paths where user may drop app-name.png
  const candidatePaths = [
    `/${project.slug}.png`,
    `/projects/${project.slug}.png`,
    `/${project.id}.png`,
    `/projects/${project.id}.png`,
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
      {/* Subtle Studio Window Titlebar */}
      <div className="absolute top-0 inset-x-0 h-7 bg-black/60 backdrop-blur-md z-20 flex items-center justify-between px-3.5 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500/80" />
          <span className="h-2 w-2 rounded-full bg-amber-500/80" />
          <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
        </div>
        <span className="font-mono text-[0.62rem] text-white/50 tracking-wider">
          {project.slug}.png
        </span>
        <span className="font-mono text-[0.6rem] text-white/35">
          {project.numeral}/05
        </span>
      </div>

      {!hasFailedAll ? (
        <div className="w-full h-full pt-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={candidatePaths[currentSrcIndex]}
            alt={project.title}
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="w-full h-full pt-7">
          <BlueprintSchematic project={project} />
        </div>
      )}

      {/* Glass sheen overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08]" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN WORKS EXPANDABLE SHOWCASE COMPONENT                                   */
/* -------------------------------------------------------------------------- */
export function WorksExpandable({
  projects = PROJECTS,
  onModalChange,
}: {
  projects?: WorkProject[];
  onModalChange?: (isOpen: boolean) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeModalProject, setActiveModalProject] = useState<WorkProject | null>(null);
  const mounted = useIsMounted();
  const modalRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const selectedProject = projects[selectedIndex] ?? projects[0];

  const handleSelect = useCallback((idx: number) => {
    soundFX.playTabSwitch();
    setSelectedIndex(idx);
  }, []);

  const handlePrev = useCallback(() => {
    soundFX.playTabSwitch();
    setSelectedIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
  }, [projects.length]);

  const handleNext = useCallback(() => {
    soundFX.playTabSwitch();
    setSelectedIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
  }, [projects.length]);

  // Keyboard navigation across projects with Arrow keys & 1-5 numbers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModalProject) return; // let modal handle Esc
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (["1", "2", "3", "4", "5"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (projects[idx]) {
          e.preventDefault();
          handleSelect(idx);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalProject, handleNext, handlePrev, handleSelect, projects]);

  const openModal = (project: WorkProject, trigger?: HTMLElement | null) => {
    soundFX.playModalOpen();
    if (trigger) lastTriggerRef.current = trigger;
    setActiveModalProject(project);
  };

  const closeModal = () => {
    soundFX.playModalClose();
    setActiveModalProject(null);
    lastTriggerRef.current?.focus();
  };

  useEffect(() => {
    const onModalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && activeModalProject) {
        closeModal();
      }
    };

    if (activeModalProject) {
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
  }, [activeModalProject, onModalChange]);

  useOutsideClick(modalRef, () => {
    if (activeModalProject) {
      closeModal();
    }
  });

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-4 select-none">
      {/* ------------------------------------------------------------------ */}
      {/* TOP INTERACTIVE INDEX RAIL                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-1.5 scrollbar-none">
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-black/[0.03] border border-black/8 w-full sm:w-auto">
          {projects.map((proj, idx) => {
            const isCurrent = idx === selectedIndex;
            return (
              <button
                key={proj.id}
                type="button"
                onClick={() => handleSelect(idx)}
                onMouseEnter={() => soundFX.playHoverTick()}
                aria-label={`Select project ${proj.numeral} ${proj.title}`}
                className={`relative px-2.5 sm:px-3.5 py-1.5 rounded-full font-excon text-xs sm:text-sm font-bold tracking-tight transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isCurrent ? "text-white" : "text-neutral-500 hover:text-black hover:bg-black/[0.04]"
                }`}
              >
                {isCurrent && (
                  <motion.div
                    layoutId="activeProjectPill"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-neutral-900 rounded-full shadow-sm"
                  />
                )}
                <span className="relative z-10 font-mono text-[0.65rem] sm:text-[0.72rem] opacity-75">
                  {proj.numeral}
                </span>
                <span className="relative z-10 truncate max-w-[90px] sm:max-w-none">
                  {proj.title}
                </span>
                <span
                  className={`relative z-10 h-1.5 w-1.5 rounded-full ${
                    proj.status.includes("Completed") ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Quick Stepper Controls */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            onMouseEnter={() => soundFX.playHoverTick()}
            aria-label="Previous project"
            className="h-8 w-8 rounded-full border border-black/10 bg-white hover:bg-neutral-100 flex items-center justify-center font-mono text-xs transition-all active:scale-95 cursor-pointer"
          >
            ←
          </button>
          <span className="font-mono text-xs text-neutral-400 px-1">
            {selectedProject.numeral} / 05
          </span>
          <button
            type="button"
            onClick={handleNext}
            onMouseEnter={() => soundFX.playHoverTick()}
            aria-label="Next project"
            className="h-8 w-8 rounded-full border border-black/10 bg-white hover:bg-neutral-100 flex items-center justify-center font-mono text-xs transition-all active:scale-95 cursor-pointer"
          >
            →
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN CINEMATIC STAGE: SPLIT EDITORIAL & DEVICE SHOWCASE            */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedProject.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative w-full rounded-[22px] sm:rounded-[26px] border border-black/10 bg-white p-4 sm:p-6 lg:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-center"
        >
          {/* Left Column (7 cols): Editorial Typography & Architecture */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3.5 sm:space-y-4">
            <div>
              {/* Category Breadcrumb & Status */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-mono text-[0.65rem] sm:text-[0.72rem] font-semibold uppercase tracking-wider text-neutral-400">
                  {`${selectedProject.numeral} // ${selectedProject.category}`}
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-mono text-[0.62rem] sm:text-[0.68rem] font-medium px-2.5 py-0.5 rounded-full border ${
                    selectedProject.status.includes("Completed")
                      ? "border-emerald-500/20 bg-emerald-50 text-emerald-800"
                      : "border-amber-500/20 bg-amber-50 text-amber-800"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      selectedProject.status.includes("Completed") ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  {selectedProject.status}
                </span>
              </div>

              {/* Title & Tagline */}
              <h3 className="font-excon text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink">
                {selectedProject.title}
              </h3>
              <p className="mt-1 font-inter text-xs sm:text-sm font-medium text-neutral-600 leading-snug">
                {selectedProject.tagline}
              </p>
            </div>

            {/* Standout Metric / Maker's Mark Highlight */}
            {selectedProject.isSpecialSignature ? (
              <div className="rounded-2xl border-2 border-dashed border-neutral-900/15 bg-neutral-50/90 p-3.5 sm:p-4 relative">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-[0.65rem] uppercase font-bold tracking-widest text-neutral-400">
                    Artisan Signature
                  </span>
                  <span className="rounded-full border border-neutral-900 bg-neutral-900 text-white px-2.5 py-0.5 font-mono text-[0.68rem] font-bold tracking-wider flex items-center gap-1 shadow-xs">
                    <span className="text-amber-400">✦</span> 100% Tharun
                  </span>
                </div>
                <p className="font-excon font-bold text-sm text-neutral-900">
                  {selectedProject.metricLabel}
                </p>
                <p className="font-inter text-xs text-neutral-600 mt-0.5 leading-relaxed">
                  {selectedProject.metricDetail}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-black/8 bg-neutral-50/90 p-3.5 sm:p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-[0.65rem] uppercase font-bold tracking-widest text-neutral-400">
                    Standout Metric
                  </span>
                  <span className="font-excon font-bold text-base sm:text-lg text-emerald-800">
                    {selectedProject.metrics}
                  </span>
                </div>
                <p className="font-inter font-semibold text-xs text-neutral-900">
                  {selectedProject.metricLabel}
                </p>
                <p className="font-inter text-xs text-neutral-600 mt-0.5 leading-relaxed">
                  {selectedProject.metricDetail}
                </p>
              </div>
            )}

            {/* Short Technical Description */}
            <p className="font-inter text-xs sm:text-[0.84rem] text-neutral-600 leading-relaxed line-clamp-2 sm:line-clamp-3">
              {selectedProject.description}
            </p>

            {/* Tech Stack Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedProject.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-black/8 bg-neutral-100/70 px-2.5 py-0.5 font-inter text-[0.66rem] sm:text-[0.7rem] font-medium text-neutral-700"
                >
                  {tag}
                </span>
              ))}
              {selectedProject.tags.length > 4 && (
                <span className="rounded-full border border-black/8 bg-neutral-50 px-2 py-0.5 font-mono text-[0.66rem] font-medium text-neutral-500">
                  +{selectedProject.tags.length - 4} more
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={(e) => openModal(selectedProject, e.currentTarget)}
                onMouseEnter={() => soundFX.playHoverTick()}
                className="rounded-full bg-black hover:bg-neutral-800 text-white px-4 py-2 sm:px-5 sm:py-2.5 font-inter text-xs sm:text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>Inspect Architecture</span>
                <span className="font-mono text-xs">↗</span>
              </button>

              {selectedProject.ctaLink && selectedProject.ctaLink !== "#" && (
                <a
                  href={selectedProject.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-black/15 bg-white hover:bg-neutral-50 text-neutral-800 px-3.5 py-2 sm:px-4 sm:py-2.5 font-inter text-xs sm:text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5"
                >
                  <span>{selectedProject.ctaText}</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): The Device Showcase / Image Canvas */}
          <div
            onClick={(e) => openModal(selectedProject, e.currentTarget)}
            className="lg:col-span-5 w-full cursor-pointer transition-transform duration-300 hover:scale-[1.015]"
            title={`Click to inspect ${selectedProject.title}`}
          >
            <ProjectImageCanvas key={selectedProject.slug} project={selectedProject} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ------------------------------------------------------------------ */}
      {/* EXPANDED TECHNICAL CASE STUDY MODAL                                */}
      {/* ------------------------------------------------------------------ */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {activeModalProject && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
                {/* Backdrop */}
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
                  ref={modalRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="works-modal-title"
                  initial={{ opacity: 0, scale: 0.96, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 8 }}
                  transition={{
                    duration: 0.22,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative w-full max-w-[660px] max-h-[88vh] flex flex-col bg-white rounded-[24px] sm:rounded-[28px] border border-black/10 shadow-[0_24px_64px_rgba(0,0,0,0.14)] overflow-hidden z-10"
                >
                  {/* Close Button with ESC hint */}
                  <button
                    className="group absolute top-3.5 sm:top-4 right-3.5 sm:right-4 z-30 flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-black/80 text-white backdrop-blur-md hover:bg-black transition-all hover:scale-105 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
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

                  {/* Hero Showcase Image in Modal */}
                  <div className="relative h-44 sm:h-56 w-full shrink-0 overflow-hidden bg-neutral-950">
                    <ProjectImageCanvas key={activeModalProject.slug} project={activeModalProject} />
                  </div>

                  {/* Modal Body */}
                  <div className="flex flex-col flex-1 overflow-y-auto p-5 sm:p-7 md:p-8 space-y-5">
                    {/* Header: Title, Category & Direct CTA */}
                    <div className="flex items-start justify-between gap-3 pb-4 border-b border-black/6">
                      <div className="min-w-0">
                        <span className="font-mono text-[0.68rem] sm:text-xs font-semibold uppercase tracking-wider text-neutral-400">
                          {`${activeModalProject.numeral} // ${activeModalProject.category}`}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <h3 id="works-modal-title" className="font-excon text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                            {activeModalProject.title}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 font-mono text-[0.65rem] sm:text-[0.7rem] font-medium border ${
                              activeModalProject.status.includes("Completed")
                                ? "border-emerald-500/20 bg-emerald-50 text-emerald-800"
                                : "border-amber-500/20 bg-amber-50 text-amber-800"
                            }`}
                          >
                            {activeModalProject.status}
                          </span>
                        </div>
                        <p className="mt-1 font-inter text-xs sm:text-sm font-medium text-neutral-600 leading-snug">
                          {activeModalProject.tagline}
                        </p>
                      </div>

                      {activeModalProject.ctaLink && activeModalProject.ctaLink !== "#" ? (
                        <a
                          href={activeModalProject.ctaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-full bg-black px-4 py-2 sm:px-4.5 sm:py-2.5 font-inter text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                        >
                          {activeModalProject.ctaText}
                        </a>
                      ) : (
                        <span className="shrink-0 rounded-full bg-neutral-100 border border-black/10 px-3.5 py-2 font-inter text-xs font-semibold text-neutral-600">
                          {activeModalProject.ctaText}
                        </span>
                      )}
                    </div>

                    {/* Standout Metric / Maker's Mark Box */}
                    {activeModalProject.isSpecialSignature ? (
                      <div className="rounded-2xl border-2 border-dashed border-neutral-900/15 bg-neutral-50/90 p-4 sm:p-5 relative">
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <span className="font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-400">
                            Creator Signature
                          </span>
                          <span className="rounded-full border border-black bg-black text-white px-2.5 py-0.5 font-mono text-[0.68rem] font-bold tracking-wider flex items-center gap-1 shadow-sm">
                            <span className="text-amber-400">✦</span> 100% Tharun
                          </span>
                        </div>
                        <p className="font-excon font-bold text-sm sm:text-base text-neutral-900">
                          {activeModalProject.metricLabel}
                        </p>
                        <p className="mt-1 font-inter text-xs text-neutral-600 leading-relaxed">
                          {activeModalProject.metricDetail}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-black/8 bg-neutral-50/90 p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-400">
                            Standout Metric
                          </span>
                          <span className="font-excon font-bold text-base sm:text-lg text-emerald-700">
                            {activeModalProject.metrics}
                          </span>
                        </div>
                        <p className="font-inter font-semibold text-xs sm:text-sm text-neutral-900">
                          {activeModalProject.metricLabel}
                        </p>
                        <p className="mt-1 font-inter text-xs text-neutral-600 leading-relaxed">
                          {activeModalProject.metricDetail}
                        </p>
                      </div>
                    )}

                    {/* Project Overview */}
                    <div className="space-y-1.5">
                      <span className="block font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-400">
                        Project Overview
                      </span>
                      <p className="font-inter text-xs sm:text-sm text-neutral-700 leading-relaxed">
                        {activeModalProject.overview}
                      </p>
                    </div>

                    {/* Feature Highlight Callout */}
                    <div className="rounded-2xl border border-black/8 bg-white p-4 sm:p-5 shadow-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-ink" />
                        <span className="font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-500">
                          Feature Highlight
                        </span>
                      </div>
                      <h4 className="font-excon font-bold text-sm sm:text-base text-ink">
                        {activeModalProject.featureHeading}
                      </h4>
                      <p className="font-inter text-xs sm:text-sm text-neutral-600 leading-relaxed">
                        {activeModalProject.featureDescription}
                      </p>
                    </div>

                    {/* Tech Stack Pills */}
                    <div className="space-y-2 pt-2 border-t border-black/6">
                      <span className="block font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-400">
                        Technology Stack
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeModalProject.tags.map((tag) => (
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
                    {activeModalProject.resources && activeModalProject.resources.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-black/6">
                        <span className="block font-mono text-[0.68rem] uppercase font-bold tracking-widest text-neutral-400">
                          Links & Documentation
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {activeModalProject.resources.map((res) => (
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
    </div>
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
