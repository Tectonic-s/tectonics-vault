"use client";

class SoundFX {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private listenersAttached: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initCtx();
      this.attachUnlockListeners();
    }
  }

  private attachUnlockListeners() {
    if (this.listenersAttached || typeof window === "undefined") return;
    this.listenersAttached = true;

    const unlock = () => {
      const ctx = this.initCtx();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
    };

    const events = [
      "pointerdown",
      "mousedown",
      "click",
      "touchstart",
      "touchend",
      "keydown",
    ];

    events.forEach((evt) => {
      window.addEventListener(evt, unlock, { capture: true, passive: true });
    });
  }

  public initCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch {
          // Fallback if audio creation fails
        }
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Unlocks audio on user gesture and plays a confirmation tactile click.
   */
  public unlockAudio(): boolean {
    const ctx = this.initCtx();
    if (ctx) {
      if (ctx.state === "suspended") {
        ctx
          .resume()
          .then(() => {
            this.playMenuClick();
          })
          .catch(() => {});
        return true;
      } else {
        this.playMenuClick();
        return true;
      }
    }
    return false;
  }

  public isRunning(): boolean {
    return this.ctx !== null && this.ctx.state === "running";
  }

  /**
   * Direct, fail-safe audio execution with automatic resume.
   */
  private withAudio(fn: (ctx: AudioContext) => void) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx
        .resume()
        .then(() => {
          if (!this.isMuted) fn(ctx);
        })
        .catch(() => {});
    } else {
      fn(ctx);
    }
  }

  /**
   * Ultra-minimal, gentle flutter tick for background character scrambling.
   */
  public playScrambleTick() {
    this.withAudio((ctx) => {
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Soft, rounded micro-sine drop (no harsh buzz or sawtooth)
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.012);

        // Very gentle volume: barely audible whisper texture
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.014);
      } catch {
        // Audio errors safely caught
      }
    });
  }

  /**
   * Minimal, clean tactile click when an authentic character locks into place.
   * Clean, soft mechanical key-drop (warm sine drop).
   */
  public playCharacterReveal(char?: string) {
    this.withAudio((ctx) => {
      try {
        const now = ctx.currentTime;
        // Keep spaces silent for clean rhythmic breathing space
        if (char === " ") return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm, rounded tactile pitch with subtle variance
        osc.type = "sine";
        const baseFreq = 480 + (char ? (char.charCodeAt(0) % 7) * 16 : 0);
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(190, now + 0.026);

        // Clean, comfortable volume: crisp, minimal, and pleasant on headphones
        gain.gain.setValueAtTime(0.085, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.026);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.028);
      } catch {
        // Audio errors safely caught
      }
    });
  }

  /**
   * Minimal, delicate soft glass harmonic resolving a phrase.
   */
  public playWordResolved() {
    this.withAudio((ctx) => {
      try {
        const now = ctx.currentTime;
        // Two airy, delicate harmonic sine notes
        const chord = [659.25, 880.0]; // E5, A5

        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          const startTime = now + idx * 0.06;
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.065, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.24);
        });
      } catch {
        // Audio errors safely caught
      }
    });
  }

  /**
   * Snappy tactile click when clicking menu items or interactive buttons.
   */
  public playMenuClick() {
    this.withAudio((ctx) => {
      try {
        const now = ctx.currentTime;

        // Low body punch
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(460, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.05);

        gain.gain.setValueAtTime(0.38, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.055);

        // High tactile latch click
        const click = ctx.createOscillator();
        const clickGain = ctx.createGain();
        click.type = "sine";
        click.frequency.setValueAtTime(2200, now);
        click.frequency.exponentialRampToValueAtTime(800, now + 0.02);

        clickGain.gain.setValueAtTime(0.24, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        click.connect(clickGain);
        clickGain.connect(ctx.destination);

        click.start(now);
        click.stop(now + 0.022);
      } catch {
        // Audio errors safely caught
      }
    });
  }

  /**
   * Microscopic haptic tick for hovering over interactive options.
   */
  public playHoverTick() {
    this.withAudio((ctx) => {
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(2600, now);
        osc.frequency.exponentialRampToValueAtTime(1500, now + 0.014);

        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.016);
      } catch {
        // Audio errors safely caught
      }
    });
  }

  /**
   * Snappy switch sound for switching tabs or chapters.
   */
  public playTabSwitch() {
    this.withAudio((ctx) => {
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.045);

        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
      } catch {
        // Audio errors safely caught
      }
    });
  }

  /**
   * Resonant mechanical latch unlocking tone for the Craft achievement cabinet.
   */
  public playCabinetUnlock() {
    this.withAudio((ctx) => {
      try {
        const now = ctx.currentTime;

        // Heavy resonant mechanical latch
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.16);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);

        // Shimmering metallic harmonic
        const shimmer = ctx.createOscillator();
        const sGain = ctx.createGain();
        shimmer.type = "sine";
        shimmer.frequency.setValueAtTime(1400, now + 0.03);
        shimmer.frequency.exponentialRampToValueAtTime(650, now + 0.32);

        sGain.gain.setValueAtTime(0.2, now + 0.03);
        sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        shimmer.connect(sGain);
        sGain.connect(ctx.destination);

        shimmer.start(now + 0.03);
        shimmer.stop(now + 0.35);
      } catch {
        // Audio errors safely caught
      }
    });
  }

  /**
   * Gentle modern pop/rising sweep for opening dialogs or modal panels.
   */
  public playModalOpen() {
    this.withAudio((ctx) => {
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.095);

        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.1);
      } catch {
        // Audio errors safely caught
      }
    });
  }

  /**
   * Soft latch dismiss sound for closing dialogs or modal panels.
   */
  public playModalClose() {
    this.withAudio((ctx) => {
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(560, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.075);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
      } catch {
        // Audio errors safely caught
      }
    });
  }

  /**
   * Rewarding ascending two-tone confirmation (e.g. email copied, action completed).
   */
  public playSuccessChime() {
    this.withAudio((ctx) => {
      try {
        const now = ctx.currentTime;

        // Note 1: F#5 (739.99Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(739.99, now);
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.2);

        // Note 2: C#6 (1108.73Hz)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1108.73, now + 0.085);
        gain2.gain.setValueAtTime(0.35, now + 0.085);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.085);
        osc2.stop(now + 0.48);
      } catch {
        // Audio errors safely caught
      }
    });
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!this.isMuted && this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }
}

export const soundFX = new SoundFX();
