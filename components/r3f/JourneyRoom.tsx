"use client";

import { useMemo } from "react";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";

const FONT = "/fonts/Excon-Bold.ttf";
const BODY = "/fonts/Excon-Regular.ttf";
const INK = "#0f0f0f";

/**
 * Inside the first chapter. Architecture rather than props: a floor plane,
 * a back wall, and the chapter's own timeline drawn as a curve receding into
 * the room — the path you will later travel along.
 */
export default function JourneyRoom({ accent }: { accent: string }) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.6, -2.1, 2.5),
        new THREE.Vector3(-0.4, -2.0, 0.5),
        new THREE.Vector3(0.8, -1.9, -1.6),
        new THREE.Vector3(1.7, -1.85, -3.8),
      ]),
    []
  );
  const pts = useMemo(
    () => curve.getPoints(160).map((p) => [p.x, p.y, p.z] as [number, number, number]),
    [curve]
  );
  const nodes = useMemo(() => [0, 0.34, 0.67, 1].map((t) => curve.getPoint(t)), [curve]);

  return (
    <group>
      {/* Room shell */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <meshStandardMaterial color="#0a0a0d" roughness={1} />
      </mesh>
      <mesh position={[0, 1.6, -6]}>
        <planeGeometry args={[26, 14]} />
        <meshStandardMaterial color="#08080c" roughness={1} />
      </mesh>

      {/* Chapter identity. Sizes are tuned to the 5-unit doorway: the title
          must not overflow the opening it is read through. */}
      <Text
        font={FONT}
        fontSize={0.4}
        color={INK}
        anchorX="left"
        anchorY="middle"
        position={[-1.95, 1.62, -2.4]}
        letterSpacing={0.1}
        material-toneMapped={false}
      >
        PRE-GRADUATE
      </Text>
      <Text
        font={BODY}
        fontSize={0.92}
        color={INK}
        anchorX="left"
        anchorY="middle"
        position={[-1.95, 0.82, -2.4]}
        material-toneMapped={false}
      >
        89%
      </Text>
      <Text
        font={BODY}
        fontSize={0.19}
        color={INK}
        fillOpacity={0.72}
        anchorX="left"
        anchorY="top"
        position={[-1.95, 0.2, -2.4]}
        maxWidth={3.7}
        lineHeight={1.6}
        material-toneMapped={false}
      >
        A.M.Jain School — where curiosity first became a habit.
      </Text>

      {/* The oversized chapter numeral, set into the back wall */}
      <Text
        font={FONT}
        fontSize={4.6}
        color={accent}
        fillOpacity={0.09}
        anchorX="center"
        anchorY="middle"
        position={[1.5, 0.2, -5.4]}
        material-toneMapped={false}
      >
        01
      </Text>

      {/* The path through the chapter */}
      <Line points={pts} color={accent} lineWidth={1.6} transparent opacity={0.85} />
      {nodes.map((n, i) => (
        <mesh key={i} position={[n.x, n.y, n.z]}>
          <sphereGeometry args={[i === 0 ? 0.1 : 0.06, 16, 16]} />
          <meshBasicMaterial color={i === 0 ? INK : accent} />
        </mesh>
      ))}
    </group>
  );
}
