"use client";

import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useVault } from "@/lib/vaultStore";
import Shaft from "./Shaft";
import Hero3D from "./Hero3D";
import PortalRoom from "./PortalRoom";
import JourneyRoom from "./JourneyRoom";
import ChapterRoom from "./ChapterRoom";

/* ------------------------------------------------------------------ *
 * The vault is a shaft with doorways set into it at depth. Descending
 * carries you PAST each room rather than to a single destination, so the
 * fall is never empty. Camera waypoints are derived from the door depths.
 * ------------------------------------------------------------------ */
const SHAFT_DEPTH = 68;
const DOOR_Z = -6.6;
const DOOR = { w: 5, h: 6.4 };
const CAM_Z = 4.8; // constant standoff, so every door frames identically

const DOORS = [
  { id: "about", numeral: "01", title: "About", accent: "#0f0f0f", y: -6 },
  { id: "journey", numeral: "02", title: "Journey", accent: "#c9965c", y: -20 },
  { id: "craft", numeral: "03", title: "Skills", accent: "#d4af5f", y: -34 },
  { id: "works", numeral: "04", title: "Works", accent: "#d6eaec", y: -48 },
];

const START_Y = 3;
const END_Y = DOORS[DOORS.length - 1].y;

const COPY: Record<string, { metric?: string; body: string }> = {
  about: {
    body: "I build products where thoughtful design meets reliable engineering — intuitive, purposeful, and made with attention to detail.",
  },
  craft: {
    metric: "16",
    body: "Everything collected along the way, kept in the order it was earned.",
  },
  works: {
    body: "The proof: what the craft was actually used to build.",
  },
};

export default function VaultScene() {
  const data = useScroll();
  const setProgress = useVault((s) => s.setProgress);
  const activeRoom = useVault((s) => s.activeRoom);
  const opened = useVault((s) => s.opened);

  // `state.camera` is read inside the frame loop rather than destructured from
  // useThree at render: the camera is scene state we drive imperatively, not a
  // render value, and mutating a hook result during render is disallowed.
  useFrame((state, delta) => {
    if (!data) return;
    // Guard the offset: before the scroll container has been measured it can
    // divide by zero, and a NaN here silently poisons every value derived
    // from it (opacities render as black, positions as none).
    setProgress(Number.isFinite(data.offset) ? data.offset : 0);

    // Scroll is inert until the vault has opened, and hands off inside a room.
    if (!opened || activeRoom) return;

    const cam = state.camera;
    const fall = data.range(0.08, 0.84);
    const settle = data.range(0.9, 0.1);

    cam.position.y = THREE.MathUtils.damp(
      cam.position.y,
      THREE.MathUtils.lerp(START_Y, END_Y, fall),
      4.5,
      delta
    );
    cam.position.z = THREE.MathUtils.damp(cam.position.z, CAM_Z, 4, delta);
    // A slight downward cast while falling, levelling off on arrival — enough
    // to feel like descending without losing sight of the doors ahead.
    cam.rotation.x = THREE.MathUtils.damp(
      cam.rotation.x,
      -0.07 * Math.PI * (1 - settle),
      4,
      delta
    );

    // A breath of pointer parallax, exactly as in the DOM build.
    cam.rotation.y = THREE.MathUtils.lerp(cam.rotation.y, -(state.pointer.x * Math.PI) / 110, 0.05);
  });

  return (
    <>
      <Hero3D />
      <Shaft depth={SHAFT_DEPTH} size={14} />

      {DOORS.map((d) => (
        <group key={d.id} position={[0, d.y, 0]}>
          {/* Each landing is lit from its own room, so the accent spills out */}
          <pointLight position={[0, 1.2, DOOR_Z + 3]} intensity={26} distance={16} color={d.accent} />
          <PortalRoom
            id={d.id}
            title={d.title}
            accent={d.accent}
            size={[DOOR.w, DOOR.h]}
            position={[0, 0, DOOR_Z]}
          >
            {d.id === "journey" ? (
              <JourneyRoom accent={d.accent} />
            ) : (
              <ChapterRoom
                numeral={d.numeral}
                title={d.title.toUpperCase()}
                metric={COPY[d.id]?.metric}
                body={COPY[d.id]?.body ?? ""}
                accent={d.accent}
              />
            )}
          </PortalRoom>
        </group>
      ))}

      {/* The floor of the vault, just below the last doorway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, END_Y - 5.5, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0a0a0d" roughness={1} />
      </mesh>
    </>
  );
}
