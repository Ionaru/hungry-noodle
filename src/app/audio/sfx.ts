import * as Tone from "tone";

import { AudioService } from "./audio.service";

export enum SfxType {
  Move = "move",
  Eat = "eat",
  EatGolden = "eatGolden",
  GameOver = "gameOver",
  UiClick = "uiClick",
}

export class SfxPlayer {
  #moveSynth!: Tone.Synth;
  #eatSynth!: Tone.PolySynth;
  #gameOverSynth!: Tone.Synth;

  constructor(private readonly audioService: AudioService) {}

  init(): void {
    const sfxOut = this.audioService.getSfxOutput();

    // Move: Quick, quiet blip
    this.#moveSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.1 },
    }).connect(sfxOut);
    this.#moveSynth.volume.value = -10;

    // Eat: Bright chime
    this.#eatSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.1, release: 0.5 },
    }).connect(sfxOut);

    // Game Over: Descending slide synth
    this.#gameOverSynth = new Tone.Synth({
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.1, decay: 0.8, sustain: 0.2, release: 1 },
    }).connect(sfxOut);
  }

  play(type: SfxType): void {
    switch (type) {
      case SfxType.Move: {
        // Very short high blip
        this.#moveSynth.triggerAttackRelease("C6", "32n");
        break;
      }
      case SfxType.Eat: {
        // Happy major third
        this.#eatSynth.triggerAttackRelease(["C5", "E5"], "16n");
        break;
      }
      case SfxType.EatGolden: {
        // Richer major chord
        this.#eatSynth.triggerAttackRelease(["C5", "E5", "G5", "C6"], "8n");
        break;
      }
      case SfxType.UiClick: {
        this.#moveSynth.triggerAttackRelease("E6", "64n");
        break;
      }
      case SfxType.GameOver: {
        // Sad slide
        const now = Tone.now();
        this.#gameOverSynth.triggerAttack("A4", now);
        this.#gameOverSynth.frequency.rampTo("A2", 0.5, now);
        this.#gameOverSynth.triggerRelease(now + 0.5);
        break;
      }
    }
  }
}
