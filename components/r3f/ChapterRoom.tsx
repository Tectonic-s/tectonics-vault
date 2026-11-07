"use client";

import { Text } from "@react-three/drei";

const FONT = "/fonts/Excon-Bold.ttf";
const BODY = "/fonts/Excon-Regular.ttf";
const INK = "#0f0f0f";

/**
 * A room behind a doorway. Deliberately built from the same shell as every
 * other room — floor, back wall, a ghost numeral — so the vault reads as one
 * building. Only the light and the contents change.
 */
export default function ChapterRoom({
  numeral,
  title,
  metric,
  body,
  accent,
}: {
  numeral: string;
  title: string;
  metric?: string;
  body: string;
  accent: string;
}) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <meshStandardMaterial color="#0a0a0d" roughness={1} />
      </mesh>
      <mesh position={[0, 1.6, -6]}>
        <planeGeometry args={[26, 14]} />
        <meshStandardMaterial color="#08080c" roughness={1} />
      </mesh>

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
        {numeral}
      </Text>

      <Text
        font={FONT}
        fontSize={0.4}
        color={INK}
        anchorX="left"
        anchorY="middle"
        position={[-1.95, 1.62, -2.4]}
        letterSpacing={0.1}
        maxWidth={4}
        material-toneMapped={false}
      >
        {title}
      </Text>

      {metric && (
        <Text
          font={BODY}
          fontSize={0.92}
          color={INK}
          anchorX="left"
          anchorY="middle"
          position={[-1.95, 0.82, -2.4]}
          material-toneMapped={false}
        >
          {metric}
        </Text>
      )}

      <Text
        font={BODY}
        fontSize={0.19}
        color={INK}
        fillOpacity={0.72}
        anchorX="left"
        anchorY="top"
        position={[-1.95, metric ? 0.2 : 1.0, -2.4]}
        maxWidth={3.7}
        lineHeight={1.6}
        material-toneMapped={false}
      >
        {body}
      </Text>
    </group>
  );
}
