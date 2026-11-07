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
  title: string;
  category: string;
  description: string;
  src: string;
  ctaText: string;
  ctaLink: string;
  tags: string[];
  metrics?: string;
  content: () => React.ReactNode;
};

const DEFAULT_PROJECTS: WorkProject[] = [
  {
    title: "Nova Financial Engine",
    category: "Full Stack / FinTech Analytics",
    description: "High-throughput analytics platform processing real-time market data.",
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    ctaText: "View Live ↗",
    ctaLink: "https://github.com",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "FastAPI"],
    metrics: "400k+ events/sec · <12ms p99 latency",
    content: () => (
      <div className="space-y-4 font-inter text-neutral-600 leading-relaxed text-sm">
        <p>
          Designed and engineered an end-to-end financial telemetry platform that aggregates, normalizes,
          and visualizes multi-exchange market transactions in real time.
        </p>
        <div className="rounded-xl border border-black/8 bg-neutral-50/80 p-3.5">
          <span className="block text-[0.7rem] uppercase font-semibold tracking-wider text-neutral-400 mb-1">
            Architecture Highlights
          </span>
          <p className="text-xs text-neutral-700">
            Stream processing architecture built with WebSockets, edge caching, and optimistic UI updates,
            ensuring instant data delivery without layout thrashing.
          </p>
        </div>
        <p>
          Implemented comprehensive risk analysis dashboards with customizable metric filters, interactive time-series
          charts, and automated anomaly detection alerts.
        </p>
      </div>
    ),
  },
  {
    title: "Kroma Design System",
    category: "Frontend Architecture & UI",
    description: "Accessible, multi-brand component library and tokens system.",
    src: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop",
    ctaText: "Documentation ↗",
    ctaLink: "https://github.com",
    tags: ["React 19", "Tailwind CSS v4", "Radix UI", "Figma Tokens"],
    metrics: "45+ primitives · 100% WCAG AAA",
    content: () => (
      <div className="space-y-4 font-inter text-neutral-600 leading-relaxed text-sm">
        <p>
          Architected a unified design system supporting dark/light theme switching, variable typography tokens,
          and robust accessible primitives for enterprise web applications.
        </p>
        <div className="rounded-xl border border-black/8 bg-neutral-50/80 p-3.5">
          <span className="block text-[0.7rem] uppercase font-semibold tracking-wider text-neutral-400 mb-1">
            Developer Experience
          </span>
          <p className="text-xs text-neutral-700">
            Published automated npm release pipeline with automated semantic versioning, zero-runtime CSS bundle extraction,
            and interactive documentation with live code playground.
          </p>
        </div>
        <p>
          Reduced frontend technical debt across 6 product teams, lowering bug reports related to accessibility
          and theme inconsistencies by 84%.
        </p>
      </div>
    ),
  },
  {
    title: "Pulse Cloud Observability",
    category: "System Design & DevOps",
    description: "Distributed tracing and telemetry platform for microservices.",
    src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    ctaText: "Explore Repo ↗",
    ctaLink: "https://github.com",
    tags: ["Go", "Docker", "ClickHouse", "gRPC", "Prometheus"],
    metrics: "99.99% Uptime · 10TB+ daily logs",
    content: () => (
      <div className="space-y-4 font-inter text-neutral-600 leading-relaxed text-sm">
        <p>
          Constructed a lightweight distributed tracing aggregator designed to monitor containerized service meshes,
          correlating network traces, memory footprints, and HTTP anomalies in a centralized timeline.
        </p>
        <div className="rounded-xl border border-black/8 bg-neutral-50/80 p-3.5">
          <span className="block text-[0.7rem] uppercase font-semibold tracking-wider text-neutral-400 mb-1">
            Performance & Storage
          </span>
          <p className="text-xs text-neutral-700">
            Leveraged columnar storage with ClickHouse and adaptive sampling strategies to compress log indices by 60%,
            slashing storage overhead while maintaining sub-second query latency.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Nexus Operations Suite",
    category: "Enterprise Workflow Platform",
    description: "Collaborative pipeline management and automated task delegation.",
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    ctaText: "View Case Study ↗",
    ctaLink: "https://github.com",
    tags: ["Next.js", "Zustand", "Node.js", "Redis", "WebSockets"],
    metrics: "12k+ active tasks · 0.2s sync",
    content: () => (
      <div className="space-y-4 font-inter text-neutral-600 leading-relaxed text-sm">
        <p>
          Full-stack operational workflow suite providing Kanban, Gantt, and timeline views with collaborative
          real-time presence, multi-user cursor sync, and conflict-free replicated data types (CRDTs).
        </p>
        <div className="rounded-xl border border-black/8 bg-neutral-50/80 p-3.5">
          <span className="block text-[0.7rem] uppercase font-semibold tracking-wider text-neutral-400 mb-1">
            Realtime Collaboration
          </span>
          <p className="text-xs text-neutral-700">
            WebSocket sync layer with Redis pub/sub backplane guarantees sub-100ms state synchronization across distributed
            clients with offline-first local state persistence.
          </p>
        </div>
      </div>
    ),
  },
];

