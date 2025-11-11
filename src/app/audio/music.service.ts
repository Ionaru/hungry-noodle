import { Injectable, inject } from "@angular/core";

import { TerrainType } from "../map/types";

import { AudioService } from "./audio.service";
import {
  TrackDescriptor,
  ProceduralTrack,
  MENU_ARRANGEMENTS,
  THEME_ARRANGEMENTS,
} from "./music-catalog";

@Injectable({ providedIn: "root" })
export class MusicService {
  readonly #audio = inject(AudioService);

  #engines: Sequencer[] = [];

  playMenu(): void {
    const arrangement = pickOne(MENU_ARRANGEMENTS);
    this.#playArrangement(arrangement);
  }

  stopMenu(): void {
    this.pause();
  }

  playTheme(theme: TerrainType): void {
    const arrangements = THEME_ARRANGEMENTS[theme];
    this.#playArrangement(pickOne(arrangements));
  }

  pause(): void {
    for (const engine of this.#engines) engine.stop();
    this.#engines = [];
  }

  #playArrangement(tracks: TrackDescriptor[]): void {
    if (!this.#audio.unlocked()) return;
    const context = this.#audio.audioContext();
    const bus = this.#audio.musicBus;
    const startTime = this.#audio.currentTime();

    // Stop any current engines
    this.pause();
    // Build engines for all provided tracks
    for (const t of tracks) {
      if (t.kind !== "procedural") continue; // skip assets for now
      const seq = new Sequencer(context, bus);
      seq.loadProcedural(t);
      this.#engines.push(seq);
    }
    // Start all engines at the same time
    for (const seq of this.#engines) {
      seq.start(startTime);
    }
  }
}

class Sequencer {
  readonly #ctx: AudioContext;
  readonly #out: GainNode;
  readonly #gain: GainNode;
  #intervalId: number | null = null;
  readonly #lookaheadMs = 100;
  #scheduleAheadEnd = 0;

  // Procedural track
  #track: ProceduralTrack | null = null;
  #stepIndex = 0;
  #baseFreq = 261.63; // C4

  constructor(context: AudioContext, out: GainNode) {
    this.#ctx = context;
    this.#out = out;
    this.#gain = context.createGain();
    this.#gain.gain.value = 0;
    this.#gain.connect(this.#out);
  }

  loadProcedural(track: ProceduralTrack): void {
    this.#track = track;
    this.#stepIndex = 0;
    this.#baseFreq = track.rootHz ?? 261.63;
  }

  start(startTime: number): void {
    this.#gain.gain.cancelScheduledValues(startTime);
    this.#gain.gain.setValueAtTime(1, startTime);
    this.#scheduleAheadEnd = startTime;
    if (this.#intervalId !== null) globalThis.clearInterval(this.#intervalId);
    this.#intervalId = globalThis.setInterval(() => {
      this.#tick();
    }, this.#lookaheadMs / 2);
  }

  stop(): void {
    const now = this.#ctx.currentTime;
    this.#gain.gain.cancelScheduledValues(now);
    this.#gain.gain.setValueAtTime(0, now);
    if (this.#intervalId !== null) {
      const id = this.#intervalId;
      this.#intervalId = null;
      globalThis.clearInterval(id);
    }
  }

  #tick(): void {
    const now = this.#ctx.currentTime;
    const horizon = now + this.#lookaheadMs / 1000;
    while (this.#scheduleAheadEnd < horizon) {
      this.#scheduleNextNote(this.#scheduleAheadEnd);
    }
  }

  #scheduleNextNote(at: number): void {
    if (!this.#track) return;
    const secondsPerBeat = 60 / this.#track.tempo;
    const stepBeats = 0.5; // eighth-notes
    const stepSeconds = stepBeats * secondsPerBeat;
    const patternLength = this.#track.pattern.length;
    if (patternLength === 0) {
      this.#scheduleAheadEnd = at + stepSeconds;
      return;
    }
    const index = this.#stepIndex % patternLength;
    const scaleIndex = this.#track.pattern[index];
    if (scaleIndex >= 0 && this.#track.scale.length > 0) {
      const semitone = this.#track.scale[scaleIndex % this.#track.scale.length];
      const freq = this.#baseFreq * Math.pow(2, semitone / 12);
      this.#trigger(this.#track.wave, freq, at, stepSeconds * 0.9);
    }
    this.#stepIndex++;
    this.#scheduleAheadEnd = at + stepSeconds;
  }

  #trigger(
    wave: OscillatorType,
    frequency: number,
    at: number,
    dur: number,
  ): void {
    const osc = this.#ctx.createOscillator();
    const environment = this.#ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(frequency, at);
    environment.gain.setValueAtTime(0.0001, at);
    environment.gain.exponentialRampToValueAtTime(0.6, at + 0.03);
    environment.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(environment);
    environment.connect(this.#gain);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  }
}

function pickOne<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error("pickOne called with empty array");
  }
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  const n0 = random[0];
  const index = n0 % array.length;
  return array[index];
}
