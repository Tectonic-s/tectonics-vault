"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, Preload, ScrollControls } from "@react-three/drei";
import { useVault } from "@/lib/vaultStore";
import VaultScene from "./VaultScene";

/** Film grain, blended over the render rather than drawn into it. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E\")";

export default function VaultCanvas() {
  const activeRoom = useVault((s) => s.activeRoom);
  const setActiveRoom = useVault((s) => s.setActiveRoom);
  const opened = useVault((s) => s.opened);

  return (
    <div className="relative h-[100dvh] w-full bg-[#f5f5f5]">
      <Canvas
        shadows
        dpr={[1, 2]}
        // Keeps the drawing buffer readable after paint. Small cost, and it
        // is what makes the scene capturable for screenshots/QA.
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        onCreated={(st)=>{(window as unknown as {__dbg?:unknown}).__dbg=st;}}
        camera={{ position: [0, 3, 8], fov: 46 }}
        style={{
          position: "absolute",
          inset: "1rem",
          width: "calc(100% - 2rem)",
          height: "calc(100% - 2rem)",
          backgroundColor: "#f5f5f5",
          backgroundImage: GRAIN,
          backgroundBlendMode: "soft-light",
          backgroundRepeat: "repeat",
          backgroundSize: "110px",
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.22} />
          <ScrollControls pages={5} damping={0.35} maxSpeed={0.9}>
            <VaultScene />
          </ScrollControls>
          <Preload all />
        </Suspense>
        <AdaptiveDpr pixelated />
      </Canvas>

      {/* Thin architectural frame */}
      <div className="pointer-events-none absolute inset-4 border border-black/15" />

      {/* Scroll affordance — appears only once the vault has opened */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center transition-opacity duration-700"
        style={{ opacity: opened && !activeRoom ? 1 : 0 }}
      >
        <span
          className="font-inter text-black/60"
          style={{ fontSize: "0.7rem", letterSpacing: "0.24em" }}
        >
          SCROLL TO DESCEND
        </span>
      </div>

      {/* Leave the room */}
      {activeRoom && (
        <button
          onClick={() => setActiveRoom(null)}
          className="absolute right-8 top-8 rounded-full border border-black/25 px-4 py-2 font-inter text-black/80 transition-colors hover:bg-black hover:text-white"
          style={{ fontSize: "0.7rem", letterSpacing: "0.18em" }}
        >
          CLOSE · ESC
        </button>
      )}
    </div>
  );
}