export function WorksExpandable({
  projects = DEFAULT_PROJECTS,
  onModalChange,
}: {
  projects?: WorkProject[];
  onModalChange?: (isOpen: boolean) => void;
}) {
  const [active, setActive] = useState<WorkProject | null>(null);
  const mounted = useIsMounted();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        soundFX.playModalClose();
        setActive(null);
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
      soundFX.playModalClose();
      setActive(null);
    }
  });

  return (
    <>
      {/* Silky Case Study Dialog - Portaled to document.body to cover ENTIRE viewport */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {active && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
                {/* Translucent White Frosted Backdrop across the ENTIRE viewport */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="fixed inset-0 bg-white/80 backdrop-blur-md"
                  onClick={() => {
                    soundFX.playModalClose();
                    setActive(null);
                  }}
                />

                {/* Modal Container */}
                <motion.div
                  ref={ref}
                  initial={{ opacity: 0, scale: 0.96, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 8 }}
                  transition={{
                    duration: 0.22,
                    ease: [0.16, 1, 0.3, 1], // Apple fluid easing
                  }}
                  className="relative w-full max-w-[580px] max-h-[85vh] sm:max-h-[88vh] flex flex-col bg-white rounded-[22px] sm:rounded-[28px] border border-black/10 shadow-[0_24px_64px_rgba(0,0,0,0.12)] overflow-hidden z-10"
                >
                  {/* Close Button with ESC hint */}
                  <button
                    className="group absolute top-3 sm:top-4 right-3 sm:right-4 z-20 flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-black/75 text-white backdrop-blur-md hover:bg-black transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    onClick={() => {
                      soundFX.playModalClose();
                      setActive(null);
                    }}
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
                  <div className="relative h-44 sm:h-60 w-full shrink-0 overflow-hidden bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={active.src}
                      alt={active.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>

                  {/* Modal Body */}
                  <div className="flex flex-col flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div>
                        <span className="font-inter text-[0.68rem] sm:text-xs font-semibold uppercase tracking-wider text-neutral-400">
                          {active.category}
                        </span>
                        <h3 className="mt-1 font-excon text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-ink">
                          {active.title}
                        </h3>
                        <p className="mt-1 font-inter text-xs sm:text-sm text-neutral-500 leading-snug">
                          {active.description}
                        </p>
                      </div>

                      {active.ctaLink && (
                        <a
                          href={active.ctaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-full bg-black px-3.5 py-2 sm:px-4 sm:py-2.5 font-inter text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:scale-105 active:scale-95"
                        >
                          {active.ctaText}
                        </a>
                      )}
                    </div>

                    {/* Tags row */}
                    <div className="mt-3.5 sm:mt-4 flex flex-wrap gap-1.5 border-t border-black/6 pt-3.5 sm:pt-4">
                      {active.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-black/8 bg-neutral-50 px-2 sm:px-2.5 py-0.5 font-inter text-[0.68rem] sm:text-[0.72rem] font-medium text-neutral-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {active.metrics && (
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-50 px-2 sm:px-2.5 py-0.5 font-mono text-[0.68rem] sm:text-[0.72rem] font-semibold text-emerald-700 ml-auto">
                          {active.metrics}
                        </span>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="mt-4 sm:mt-5 border-t border-black/6 pt-4 sm:pt-5">
                      {active.content()}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Grid of Work Cards */}
      <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-h-[66vh] sm:max-h-none overflow-y-auto sm:overflow-visible pr-0.5 sm:pr-0">
        {projects.map((card) => (
          <motion.div
            key={card.title}
            onClick={() => {
              soundFX.playModalOpen();
              setActive(card);
            }}
            onMouseEnter={() => soundFX.playHoverTick()}
            whileHover={{ y: -5, scale: 1.008 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="group relative flex flex-col justify-between rounded-[18px] sm:rounded-[22px] border border-black/8 bg-white p-3.5 sm:p-5 md:p-6 shadow-[0_6px_20px_rgba(0,0,0,0.025)] hover:border-black/20 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] cursor-pointer"
          >
            <div>
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <span className="font-inter text-[0.65rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-neutral-400">
                  {card.category}
                </span>
                <span className="font-mono text-xs text-neutral-400 group-hover:text-black transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 inline-block">
                  ↗
                </span>
              </div>

              <div className="mt-2.5 sm:mt-3 flex gap-3 sm:gap-4 items-center">
                <div className="h-12 w-12 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-lg sm:rounded-xl bg-neutral-100 border border-black/6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.src}
                    alt={card.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-excon font-bold text-base sm:text-lg md:text-xl text-ink tracking-tight truncate group-hover:text-neutral-900 transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-0.5 font-inter text-xs text-neutral-500 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3.5 border-t border-black/6 flex items-center justify-between">
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                {card.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/6 bg-neutral-50 px-2 py-0.5 font-inter text-[0.65rem] sm:text-[0.68rem] font-medium text-neutral-600 transition-colors duration-150 group-hover:border-black/15 group-hover:bg-neutral-100/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <span className="shrink-0 rounded-full border border-black/10 bg-neutral-100 group-hover:bg-black group-hover:text-white px-2.5 sm:px-3 py-0.5 sm:py-1 font-inter text-[0.68rem] sm:text-xs font-semibold text-neutral-800 transition-all duration-200 group-hover:scale-105 active:scale-95">
                Inspect
              </span>
            </div>
          </motion.div>
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
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  );
};
