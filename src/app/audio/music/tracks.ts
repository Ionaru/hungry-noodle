import { TerrainType } from "../../map/types";
import { InstrumentType } from "../instruments";

import { MusicComposition, TrackPart } from "./music.types";

// --- Composition Helpers ---

function createPart(
  instrument: InstrumentType,
  events: [string, string | string[], string][],
): TrackPart {
  return {
    instrument,
    events: events.map(([time, note, duration]) => ({
      time,
      note,
      duration,
    })),
  };
}

// --- Compositions ---

export const MENU_THEME: MusicComposition = {
  bpm: 110,
  timeSignature: 4,
  length: "4m",
  parts: [
    createPart(InstrumentType.Lead, [
      ["0:0:0", "E5", "8n"],
      ["0:0:2", "G5", "8n"],
      ["0:1:0", "C6", "4n"],
      ["0:2:0", "G5", "8n"],
      ["0:2:2", "E5", "8n"],
      ["0:3:0", "C5", "4n"],
      //
      ["1:0:0", "F5", "8n"],
      ["1:0:2", "A5", "8n"],
      ["1:1:0", "C6", "4n"],
      ["1:2:0", "A5", "8n"],
      ["1:2:2", "F5", "8n"],
      ["1:3:0", "D5", "4n"],
      //
      ["2:0:0", "G5", "8n"],
      ["2:0:2", "B5", "8n"],
      ["2:1:0", "D6", "4n"],
      ["2:2:0", "B5", "8n"],
      ["2:2:2", "G5", "8n"],
      ["2:3:0", "E5", "4n"],
      //
      ["3:0:0", "C6", "8n"],
      ["3:0:2", "G5", "8n"],
      ["3:1:0", "E5", "8n"],
      ["3:1:2", "C5", "8n"],
      ["3:2:0", "G4", "4n"],
      ["3:3:0", "C5", "4n"],
    ]),
    createPart(InstrumentType.Bass, [
      ["0:0:0", "C3", "4n"],
      ["0:2:0", "G3", "4n"],
      ["1:0:0", "F3", "4n"],
      ["1:2:0", "C3", "4n"],
      ["2:0:0", "G3", "4n"],
      ["2:2:0", "D3", "4n"],
      ["3:0:0", "C3", "4n"],
      ["3:2:0", "G2", "4n"],
    ]),
    createPart(InstrumentType.Drum, [
      ["0:0:0", "C2", "8n"],
      ["0:1:0", "C2", "8n"],
      ["0:2:0", "C2", "8n"],
      ["0:3:0", "C2", "8n"],
      // Loop implies simple 4/4 beat
      ["1:0:0", "C2", "8n"],
      ["1:1:0", "C2", "8n"],
      ["1:2:0", "C2", "8n"],
      ["1:3:0", "C2", "8n"],
      ["2:0:0", "C2", "8n"],
      ["2:1:0", "C2", "8n"],
      ["2:2:0", "C2", "8n"],
      ["2:3:0", "C2", "8n"],
      ["3:0:0", "C2", "8n"],
      ["3:1:0", "C2", "8n"],
      ["3:2:0", "C2", "8n"],
      ["3:3:0", "C2", "8n"],
    ]),
  ],
};

