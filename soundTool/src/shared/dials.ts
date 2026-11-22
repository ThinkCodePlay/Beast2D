import type { SoundSequence } from "./audio/model";
import { rateFromDial, rateToDial, snapRateDial } from "./audio/rate";
import {
  pitchFromDial,
  pitchToDial,
  snapPanDial,
  snapPitchDial,
} from "./audio/effects";

/**
 * The dial layer shared by the 2D strip and the 3D rotors: which dials the
 * board has, how a dial reads its resting position from the sequence, how
 * stepped dials snap, and how a turn writes back into the sequence. Keeping
 * this here means the two renderers can never drift apart in what a dial
 * means - only in how it looks.
 */

/** The six board dials in strip order, with their face colors. */
export const KNOBS = [
  { label: "VOL", color: 0xff91c8 },
  { label: "RATE", color: 0xffcf72 },
  { label: "PAN", color: 0xffcf72 },
  { label: "DECAY", color: 0xffcf72 },
  { label: "PITCH", color: 0x9ee18b },
  { label: "CUT", color: 0xffcf72 },
] as const;
export type KnobLabel = (typeof KNOBS)[number]["label"];

/** Live dial callbacks the composition root routes to the player. */
export interface DialActions {
  setMasterVolume(value: number): void;
  setPan(value: number): void;
  setCutoff(value: number): void;
}

/** A dial's resting position always reflects the sequence it edits. */
export function dialValue(label: KnobLabel, sequence: SoundSequence): number {
  switch (label) {
    case "VOL":
      return sequence.masterVolume;
    case "RATE":
      return rateToDial(sequence.rate);
    case "PAN":
      return sequence.pan;
    case "DECAY":
      return sequence.decay;
    case "PITCH":
      return pitchToDial(sequence.pitch);
    case "CUT":
      return sequence.cut;
  }
}

/** Stepped dials snap so their neutral and marked detents are exact. */
export function dialSnap(
  label: KnobLabel,
): ((value: number) => number) | undefined {
  if (label === "RATE") return snapRateDial;
  if (label === "PAN") return snapPanDial;
  if (label === "PITCH") return snapPitchDial;
  return undefined;
}

/**
 * Write the turn into the sequence; live dials (VOL, PAN, CUT) also reach the
 * player, while RATE, DECAY and PITCH apply on the next Play.
 */
export function applyDial(
  label: KnobLabel,
  value: number,
  sequence: SoundSequence,
  dials: DialActions,
): void {
  switch (label) {
    case "VOL":
      sequence.masterVolume = value;
      dials.setMasterVolume(value);
      break;
    case "RATE":
      sequence.rate = rateFromDial(value);
      break;
    case "PAN":
      sequence.pan = value;
      dials.setPan(value);
      break;
    case "DECAY":
      sequence.decay = value;
      break;
    case "PITCH":
      sequence.pitch = pitchFromDial(value);
      break;
    case "CUT":
      sequence.cut = value;
      dials.setCutoff(value);
      break;
  }
}
