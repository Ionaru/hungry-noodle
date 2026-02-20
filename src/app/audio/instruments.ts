import * as Tone from "tone";

import { AudioService } from "./audio.service";

export enum InstrumentType {
  Lead = "lead",
  Bass = "bass",
  Chords = "chords",
  Drum = "drum",
}

export class InstrumentBank {
  readonly #instruments = new Map<
    InstrumentType,
    Tone.PolySynth | Tone.MembraneSynth
  >();

  constructor(private readonly audioService: AudioService) {}

  init(): void {
    const musicOut = this.audioService.getMusicOutput();

    // Lead: Triangle wave for softer melody
    const lead = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "triangle",
      },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.5,
        release: 0.1,
      },
    }).connect(musicOut);
    lead.volume.value = -10; // Quieter mix
    this.#instruments.set(InstrumentType.Lead, lead);

    // Bass: Triangle wave for deeper sound
    const bass = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "triangle",
      },
      envelope: {
        attack: 0.05,
        decay: 0.2,
        sustain: 0.8,
        release: 0.5,
      },
    }).connect(musicOut);
    bass.volume.value = -3;
    this.#instruments.set(InstrumentType.Bass, bass);

    // Chords: Sawtooth for richer texture
    const chords = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "sawtooth",
      },
      envelope: {
        attack: 0.2,
        decay: 0.5,
        sustain: 0.6,
        release: 1,
      },
    }).connect(musicOut);
    chords.volume.value = -10;
    this.#instruments.set(InstrumentType.Chords, chords);

    // Drums: Membrane synth for kicks/toms (simple percussion)
    // Note: For a full drum kit, we might need a sampler or multiple synths,
    // but MembraneSynth is good for basic kick/tom chiptune sounds.
    // We can also use NoiseSynth for snares/hi-hats.
    // For simplicity, we'll start with a MembraneSynth for the "beat".
    const drum = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: {
        type: "sine",
      },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 1.4,
      },
    }).connect(musicOut);
    this.#instruments.set(InstrumentType.Drum, drum);
  }

  get(type: InstrumentType): Tone.PolySynth | Tone.MembraneSynth | undefined {
    return this.#instruments.get(type);
  }

  releaseAll(): void {
    for (const inst of this.#instruments.values()) {
      if (inst instanceof Tone.PolySynth) {
        inst.releaseAll();
      }
      // MembraneSynth doesn't have releaseAll, it's monophonic-ish usually or triggered by duration
    }
  }
}
