import { Injectable, inject } from "@angular/core";

import { FoodType } from "../food/types";
import { Direction } from "../services/game-state";

import { AudioService } from "./audio.service";

@Injectable({ providedIn: "root" })
export class SfxService {
  readonly #audio = inject(AudioService);

  // Basic turn click; pitch depends on direction
  turn(direction: Direction): void {
    const freq: Record<Direction, number> = {
      up: 880,
      right: 660,
      down: 494,
      left: 588,
    };
    this.#emitPing(freq[direction], 0.035);
  }

  pickup(type: FoodType): void {
    if (type === FoodType.GOLDEN) {
      // Two quick tones
      this.#emitPing(1320, 0.06);
      setTimeout(() => {
        this.#emitPing(1760, 0.08);
      }, 60);
    } else {
      this.#emitPing(980, 0.05);
    }
  }

  gameOver(): void {
    // Downward sweep
    this.#emitSweep(880, 220, 0.35);
  }

  // Simple public helpers for authoring new SFX
  beep(options: {
    frequency: number;
    duration: number;
    type?: OscillatorType;
    gain?: number;
  }): void {
    this.#emitPing(
      options.frequency,
      options.duration,
      options.type ?? "square",
      options.gain ?? 0.8,
    );
  }

  sweep(options: {
    from: number;
    to: number;
    duration: number;
    type?: OscillatorType;
    gain?: number;
  }): void {
    this.#emitSweep(
      options.from,
      options.to,
      options.duration,
      options.type ?? "sawtooth",
      options.gain ?? 0.6,
    );
  }

  sequence(
    steps: (
      | {
          kind: "beep";
          frequency: number;
          duration: number;
          type?: OscillatorType;
          gain?: number;
        }
      | {
          kind: "sweep";
          from: number;
          to: number;
          duration: number;
          type?: OscillatorType;
          gain?: number;
        }
    )[],
  ): void {
    let start = this.#audio.currentTime();
    for (const step of steps) {
      if (step.kind === "beep") {
        this.#schedule(() => {
          this.beep(step);
        }, start);
        start += step.duration;
      } else {
        this.#schedule(() => {
          this.sweep(step);
        }, start);
        start += step.duration;
      }
    }
  }

  #emitPing(
    frequency: number,
    duration: number,
    type: OscillatorType = "square",
    peak = 0.8,
  ): void {
    if (!this.#audio.unlocked()) return;
    const context = this.#audio.audioContext();
    const now = this.#audio.currentTime();
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.#audio.sfxBus);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  #emitSweep(
    from: number,
    to: number,
    duration: number,
    type: OscillatorType = "sawtooth",
    peak = 0.6,
  ): void {
    if (!this.#audio.unlocked()) return;
    const context = this.#audio.audioContext();
    const now = this.#audio.currentTime();
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, to),
      now + duration,
    );
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.#audio.sfxBus);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  #schedule(function_: () => void, at: number): void {
    const delayMs = Math.max(0, (at - this.#audio.currentTime()) * 1000);
    globalThis.setTimeout(function_, delayMs);
  }
}
