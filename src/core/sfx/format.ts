import {
  KNOB_IDS,
  SFX_SLOTS,
  SFX_STEPS,
  clamp01,
  isLiveChip,
  isWaveId,
  type KnobId,
  type KnobValues,
  type LiveChipId,
  type SfxSound,
  type WaveId,
} from "./chips";
import { generatePreset, type PresetId } from "./generate";

export type SfxBank = {
  version: 1;
  chip: LiveChipId;
  slots: SfxSound[];
};

const DEFAULT_KNOBS: KnobValues = {
  vol: 0.8,
  attack: 0.02,
  decay: 0.4,
  rate: 0.55,
  slide: 0.1,
  vibrato: 0,
  duty: 0.5,
  cutoff: 0.75,
};

export function emptySound(): SfxSound {
  return {
    name: "empty",
    chip: null,
    wave: "sqr",
    loop: false,
    knobs: { ...DEFAULT_KNOBS },
    pitch: Array.from({ length: SFX_STEPS }, () => 0),
    volume: Array.from({ length: SFX_STEPS }, () => 0),
  };
}

function numberList(value: unknown, fallback: number): number[] {
  const source = Array.isArray(value) ? value : [];
  return Array.from({ length: SFX_STEPS }, (_, index) => {
    const item = source[index];
    return typeof item === "number" ? clamp01(item) : fallback;
  });
}

function readKnobs(value: unknown): KnobValues {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const knobs = { ...DEFAULT_KNOBS };
  for (const id of KNOB_IDS) {
    const item = record[id];
    if (typeof item === "number") knobs[id] = clamp01(item);
  }
  return knobs;
}

function readSound(value: unknown): SfxSound {
  if (!value || typeof value !== "object") return emptySound();
  const record = value as Record<string, unknown>;
  const chip = typeof record.chip === "string" && isLiveChip(record.chip) ? record.chip : null;
  const wave: WaveId = typeof record.wave === "string" && isWaveId(record.wave) ? record.wave : "sqr";
  const name = typeof record.name === "string" ? record.name.slice(0, 16) : "empty";
  return {
    name,
    chip,
    wave,
    loop: record.loop === true,
    knobs: readKnobs(record.knobs),
    pitch: numberList(record.pitch, 0),
    volume: numberList(record.volume, 0),
  };
}

/** Accepts a saved bank and repairs slots. A bad document becomes the default bank. */
export function parseSfxBank(value: unknown): SfxBank {
  if (!value || typeof value !== "object") return createDefaultSfxBank();
  const record = value as Record<string, unknown>;
  if (record.version !== 1) return createDefaultSfxBank();
  const chip: LiveChipId = typeof record.chip === "string" && isLiveChip(record.chip) ? record.chip : "gb";
  const source = Array.isArray(record.slots) ? record.slots : [];
  const slots = Array.from({ length: SFX_SLOTS }, (_, index) => readSound(source[index]));
  return { version: 1, chip, slots };
}

export function serializeSfxBank(bank: SfxBank): SfxBank {
  return {
    version: 1,
    chip: bank.chip,
    slots: bank.slots.map((sound) => ({
      name: sound.name,
      chip: sound.chip,
      wave: sound.wave,
      loop: sound.loop,
      knobs: { ...sound.knobs },
      pitch: sound.pitch.slice(),
      volume: sound.volume.slice(),
    })),
  };
}

function isNumberList(value: unknown): boolean {
  return Array.isArray(value) && value.length === SFX_STEPS && value.every((item) => typeof item === "number" && Number.isFinite(item));
}

function isSoundJson(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (typeof record.name !== "string") return false;
  if (record.chip !== null && (typeof record.chip !== "string" || !isLiveChip(record.chip))) return false;
  if (typeof record.wave !== "string" || !isWaveId(record.wave)) return false;
  if (typeof record.loop !== "boolean") return false;
  if (!record.knobs || typeof record.knobs !== "object") return false;
  const knobs = record.knobs as Record<string, unknown>;
  for (const id of KNOB_IDS) {
    if (typeof knobs[id] !== "number" || !Number.isFinite(knobs[id])) return false;
  }
  return isNumberList(record.pitch) && isNumberList(record.volume);
}

/** True when a save payload has the v1 bank shape. */
export function isSfxBankJson(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (record.version !== 1) return false;
  if (typeof record.chip !== "string" || !isLiveChip(record.chip)) return false;
  if (!Array.isArray(record.slots) || record.slots.length !== SFX_SLOTS) return false;
  return record.slots.every(isSoundJson);
}

function fill(
  slots: SfxSound[],
  index: number,
  name: string,
  preset: PresetId,
  chip: LiveChipId | null,
  seed: number,
): void {
  const patch = generatePreset(preset, chip ?? "gb", seed);
  slots[index] = {
    ...patch,
    name,
    chip,
  };
}

/** Sixteen slots. A few are filled so the disk is not a blank bank. */
export function createDefaultSfxBank(): SfxBank {
  const slots = Array.from({ length: SFX_SLOTS }, () => emptySound());
  fill(slots, 0, "jump", "jump", null, 1);
  fill(slots, 1, "coin", "coin", null, 2);
  fill(slots, 2, "hit", "hit", null, 3);
  fill(slots, 3, "laser_01", "shoot", null, 4);
  fill(slots, 4, "boom_big", "boom", null, 5);
  fill(slots, 5, "power_up", "power", null, 6);
  fill(slots, 6, "enemy_die", "boom", null, 7);
  fill(slots, 7, "select", "coin", "pico", 8);
  return { version: 1, chip: "gb", slots };
}

export function knobLabel(id: KnobId): string {
  if (id === "vol") return "VOL";
  if (id === "attack") return "ATK";
  if (id === "decay") return "DEC";
  if (id === "rate") return "RATE";
  if (id === "slide") return "SLD";
  if (id === "vibrato") return "VIB";
  if (id === "duty") return "DUTY";
  return "CUT";
}
