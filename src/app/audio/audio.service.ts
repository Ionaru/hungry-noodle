import { Injectable, computed, effect, inject, signal } from "@angular/core";

import { StoreKey } from "../services/storage/data";
import { Store } from "../services/store";

@Injectable({ providedIn: "root" })
export class AudioService {
  readonly #store = inject(Store);

  // Lazy AudioContext (created on unlock)
  readonly #audioContext = signal(new globalThis.AudioContext());
  readonly audioContext = this.#audioContext.asReadonly();

  // Master routing
  #masterGain: GainNode | null = null;
  #musicGain: GainNode | null = null;
  #sfxGain: GainNode | null = null;

  // State
  readonly unlocked = signal(false);
  readonly mute = signal<boolean>(false);
  readonly masterVolume = signal<number>(1); // 0..1
  readonly musicVolume = signal<number>(0.6); // 0..1
  readonly sfxVolume = signal<number>(0.8); // 0..1

  // Derived master factor
  readonly effectiveMusicGain = computed(() =>
    this.mute() ? 0 : Math.max(0, Math.min(1, this.musicVolume())),
  );
  readonly effectiveSfxGain = computed(() =>
    this.mute() ? 0 : Math.max(0, Math.min(1, this.sfxVolume())),
  );

  constructor() {
    // Persist changes
    effect(() => {
      this.#store.write(StoreKey.MusicVolume, this.musicVolume());
    });
    effect(() => {
      this.#store.write(StoreKey.SfxVolume, this.sfxVolume());
    });
    effect(() => {
      this.#store.write(StoreKey.Mute, this.mute());
    });
    effect(() => {
      this.#store.write(StoreKey.MasterVolume, this.masterVolume());
    });

    // Apply gain changes
    effect(() => {
      const mg = this.#masterGain;
      if (mg) mg.gain.value = Math.max(0, Math.min(1, this.masterVolume()));
    });
    effect(() => {
      const mg = this.#musicGain;
      if (mg) mg.gain.value = this.effectiveMusicGain();
    });
    effect(() => {
      const sg = this.#sfxGain;
      if (sg) sg.gain.value = this.effectiveSfxGain();
    });
  }

  currentTime(): number {
    return this.#audioContext().currentTime;
  }

  get musicBus(): GainNode {
    if (!this.#musicGain) this.#ensureGraph();
    if (!this.#musicGain) throw new Error("Music bus unavailable.");
    return this.#musicGain;
  }

  get sfxBus(): GainNode {
    if (!this.#sfxGain) this.#ensureGraph();
    if (!this.#sfxGain) throw new Error("SFX bus unavailable.");
    return this.#sfxGain;
  }

  unlock(): boolean {
    if (this.unlocked()) return true;
    try {
      this.#ensureGraph();
      this.unlocked.set(true);
      return true;
    } catch (error) {
      console.error("Error unlocking audio", error);
      return false;
    }
  }

  // Attempt to dynamically load Tone.js when/if needed (optional)
  // Returns null if unavailable; callers must handle fallback.
  async loadTone(): Promise<Record<string, unknown> | null> {
    try {
      const moduleName = "tone";
      const module_ = (await import(/* @vite-ignore */ moduleName)) as unknown;
      return module_ as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  #ensureGraph(): void {
    const audioContext = this.#audioContext();
    if (!this.#masterGain) {
      this.#masterGain = audioContext.createGain();
      this.#masterGain.gain.value = Math.max(
        0,
        Math.min(1, this.masterVolume()),
      );
      this.#masterGain.connect(audioContext.destination);
      // React to masterVolume updates
    }
    if (!this.#musicGain) {
      this.#musicGain = audioContext.createGain();
      this.#musicGain.gain.value = this.effectiveMusicGain();
      this.#musicGain.connect(this.#masterGain);
    }
    if (!this.#sfxGain) {
      this.#sfxGain = audioContext.createGain();
      this.#sfxGain.gain.value = this.effectiveSfxGain();
      this.#sfxGain.connect(this.#masterGain);
    }
  }

  // Convenience setters for settings UI integration
  setVolumes(options: { master?: number; music?: number; sfx?: number }): void {
    if (typeof options.master === "number")
      this.masterVolume.set(options.master);
    if (typeof options.music === "number") this.musicVolume.set(options.music);
    if (typeof options.sfx === "number") this.sfxVolume.set(options.sfx);
  }
}
