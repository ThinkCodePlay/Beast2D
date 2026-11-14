/** Per-chip limits. The SFX editor and the synth both read this table. */

export const SFX_STEPS = 32;
export const SFX_SLOTS = 16;

export const WAVE_IDS = ["sqr", "pls", "wave", "noise", "saw", "tri"] as const;
export type WaveId = (typeof WAVE_IDS)[number];

export const CHIP_IDS = ["pico", "gb", "snes", "gen"] as const;
export type ChipId = (typeof CHIP_IDS)[number];

export const LIVE_CHIP_IDS = ["pico", "gb"] as const;
export type LiveChipId = (typeof LIVE_CHIP_IDS)[number];

export const KNOB_IDS = ["vol", "attack", "decay", "rate", "slide", "vibrato", "duty", "cutoff"] as const;
export type KnobId = (typeof KNOB_IDS)[number];

export type KnobValues = Record<KnobId, number>;

export const WAVE_LABELS: Record<WaveId, string> = {
  sqr: "SQR",
  pls: "PLS",
  wave: "WAVE",
  noise: "NOISE",
  saw: "SAW",
  tri: "TRI",
};

export const CHIP_LABELS: Record<ChipId, string> = {
  pico: "PICO",
  gb: "GB",
  snes: "SNES",
  gen: "GEN",
};

export type ChipSpec = {
  id: ChipId;
  label: string;
  /** SNES and GEN stay in the table but the editor will not select them. */
  live: boolean;
  waves: readonly WaveId[];
  knobs: Record<KnobId, boolean>;
  /** Playback duty snaps. Null keeps the stored duty. */
  dutySnap: readonly number[] | null;
  pitchHz: readonly [number, number];
  /** Step length at rate 0 and rate 1. A higher rate is a shorter step. */
  stepSeconds: readonly [number, number];
  attackSeconds: readonly [number, number];
  decaySeconds: readonly [number, number];
  vibratoHz: number;
  filterHz: readonly [number, number];
};

function knobs(enabled: boolean, cutoff = enabled): Record<KnobId, boolean> {
  return {
    vol: enabled,
    attack: enabled,
    decay: enabled,
    rate: enabled,
    slide: enabled,
    vibrato: enabled,
    duty: enabled,
    cutoff,
  };
}

const ALL_WAVES: readonly WaveId[] = WAVE_IDS;

export const CHIPS: Record<ChipId, ChipSpec> = {
  pico: {
    id: "pico",
    label: "PICO",
    live: true,
    waves: ALL_WAVES,
    knobs: knobs(true),
    dutySnap: null,
    pitchHz: [80, 2400],
    stepSeconds: [0.07, 0.012],
    attackSeconds: [0, 0.4],
    decaySeconds: [0.05, 0.8],
    vibratoHz: 6,
    filterHz: [200, 8000],
  },
  gb: {
    id: "gb",
    label: "GB",
    live: true,
    waves: ["sqr", "pls", "wave", "noise"],
    knobs: knobs(true, false),
    dutySnap: [0.125, 0.25, 0.5, 0.75],
    pitchHz: [60, 2000],
    stepSeconds: [0.07, 0.012],
    attackSeconds: [0, 0.35],
    decaySeconds: [0.05, 0.7],
    vibratoHz: 6,
    filterHz: [200, 8000],
  },
  snes: {
    id: "snes",
    label: "SNES",
    live: false,
    waves: ["sqr", "tri", "noise"],
    knobs: knobs(false),
    dutySnap: [0.25, 0.5, 0.75],
    pitchHz: [110, 3520],
    stepSeconds: [0.06, 0.01],
    attackSeconds: [0, 0.25],
    decaySeconds: [0.04, 0.6],
    vibratoHz: 5.5,
    filterHz: [400, 12000],
  },
  gen: {
    id: "gen",
    label: "GEN",
    live: false,
    waves: ["saw", "noise", "pls"],
    knobs: knobs(false),
    dutySnap: [0.125, 0.375, 0.625],
    pitchHz: [55, 2800],
    stepSeconds: [0.08, 0.014],
    attackSeconds: [0, 0.45],
    decaySeconds: [0.06, 0.85],
    vibratoHz: 7,
    filterHz: [150, 6000],
  },
};

export function isLiveChip(value: string): value is LiveChipId {
  return (LIVE_CHIP_IDS as readonly string[]).includes(value);
}

export function isWaveId(value: string): value is WaveId {
  return (WAVE_IDS as readonly string[]).includes(value);
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function lerpRange(range: readonly [number, number], t: number): number {
  return range[0] + (range[1] - range[0]) * clamp01(t);
}

export function nearest(value: number, points: readonly number[]): number {
  let best = points[0] ?? value;
  let bestDist = Math.abs(value - best);
  for (const point of points) {
    const dist = Math.abs(value - point);
    if (dist < bestDist) {
      best = point;
      bestDist = dist;
    }
  }
  return best;
}

export function effectiveChip(soundChip: LiveChipId | null, cartChip: LiveChipId): LiveChipId {
  return soundChip ?? cartChip;
}

export type AppliedSfx = {
  chip: LiveChipId;
  wave: WaveId;
  duty: number;
  /** Null when this chip has no filter. The stored cutoff is left untouched. */
  cutoff: number | null;
  knobs: KnobValues;
  pitch: number[];
  volume: number[];
  loop: boolean;
};

export type SfxSound = {
  name: string;
  /** Null uses the cart chip. */
  chip: LiveChipId | null;
  wave: WaveId;
  loop: boolean;
  knobs: KnobValues;
  pitch: number[];
  volume: number[];
};

/** Playback view. Does not write chip limits back onto the stored sound. */
export function applyChip(sound: SfxSound, cartChip: LiveChipId): AppliedSfx {
  const chip = CHIPS[effectiveChip(sound.chip, cartChip)];
  const wave = chip.waves.includes(sound.wave) ? sound.wave : chip.waves[0] ?? "sqr";
  const dutyT = sound.knobs.duty / 255;
  const duty = chip.dutySnap ? nearest(dutyT, chip.dutySnap) : dutyT;
  return {
    chip: chip.id as LiveChipId,
    wave,
    duty,
    cutoff: chip.knobs.cutoff ? sound.knobs.cutoff / 255 : null,
    knobs: { ...sound.knobs },
    pitch: sound.pitch.slice(),
    volume: sound.volume.slice(),
    loop: sound.loop,
  };
}
