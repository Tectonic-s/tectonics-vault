"use client";

import { useEffect, useRef } from "react";
import { Edges, MeshPortalMaterial, Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import { useVault } from "@/lib/vaultStore";

const FONT = "/fonts/Excon-Bold.ttf";
const INK = "#0f0f0f";

type PortalMat = THREE.Material & { blend: number };

/**
 * A doorway in the vault wall that is a real room, not a panel: everything
 * inside `children` is rendered as a self-contained scene behind the opening.
 * Entering animates the portal's blend to 1 so the frame dissolves and the
 * visitor is inside; Escape (or the close control) reverses it.
 */
export default function PortalRoom({
  id,
  title,
  accent,
  size,
  position,
  children,
}: {
  id: string;
  title: string;
  accent: string;
  size: [number, number];
  position: [number, number, number];
  children: React.ReactNode;
}) {
  const portal = useRef<PortalMat | null>(null);
  const frame = useRef<THREE.Group>(null);
  const label = useRef<THREE.Object3D & { fillOpacity?: number }>(null);
  const { camera } = useThree();

  const activeRoom = useVault((s) => s.activeRoom);
  const setActiveRoom = useVault((s) => s.setActiveRoom);
  const isActive = activeRoom === id;

  const enter = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (activeRoom) return;
    setActiveRoom(id);
    document.body.style.cursor = "auto";
    if (portal.current) gsap.to(portal.current, { blend: 1, duration: 0.9, ease: "power2.inOut" });
    gsap.to(camera.position, { x: position[0], duration: 1.1, ease: "power2.inOut" });
  };

  const exit = () => {
    setActiveRoom(null);
    if (portal.current) gsap.to(portal.current, { blend: 0, duration: 0.9, ease: "power2.inOut" });
    gsap.to(camera.position, { x: 0, duration: 1.1, ease: "power2.inOut" });
  };

  // Reset cursor on unmount to prevent cursor sticking
  useEffect(() => {
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  // Escape leaves the room — the visitor must never be trapped inside.
  useEffect(() => {
    if (!isActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const hoverIn = () => {
    if (activeRoom) return;
    document.body.style.cursor = "pointer";
    if (frame.current) gsap.to(frame.current.scale, { x: 1.04, y: 1.04, z: 1.04, duration: 0.4 });
    if (label.current) gsap.to(label.current, { fillOpacity: 1, duration: 0.35 });
  };
  const hoverOut = () => {
    document.body.style.cursor = "auto";
    if (frame.current) gsap.to(frame.current.scale, { x: 1, y: 1, z: 1, duration: 0.4 });
    if (label.current) gsap.to(label.current, { fillOpacity: 0.25, duration: 0.35 });
  };

  return (
    <group position={position}>
      <group ref={frame}>
        <mesh onClick={enter} onPointerOver={hoverIn} onPointerOut={hoverOut}>
          <planeGeometry args={size} />
          <MeshPortalMaterial ref={portal as never} blend={0} resolution={512} blur={0}>
            <color attach="background" args={["#05050a"]} />
            <ambientLight intensity={0.7} />
            {/* Colour as literal light: the room's accent IS a lamp. */}
            <pointLight position={[0, 2.4, 3]} intensity={26} color={accent} distance={22} />
            <pointLight position={[-3, -2, 2]} intensity={10} color={accent} distance={16} />
            {children}
          </MeshPortalMaterial>
          {!isActive && <Edges color={INK} lineWidth={1.5} />}
        </mesh>

        <Text
          ref={label as never}
          font={FONT}
          fontSize={0.3}
          color={INK}
          anchorX="center"
          position={[0, -size[1] / 2 - 0.5, 0.05]}
          letterSpacing={0.14}
          fillOpacity={0.25}
        material-toneMapped={false}
      >
          {title.toUpperCase()}
        </Text>
      </group>
    </group>
  );
}
