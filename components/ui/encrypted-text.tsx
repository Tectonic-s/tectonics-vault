"use client";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { soundFX } from "@/lib/audio";

type EncryptedTextProps = {
  text: string;
  className?: string;
  /**
   * Time in milliseconds between revealing each subsequent real character.
   * Lower is faster. Defaults to 50ms per character.
   */
  revealDelayMs?: number;
  /** Optional custom character set to use for the gibberish effect. */
  charset?: string;
  /**
   * Time in milliseconds between gibberish flips for unrevealed characters.
   * Lower is more jittery. Defaults to 50ms.
   */
  flipDelayMs?: number;
  /** Delay in milliseconds before starting the decryption animation */
  startDelayMs?: number;
  /** CSS class for styling the encrypted/scrambled characters */
  encryptedClassName?: string;
  /** CSS class for styling the revealed characters */
  revealedClassName?: string;
  /** Whether to play mechanical/digital audio click sound effects */
  soundEffect?: boolean;
  /** Optional callback fired when all characters are fully decrypted/revealed */
  onComplete?: () => void;
};

const DEFAULT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?";

function generateRandomCharacter(charset: string): string {
  const index = Math.floor(Math.random() * charset.length);
  return charset.charAt(index);
}

function generateGibberishPreservingSpaces(
  original: string,
  charset: string,
): string {
  if (!original) return "";
  let result = "";
  for (let i = 0; i < original.length; i += 1) {
    const ch = original[i];
    result += ch === " " ? " " : generateRandomCharacter(charset);
  }
  return result;
}

function getDeterministicInitialScramble(
  original: string,
  charset: string
): string[] {
  if (!original) return [];
  const chars: string[] = [];
  for (let i = 0; i < original.length; i += 1) {
    const ch = original[i];
    if (ch === " ") {
      chars.push(" ");
    } else {
      const idx = (ch.charCodeAt(0) * 19 + i * 37) % charset.length;
      chars.push(charset.charAt(idx));
    }
  }
  return chars;
}

export const EncryptedText: React.FC<EncryptedTextProps> = ({
  text,
  className,
  revealDelayMs = 50,
  charset = DEFAULT_CHARSET,
  flipDelayMs = 50,
  startDelayMs = 0,
  encryptedClassName,
  revealedClassName,
  soundEffect = true,
  onComplete,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const [, startTransition] = useTransition();

  const [revealCount, setRevealCount] = useState<number>(() =>
    shouldReduceMotion ? text.length : 0
  );
  const [scrambleChars, setScrambleChars] = useState<string[]>(() =>
    text ? getDeterministicInitialScramble(text, charset) : []
  );

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastFlipTimeRef = useRef<number>(0);
  const lastScrambleAudioTimeRef = useRef<number>(0);
  const lastRevealCountRef = useRef<number>(0);
  const currentScrambleRef = useRef<string[]>([]);
  const completedRef = useRef<boolean>(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isInView) return;

    if (shouldReduceMotion) {
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
      return;
    }

    const initial = text ? generateGibberishPreservingSpaces(text, charset) : "";
    const initialArr = initial.split("");
    currentScrambleRef.current = initialArr;
    startTransition(() => {
      setScrambleChars(initialArr);
      setRevealCount(0);
    });

    startTimeRef.current = performance.now();
    lastFlipTimeRef.current = startTimeRef.current;
    lastScrambleAudioTimeRef.current = startTimeRef.current;
    lastRevealCountRef.current = 0;
    completedRef.current = false;

    let isCancelled = false;

    const update = (now: number) => {
      if (isCancelled) return;

      const elapsedMs = now - startTimeRef.current;

      if (startDelayMs > 0 && elapsedMs < startDelayMs) {
        // Decryption has not started yet; re-scramble periodically while waiting
        const timeSinceLastFlip = now - lastFlipTimeRef.current;
        if (timeSinceLastFlip >= Math.max(0, flipDelayMs)) {
          const nextChars = [...currentScrambleRef.current];
          for (let index = 0; index < text.length; index += 1) {
            if (text[index] !== " ") {
              nextChars[index] = generateRandomCharacter(charset);
            }
          }
          currentScrambleRef.current = nextChars;
          setScrambleChars(nextChars);
          lastFlipTimeRef.current = now;
        }
        animationFrameRef.current = requestAnimationFrame(update);
        return;
      }

      const activeElapsedMs = elapsedMs - startDelayMs;
      const totalLength = text.length;
      const currentRevealCount = Math.min(
        totalLength,
        Math.floor(activeElapsedMs / Math.max(1, revealDelayMs)),
      );

      if (currentRevealCount > lastRevealCountRef.current) {
        if (soundEffect) {
          soundFX.playCharacterReveal(text[currentRevealCount - 1]);
        }
        lastRevealCountRef.current = currentRevealCount;
      }

      setRevealCount(currentRevealCount);

      if (currentRevealCount >= totalLength) {
        if (!completedRef.current) {
          completedRef.current = true;
          if (soundEffect) {
            soundFX.playWordResolved();
          }
          onCompleteRef.current?.();
        }
        return;
      }

      // Re-randomize unrevealed scramble characters on an interval
      const timeSinceLastFlip = now - lastFlipTimeRef.current;
      if (timeSinceLastFlip >= Math.max(0, flipDelayMs)) {
        if (
          soundEffect &&
          currentRevealCount < totalLength &&
          now - lastScrambleAudioTimeRef.current >= 130
        ) {
          soundFX.playScrambleTick();
          lastScrambleAudioTimeRef.current = now;
        }
        const nextChars = [...currentScrambleRef.current];
        for (let index = 0; index < totalLength; index += 1) {
          if (index >= currentRevealCount) {
            if (text[index] !== " ") {
              nextChars[index] = generateRandomCharacter(charset);
            } else {
              nextChars[index] = " ";
            }
          }
        }
        currentScrambleRef.current = nextChars;
        setScrambleChars(nextChars);
        lastFlipTimeRef.current = now;
      }

      animationFrameRef.current = requestAnimationFrame(update);
    };

    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      isCancelled = true;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInView, text, revealDelayMs, charset, flipDelayMs, startDelayMs, soundEffect, shouldReduceMotion]);

  if (!text) return null;

  return (
    <motion.span
      ref={ref}
      suppressHydrationWarning
      className={cn(className)}
      aria-label={text}
      role="text"
    >
      {text.split("").map((char, index) => {
        const isRevealed = index < revealCount;
        const displayChar = isRevealed
          ? char
          : char === " "
            ? " "
            : (scrambleChars[index] ?? getDeterministicInitialScramble(text, charset)[index] ?? " ");

        return (
          <span
            key={index}
            suppressHydrationWarning
            className={cn(isRevealed ? revealedClassName : encryptedClassName)}
          >
            {displayChar}
          </span>
        );
      })}
    </motion.span>
  );
};
