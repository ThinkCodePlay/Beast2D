import {
  KNOB_IDS,
  SFX_SLOTS,
  SFX_STEPS,
  isLiveChip,
  isWaveId,
  type KnobValues,
  type LiveChipId,
  type SfxSound,
  type WaveId,
} from "./chips";
import { createDefaultSfxBank } from "./defaultBank";
import {
  KNOB_MAX,
  PITCH_MAX,
  VOLUME_MAX,
  clampKnob,
  clampPitch,
  clampVolume,
  migrateKnobValue,
  migratePitchValue,
  migrateVolumeValue,
} from "./grid";

export type SfxBank = {
  version: 1;
  chip: LiveChipId;
  slots: SfxSound[];
};

const DEFAULT_KNOBS: KnobValues = {
  vol: 204,
  attack: 5,
  decay: 102,
  rate: 140,
  slide: 26,
  vibrato: 0,
  duty: 128,
  cutoff: 191,
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

function intList(
  value: unknown,
  fallback: number,
  migrate: (n: number) => number,
): number[] {
  const source = Array.isArray(value) ? value : [];
  return Array.from({ length: SFX_STEPS }, (_, index) => {
    const item = source[index];
    return typeof item === "number" ? migrate(item) : fallback;
  });
}

function readKnobs(value: unknown): KnobValues {
  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const knobs = { ...DEFAULT_KNOBS };
  for (const id of KNOB_IDS) {
    const item = record[id];
    if (typeof item === "number") knobs[id] = migrateKnobValue(item);
  }
  return knobs;
}

function readSound(value: unknown): SfxSound {
  if (!value || typeof value !== "object") return emptySound();
  const record = value as Record<string, unknown>;
  const chip =
    typeof record.chip === "string" && isLiveChip(record.chip)
      ? record.chip
      : null;
  const wave: WaveId =
    typeof record.wave === "string" && isWaveId(record.wave)
      ? record.wave
      : "sqr";
  const name =
    typeof record.name === "string" ? record.name.slice(0, 16) : "empty";
  return {
    name,
    chip,
    wave,
    loop: record.loop === true,
    knobs: readKnobs(record.knobs),
    pitch: intList(record.pitch, 0, migratePitchValue),
    volume: intList(record.volume, 0, migrateVolumeValue),
  };
}

/** Accepts a saved bank and repairs slots. A bad document becomes the default bank. */
export function parseSfxBank(value: unknown): SfxBank {
  if (!value || typeof value !== "object") return createDefaultSfxBank();
  const record = value as Record<string, unknown>;
  if (record.version !== 1) return createDefaultSfxBank();
  const chip: LiveChipId =
    typeof record.chip === "string" && isLiveChip(record.chip)
      ? record.chip
      : "gb";
  const source = Array.isArray(record.slots) ? record.slots : [];
  const slots = Array.from({ length: SFX_SLOTS }, (_, index) =>
    readSound(source[index]),
  );
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
      knobs: Object.fromEntries(
        KNOB_IDS.map((id) => [id, clampKnob(sound.knobs[id])]),
      ) as KnobValues,
      pitch: sound.pitch.map((step) => clampPitch(step)),
      volume: sound.volume.map((step) => clampVolume(step)),
    })),
  };
}

function isPitchList(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length === SFX_STEPS &&
    value.every(
      (item) =>
        typeof item === "number" &&
        Number.isInteger(item) &&
        item >= 0 &&
        item <= PITCH_MAX,
    )
  );
}

function isVolumeList(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length === SFX_STEPS &&
    value.every(
      (item) =>
        typeof item === "number" &&
        Number.isInteger(item) &&
        item >= 0 &&
        item <= VOLUME_MAX,
    )
  );
}

function isKnobsJson(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const knobs = value as Record<string, unknown>;
  for (const id of KNOB_IDS) {
    const item = knobs[id];
    if (
      typeof item !== "number" ||
      !Number.isInteger(item) ||
      item < 0 ||
      item > KNOB_MAX
    )
      return false;
  }
  return true;
}

function isSoundJson(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (typeof record.name !== "string") return false;
  if (
    record.chip !== null &&
    (typeof record.chip !== "string" || !isLiveChip(record.chip))
  )
    return false;
  if (typeof record.wave !== "string" || !isWaveId(record.wave)) return false;
  if (typeof record.loop !== "boolean") return false;
  if (!isKnobsJson(record.knobs)) return false;
  return isPitchList(record.pitch) && isVolumeList(record.volume);
}

/** True when a save payload has the v1 bank shape. */
export function isSfxBankJson(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (record.version !== 1) return false;
  if (typeof record.chip !== "string" || !isLiveChip(record.chip)) return false;
  if (!Array.isArray(record.slots) || record.slots.length !== SFX_SLOTS)
    return false;
  return record.slots.every(isSoundJson);
}
