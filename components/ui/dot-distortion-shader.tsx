"use client";

import React, { useEffect, useRef } from "react";

export interface DotDistortionShaderProps {
  dotGap?: number;
  dotSize?: number;
  mouseRadius?: number;
  distortionStrength?: number;
  returnSpeed?: number;
  friction?: number;
  dotColor?: string;
  dotColorRgb?: [number, number, number];
  className?: string;
}

interface Dot {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseAlpha: number;
  pulseSpeed: number;
  offset: number;
  scale: number;
}

/**
 * DotDistortionShader — Interactive physics-based canvas dot matrix shader.
 * Renders an architectural grid of dots that dynamically warp, disperse,
 * and spring back when the cursor or touch moves across them, with ambient
 * breathing and twinkling.
 */
export function DotDistortionShader({
  dotGap = 28,
  dotSize = 1.4,
  mouseRadius = 140,
  distortionStrength = 22,
  returnSpeed = 0.08,
  friction = 0.84,
  dotColorRgb = [0, 0, 0],
  className = "",
}: DotDistortionShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    let dots: Dot[] = [];
    const mouse = {
      x: -2000,
      y: -2000,
      targetX: -2000,
      targetY: -2000,
      active: false,
    };

    const initGrid = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      dots = [];
      const cols = Math.ceil(width / dotGap);
      const rows = Math.ceil(height / dotGap);
      const startX = (width - (cols - 1) * dotGap) / 2;
      const startY = (height - (rows - 1) * dotGap) / 2;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const ox = startX + c * dotGap;
          const oy = startY + r * dotGap;
          dots.push({
            ox,
            oy,
            x: ox,
            y: oy,
            vx: 0,
            vy: 0,
            baseAlpha: Math.random() * 0.12 + 0.08,
            pulseSpeed: Math.random() * 0.03 + 0.015,
            offset: Math.random() * Math.PI * 2,
            scale: 1,
          });
        }
      }
    };

    initGrid();

    let resizeTimer: NodeJS.Timeout | null = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initGrid();
      }, 150);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    };

    const handlePointerLeave = () => {
      mouse.targetX = -2000;
      mouse.targetY = -2000;
      mouse.active = false;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    let time = 0;
    const [r, g, b] = dotColorRgb;

    const render = () => {
      time += 0.02;

      // Mouse smoothing (lerp)
      mouse.x += (mouse.targetX - mouse.x) * 0.16;
      mouse.y += (mouse.targetY - mouse.y) * 0.16;

      ctx.clearRect(0, 0, width, height);

      const mRadiusSq = mouseRadius * mouseRadius;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        // Vector from cursor to dot
        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const distSq = dx * dx + dy * dy;

        // Push away from cursor if within interaction radius
        if (distSq < mRadiusSq && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / mouseRadius) * distortionStrength;
          const angle = Math.atan2(dy, dx);
          dot.vx += Math.cos(angle) * force * 0.6;
          dot.vy += Math.sin(angle) * force * 0.6;
          dot.scale = 1 + (1 - dist / mouseRadius) * 0.75;
        } else {
          dot.scale += (1 - dot.scale) * 0.08;
        }

        // Spring force returning to anchor position
        const fx = (dot.ox - dot.x) * returnSpeed;
        const fy = (dot.oy - dot.y) * returnSpeed;

        dot.vx += fx;
        dot.vy += fy;

        // Friction dampening
        dot.vx *= friction;
        dot.vy *= friction;

        // Update position
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Ambient breathing and twinkling wave calculation
        const wave = Math.sin(time * 0.8 + dot.ox * 0.005 + dot.oy * 0.005);
        const twinkle = Math.sin(time * 1.5 + dot.offset) * 0.05;
        const alpha = Math.max(
          0.04,
          Math.min(0.42, dot.baseAlpha + wave * 0.04 + twinkle + (dot.scale - 1) * 0.25)
        );

        // Draw refined architectural dot
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotSize * dot.scale, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      if (resizeTimer) clearTimeout(resizeTimer);
      cancelAnimationFrame(animId);
    };
  }, [dotGap, dotSize, mouseRadius, distortionStrength, returnSpeed, friction, dotColorRgb]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 block h-full w-full select-none ${className}`}
      aria-hidden="true"
    />
  );
}

export default DotDistortionShader;