export const CLASSIC_THEME: MusicComposition = {
  bpm: 120,
  timeSignature: 4,
  length: "2m",
  parts: [
    createPart(InstrumentType.Lead, [
      // Lemmings-ish march
      ["0:0:0", "C5", "8n"],
      ["0:0:2", "E5", "8n"],
      ["0:1:0", "G5", "8n"],
      ["0:1:2", "E5", "8n"],
      ["0:2:0", "C6", "8n"],
      ["0:2:2", "G5", "8n"],
      ["0:3:0", "E5", "4n"],
      //
      ["1:0:0", "D5", "8n"],
      ["1:0:2", "F5", "8n"],
      ["1:1:0", "A5", "8n"],
      ["1:1:2", "F5", "8n"],
      ["1:2:0", "D6", "8n"],
      ["1:2:2", "A5", "8n"],
      ["1:3:0", "F5", "4n"],
    ]),
    createPart(InstrumentType.Bass, [
      ["0:0:0", "C3", "8n"],
      ["0:0:2", "G3", "8n"],
      ["0:1:0", "C3", "8n"],
      ["0:1:2", "G3", "8n"],
      ["0:2:0", "C3", "8n"],
      ["0:2:2", "G3", "8n"],
      ["0:3:0", "C3", "8n"],
      ["0:3:2", "G3", "8n"],
      //
      ["1:0:0", "D3", "8n"],
      ["1:0:2", "A3", "8n"],
      ["1:1:0", "D3", "8n"],
      ["1:1:2", "A3", "8n"],
      ["1:2:0", "D3", "8n"],
      ["1:2:2", "A3", "8n"],
      ["1:3:0", "D3", "8n"],
      ["1:3:2", "A3", "8n"],
    ]),
    createPart(InstrumentType.Drum, [
      ["0:0:0", "C2", "4n"],
      ["0:1:0", "C2", "4n"],
      ["0:2:0", "C2", "4n"],
      ["0:3:0", "C2", "4n"],
      ["1:0:0", "C2", "4n"],
      ["1:1:0", "C2", "4n"],
      ["1:2:0", "C2", "4n"],
      ["1:3:0", "C2", "4n"],
    ]),
  ],
};

export const FOREST_THEME: MusicComposition = {
  bpm: 100,
  timeSignature: 4,
  length: "4m",
  parts: [
    createPart(InstrumentType.Chords, [
      ["0:0:0", ["A3", "C4", "E4"], "1m"],
      ["1:0:0", ["G3", "B3", "D4"], "1m"],
      ["2:0:0", ["F3", "A3", "C4"], "1m"],
      ["3:0:0", ["E3", "G3", "B3"], "1m"],
    ]),
    createPart(InstrumentType.Lead, [
      ["0:0:0", "E5", "4n"],
      ["0:1:0", "A5", "4n"],
      ["0:2:0", "C6", "4n"],
      ["0:3:0", "B5", "4n"],
      ["1:0:0", "G5", "2n"],
      ["1:2:0", "D5", "2n"],
    ]),
  ],
};

export const DESERT_THEME: MusicComposition = {
  bpm: 130,
  timeSignature: 4,
  length: "2m",
  parts: [
    createPart(InstrumentType.Lead, [
      // Phrygian dominant feel
      ["0:0:0", "E5", "8n"],
      ["0:0:2", "F5", "8n"],
      ["0:1:0", "G#5", "8n"],
      ["0:1:2", "A5", "8n"],
      ["0:2:0", "B5", "4n"],
      ["0:3:0", "A5", "8n"],
      ["0:3:2", "G#5", "8n"],
      ["1:0:0", "F5", "4n"],
      ["1:1:0", "E5", "4n"],
    ]),
    createPart(InstrumentType.Bass, [
      ["0:0:0", "E2", "4n"],
      ["0:2:0", "E2", "4n"],
      ["1:0:0", "F2", "4n"],
      ["1:2:0", "E2", "4n"],
    ]),
  ],
};

// Map themes to compositions
export const THEME_MUSIC_MAP: Record<string, MusicComposition> = {
  menu: MENU_THEME,
  [TerrainType.CLASSIC]: CLASSIC_THEME,
  [TerrainType.GRASSLANDS]: CLASSIC_THEME, // Fallback or variation
  [TerrainType.FOREST]: FOREST_THEME,
  [TerrainType.JUNGLE]: FOREST_THEME, // Fallback
  [TerrainType.DESERT]: DESERT_THEME,
  [TerrainType.ROCKY]: CLASSIC_THEME, // Fallback
  [TerrainType.SNOWY]: MENU_THEME, // Gentle
  [TerrainType.HELLSCAPE]: DESERT_THEME, // Fast
};
