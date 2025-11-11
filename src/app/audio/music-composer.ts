// Extremely simple helpers to compose procedural chiptune-like tracks.
// Goal: make authoring as simple as a short string of degrees and rests.
//
// Usage:
//   composeTrack({
//     id: 'classic-1',
//     tempo: 112,
//     wave: 'square',
//     scale: 'major'
//   }, '1 2 3 2 | 4 3 5 3')
//
// Syntax:
// - Use numbers 1..8 as scale degrees (1 is root), "-" or "r" for rest
// - Use "|" to separate bars (purely visual)
// - Keep it short; it loops automatically

import type { ProceduralTrack } from "./music-catalog";

export type ScaleName = "major" | "minorPentatonic" | "dorian" | "phrygian";

const SCALES: Record<ScaleName, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11, 12],
  minorPentatonic: [0, 3, 5, 7, 10, 12],
  dorian: [0, 2, 3, 5, 7, 9, 10, 12],
  phrygian: [0, 1, 3, 5, 7, 8, 10, 12],
};

export function composeTrack(
  meta: {
    id: string;
    tempo: number;
    wave: OscillatorType;
    scale: ScaleName;
    rootHz?: number;
  },
  sequence: string,
): ProceduralTrack {
  const scale = SCALES[meta.scale];
  const pattern = parseSequence(sequence);
  return {
    kind: "procedural",
    id: meta.id,
    tempo: meta.tempo,
    wave: meta.wave,
    scale,
    pattern,
    rootHz: meta.rootHz,
  };
}

export function parseSequence(seq: string): number[] {
  // Accept tokens separated by whitespace, ignore "|"
  const tokens = seq
    .split(/\s+/u)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => t !== "|");
  const pattern: number[] = [];
  for (const token of tokens) {
    if (token === "-" || token.toLowerCase() === "r") {
      pattern.push(-1);
      continue;
    }
    const degree = Number.parseInt(token, 10);
    if (Number.isFinite(degree) && degree >= 1) {
      // Convert 1-based to 0-based index
      pattern.push(degree - 1);
    } else {
      // Unknown token -> treat as rest to be safe
      pattern.push(-1);
    }
  }
  return pattern;
}
