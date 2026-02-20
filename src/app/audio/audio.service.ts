import { Injectable, effect, inject, signal } from "@angular/core";
import * as Tone from "tone";

import { TerrainType } from "../map/types";
import { AudioSettings } from "../services/storage/data";
import { Store } from "../services/store";

import { InstrumentBank } from "./instruments";
import { SfxPlayer, SfxType } from "./sfx";

export type AudioChannel = "master" | "music" | "sfx";

@Injectable({
  providedIn: "root",
})
export class AudioService {
  readonly #store = inject(Store);

  // Volume nodes
  #masterChannel: Tone.Channel | null = null;
  #musicChannel: Tone.Channel | null = null;
  #sfxChannel: Tone.Channel | null = null;

  // Sub-systems
  readonly #instrumentBank: InstrumentBank | null = null;
  #sfxPlayer: SfxPlayer | null = null;

  readonly #isInitialized = signal(false);

  constructor() {
    // Apply settings whenever they change
    effect(() => {
      const settings = this.#store.audioSettings();
      if (this.#isInitialized()) {
        this.#applySettings(settings);
      }
    });
  }

  async init(): Promise<void> {
    if (this.#isInitialized()) return;

    // Start audio context - required for browsers, should be called on user interaction
    await Tone.start();

    this.#masterChannel = new Tone.Channel(0, 0).toDestination();
    this.#musicChannel = new Tone.Channel(0, 0).connect(this.#masterChannel);
    this.#sfxChannel = new Tone.Channel(0, 0).connect(this.#masterChannel);

    // Init sub-systems
    // Music system disabled
    // this.#instrumentBank = new InstrumentBank(this);
    // this.#instrumentBank.init();

    this.#sfxPlayer = new SfxPlayer(this);
    this.#sfxPlayer.init();

    this.#applySettings(this.#store.audioSettings());
    this.#isInitialized.set(true);

    console.log("Audio system initialized");
  }

  #applySettings(settings: AudioSettings): void {
    if (!this.#masterChannel || !this.#musicChannel || !this.#sfxChannel) return;

    const masterDatabase = settings.muted
      ? -Infinity
      : Tone.gainToDb(settings.masterVolume);
    const musicDatabase = Tone.gainToDb(settings.musicVolume);
    const sfxDatabase = Tone.gainToDb(settings.sfxVolume);

    this.#masterChannel.volume.rampTo(masterDatabase, 0.1);
    this.#musicChannel.volume.rampTo(musicDatabase, 0.1);
    this.#sfxChannel.volume.rampTo(sfxDatabase, 0.1);
  }

  toggleMute(): void {
    const current = this.#store.audioSettings();
    this.#store.writeAudioSettings({
      ...current,
      muted: !current.muted,
    });
  }

  setVolume(channel: AudioChannel, volume: number): void {
    const current = this.#store.audioSettings();
    // Clamp 0-1
    const clamped = Math.max(0, Math.min(1, volume));

    const newSettings = { ...current };
    switch (channel) {
      case "master": {
        newSettings.masterVolume = clamped;
        break;
      }
      case "music": {
        newSettings.musicVolume = clamped;
        break;
      }
      case "sfx": {
        newSettings.sfxVolume = clamped;
        break;
      }
    }
    this.#store.writeAudioSettings(newSettings);
  }

  // Public API
  playMusic(_theme: TerrainType | "menu"): void {
    // Music system disabled
  }

  stopMusic(): void {
    // Music system disabled
  }

  playSfx(type: SfxType): void {
    if (!this.#isInitialized()) return;
    this.#sfxPlayer?.play(type);
  }

  // Getters for internal channels (for instruments to connect to)
  getMusicOutput(): Tone.ToneAudioNode {
    return this.#musicChannel ?? Tone.getDestination();
  }

  getSfxOutput(): Tone.ToneAudioNode {
    return this.#sfxChannel ?? Tone.getDestination();
  }

  getInstrumentBank(): InstrumentBank | null {
    return this.#instrumentBank;
  }
}
