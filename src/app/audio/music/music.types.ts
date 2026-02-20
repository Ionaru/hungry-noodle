import { InstrumentType } from "../instruments";

export interface NoteEvent {
  time: string; // Transport time (e.g., "0:0:0", "0:1:0")
  note: string | string[]; // "C4", ["C4", "E4"]
  duration: string; // "8n", "16n"
  velocity?: number; // 0-1
}

export interface TrackPart {
  instrument: InstrumentType;
  events: NoteEvent[];
}

export interface MusicComposition {
  bpm: number;
  timeSignature: number; // 4 for 4/4
  parts: TrackPart[];
  length: string; // Total length to loop (e.g., "4m")
}
