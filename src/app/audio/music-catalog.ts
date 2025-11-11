import { TerrainType } from "../map/types";

import { composeTrack } from "./music-composer";

export interface ProceduralTrack {
  kind: "procedural";
  id: string;
  tempo: number; // bpm
  wave: OscillatorType;
  scale: number[]; // semitone offsets from C4
  pattern: number[]; // indexes into scale (-1 = rest)
  rootHz?: number; // optional per-track base frequency, default C4 (261.63)
}

export interface AssetTrack {
  kind: "asset";
  id: string;
  url: string; // future OGG/MP3
}

export type TrackDescriptor = ProceduralTrack | AssetTrack;

// Multi-channel arrangements (lead + bass etc.)
export const THEME_ARRANGEMENTS: Record<TerrainType, ProceduralTrack[][]> = {
  [TerrainType.CLASSIC]: [
    [
      composeTrack(
        { id: "classic-arr-lead", tempo: 112, wave: "square", scale: "major" },
        "1 2 3 2 | 4 3 5 3",
      ),
      composeTrack(
        {
          id: "classic-arr-bass",
          tempo: 112,
          wave: "triangle",
          scale: "major",
          rootHz: 73.42,
        },
        "8 - 8 - | 5 - 5 -",
      ),
    ],
  ],
  [TerrainType.GRASSLANDS]: [
    [
      composeTrack(
        { id: "grass-arr-lead", tempo: 120, wave: "square", scale: "major" },
        "1 3 5 8 | 5 3 1 r",
      ),
      composeTrack(
        { id: "grass-arr-bass", tempo: 120, wave: "triangle", scale: "major" },
        "1 - 1 - | 4 - 4 -",
      ),
    ],
  ],
  [TerrainType.FOREST]: [
    [
      composeTrack(
        { id: "forest-arr-lead", tempo: 92, wave: "square", scale: "dorian" },
        "1 3 5 6 | 5 3 1 r",
      ),
      composeTrack(
        { id: "forest-arr-bass", tempo: 92, wave: "triangle", scale: "dorian" },
        "1 - 6 - | 5 - 3 -",
      ),
    ],
  ],
  [TerrainType.JUNGLE]: [
    [
      composeTrack(
        { id: "jungle-arr-lead", tempo: 108, wave: "square", scale: "dorian" },
        "1 4 6 8 | 6 4 1 r",
      ),
      composeTrack(
        {
          id: "jungle-arr-bass",
          tempo: 108,
          wave: "triangle",
          scale: "dorian",
        },
        "1 - 1 - | 6 - 6 -",
      ),
    ],
  ],
  [TerrainType.DESERT]: [
    [
      composeTrack(
        {
          id: "desert-arr-lead",
          tempo: 100,
          wave: "square",
          scale: "phrygian",
        },
        "1 2 4 6 | 4 2 1 r",
      ),
      composeTrack(
        {
          id: "desert-arr-bass",
          tempo: 100,
          wave: "triangle",
          scale: "phrygian",
        },
        "1 - 1 - | 5 - 5 -",
      ),
    ],
  ],
  [TerrainType.ROCKY]: [
    [
      composeTrack(
        {
          id: "rocky-arr-lead",
          tempo: 110,
          wave: "square",
          scale: "minorPentatonic",
        },
        "1 3 5 3 | 2 3 5 r",
      ),
      composeTrack(
        {
          id: "rocky-arr-bass",
          tempo: 110,
          wave: "triangle",
          scale: "minorPentatonic",
        },
        "1 - 1 - | 5 - 5 -",
      ),
    ],
  ],
  [TerrainType.SNOWY]: [
    [
      composeTrack(
        { id: "snow-arr-bells", tempo: 80, wave: "sine", scale: "major" },
        "1 r 5 r | 8 r 5 r",
      ),
      composeTrack(
        { id: "snow-arr-bass", tempo: 80, wave: "triangle", scale: "major" },
        "1 - 1 - | 4 - 4 -",
      ),
    ],
  ],
  [TerrainType.HELLSCAPE]: [
    [
      composeTrack(
        {
          id: "inferno-arr-lead",
          tempo: 128,
          wave: "sawtooth",
          scale: "phrygian",
        },
        "1 4 2 6 | 4 2 1 r",
      ),
      composeTrack(
        {
          id: "inferno-arr-bass",
          tempo: 128,
          wave: "triangle",
          scale: "phrygian",
        },
        "1 - 1 - | 6 - 6 -",
      ),
    ],
  ],
};

export const MENU_ARRANGEMENTS: ProceduralTrack[][] = [
  [
    composeTrack(
      { id: "menu-arr-chime", tempo: 92, wave: "sine", scale: "major" },
      "1 r 5 r | 8 r 12 r",
    ),
    composeTrack(
      { id: "menu-casual-chill", tempo: 92, wave: "triangle", scale: "major" },
      // 8 bars; gentle, chill and casual vibe; lengthened for a ~10+ sec loop at 92bpm
      // (Each bar uses 4 eighth notes, so 8 bars = 32 steps, at 92bpm = ~10.4s per loop)
      // Melodic lines flow up and down, with space ("r") for a breezy feel
      `
      1 3 5 3 | 4 r 6 r | 5 4 3 r | 2 r 1 r |
      1 2 4 6 | 5 r 3 r | 4 3 1 r | 2 r 1 r
      `,
    ),
  ],
];
