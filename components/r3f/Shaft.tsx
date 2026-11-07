"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

const INK = "#0f0f0f";

/** One floor-level rib. Repeated down the shaft, these are what make the
 *  descent legible — an empty shaft reads as a static void. */
function Rib({ y, size }: { y: number; size: number }) {
  const pts = useMemo<[number, number, number][]>(() => {
    const h = size / 2;
    return [
      [-h, y, -h],
      [h, y, -h],
      [h, y, h],
      [-h, y, h],
      [-h, y, -h],
    ];
  }, [size, y]);

  return <Line points={pts} color={INK} transparent opacity={0.16} lineWidth={1} />;
}

/**
 * The vault itself, built from primitives and light rather than models:
 * a square shaft descending into darkness, ribbed at floor intervals, with
 * a single shaft of light from the opening far above.
 */
export default function Shaft({ depth = 64, size = 14 }: { depth?: number; size?: number }) {
  const dust = useRef<THREE.Points>(null);

  const ribs = useMemo(() => {
    const out: number[] = [];
    for (let y = 2; y > -depth; y -= 4) out.push(y);
    return out;
  }, [depth]);

  // Suspended dust — catches the light and gives the void a sense of volume.
  // Built once in an effect-free ref rather than during render: Math.random
  // is impure and must not run in the render path.
  const dustGeo = useMemo(() => {
    const n = 700;
    const pos = new Float32Array(n * 3);
    // Deterministic scatter — a cheap hash keeps render pure and the layout
    // identical between server and client.
    const rand = (i: number) => {
      const x = Math.sin(i * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (rand(i * 3) - 0.5) * size * 0.95;
      pos[i * 3 + 1] = rand(i * 3 + 1) * -depth;
      pos[i * 3 + 2] = (rand(i * 3 + 2) - 0.5) * size * 0.95;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [depth, size]);

  useFrame((_, delta) => {
    if (dust.current) dust.current.rotation.y += delta * 0.012;
  });

  const wall = (rot: number) => (
    <mesh position={[0, -depth / 2 + 2, 0]} rotation={[0, rot, 0]}>
      <planeGeometry args={[size, depth + 8]} />
      <meshStandardMaterial
        color="#07070a"
        roughness={1}
        metalness={0}
        side={THREE.DoubleSide}
        transparent
        opacity={0.96}
      />
    </mesh>
  );

  return (
    <group>
      {/* Four walls, positioned by rotating a plane about the shaft centre */}
      <group>
        <group position={[0, 0, -size / 2]}>{wall(0)}</group>
        <group position={[0, 0, size / 2]}>{wall(Math.PI)}</group>
        <group position={[-size / 2, 0, 0]}>{wall(Math.PI / 2)}</group>
        <group position={[size / 2, 0, 0]}>{wall(-Math.PI / 2)}</group>
      </group>

      {ribs.map((y) => (
        <Rib key={y} y={y} size={size} />
      ))}

      <points ref={dust} geometry={dustGeo}>
        <pointsMaterial
          size={0.045}
          color={INK}
          transparent
          opacity={0.5}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* The opening far above, and the light falling through it */}
      <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size * 0.5, size * 0.5]} />
        <meshBasicMaterial color={INK} transparent opacity={0.05} />
      </mesh>
      <spotLight
        position={[0, 14, 0]}
        target-position={[0, -depth, 0]}
        angle={0.5}
        penumbra={1}
        intensity={340}
        distance={depth + 40}
        color={INK}
      />
    </group>
  );
}
