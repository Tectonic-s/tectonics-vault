"use client";

import { useEffect, useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useVault } from "@/lib/vaultStore";

const FONT = "/fonts/Excon-Bold.ttf";
const INK = "#0f0f0f";
const LINE = "Welcome to the Vault.";

/**
 * The hero line, typed character by character in world space. Same intro
 * contract as the DOM build: nothing may be travelled until the line has
 * finished and the caret has blinked twice.
 */
export default function Hero3D() {
  const [typed, setTyped] = useState("");
  const [caretOn, setCaretOn] = useState(true);
  const [caretDone, setCaretDone] = useState(false);
  const setOpened = useVault((s) => s.setOpened);
  const group = useRef<THREE.Group>(null);

  // Typewriter — ~70-90ms per character, punctuation and spaces included.
  useEffect(() => {
    let i = 0;
    let alive = true;
    let t: number;
    const step = () => {
      if (!alive) return;
      if (i > LINE.length) return;
      setTyped(LINE.slice(0, i));
      i += 1;
      t = window.setTimeout(step, 70 + Math.random() * 20);
    };
    const start = window.setTimeout(step, 500);
    return () => {
      alive = false;
      clearTimeout(start);
      clearTimeout(t);
    };
  }, []);

  // Caret blinks twice after the line lands, then is removed for good.
  useEffect(() => {
    if (typed !== LINE) return;
    let blinks = 0;
    const id = window.setInterval(() => {
      setCaretOn((v) => {
        if (v) blinks += 1;
        return !v;
      });
      if (blinks >= 2) {
        clearInterval(id);
        setCaretOn(false);
        setCaretDone(true);
        setOpened(true);
      }
    }, 480);
    return () => clearInterval(id);
  }, [typed, setOpened]);

  // While typing, the caret blinks on its own cadence.
  useEffect(() => {
    if (caretDone || typed === LINE) return;
    const id = window.setInterval(() => setCaretOn((v) => !v), 480);
    return () => clearInterval(id);
  }, [caretDone, typed]);

  // The title recedes and fades as the descent begins — it does not scroll
  // away, it is left behind above you.
  useFrame((_, delta) => {
    if (!group.current) return;
    // Read progress imperatively: it changes every frame, so subscribing to it
    // would re-render this component 60×/sec for no reason.
    const raw = useVault.getState().progress;
    const p = Number.isFinite(raw) ? Math.min(Math.max(raw, 0) / 0.18, 1) : 0;
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, 1.6 + p * 6, 4, delta);
    const m = group.current.children[0] as unknown as { fillOpacity?: number } | undefined;
    if (m) m.fillOpacity = 1 - p;
  });

  return (
    <group ref={group} position={[0, 1.6, -6]}>
      <Text
        font={FONT}
        fontSize={0.82}
        color={INK}
        anchorX="center"
        anchorY="middle"
        maxWidth={14}
        letterSpacing={-0.01}
        material-toneMapped={false}
      >
        {typed + (caretDone ? "" : caretOn ? "|" : " ")}
      </Text>
    </group>
  );
}
