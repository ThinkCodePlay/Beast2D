import { CHIPS, clamp01, type KnobValues, type LiveChipId, type SfxSound, type WaveId } from "./chips";

export const PRESET_IDS = ["shoot", "coin", "boom", "hit", "jump", "power"] as const;
export type PresetId = (typeof PRESET_IDS)[number];

export type SfxPatch = Omit<SfxSound, "chip">;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWave(rng: () => number, chip: LiveChipId, preferred: readonly WaveId[]): WaveId {
  const allowed = CHIPS[chip].waves;
  const pool = preferred.filter((wave) => allowed.includes(wave));
  const choices = pool.length > 0 ? pool : allowed;
  const index = Math.floor(rng() * choices.length);
  return choices[index] ?? choices[0] ?? "sqr";
}

function curve(
  rng: () => number,
  shape: (index: number, jitter: number) => { pitch: number; volume: number },
): { pitch: number[]; volume: number[] } {
  const pitch: number[] = [];
  const volume: number[] = [];
  for (let index = 0; index < 32; index += 1) {
    const step = shape(index, (rng() - 0.5) * 0.08);
    pitch.push(clamp01(step.pitch));
    volume.push(clamp01(step.volume));
  }
  return { pitch, volume };
}

const PRESET_KNOBS: Record<PresetId, KnobValues> = {
  shoot: { vol: 0.85, attack: 0.02, decay: 0.35, rate: 0.7, slide: 0.45, vibrato: 0.05, duty: 0.5, cutoff: 0.55 },
  coin: { vol: 0.7, attack: 0.01, decay: 0.2, rate: 0.8, slide: 0.05, vibrato: 0, duty: 0.5, cutoff: 0.8 },
  boom: { vol: 0.95, attack: 0.01, decay: 0.7, rate: 0.4, slide: 0.2, vibrato: 0.02, duty: 0.5, cutoff: 0.25 },
  hit: { vol: 0.8, attack: 0, decay: 0.15, rate: 0.85, slide: 0.1, vibrato: 0, duty: 0.25, cutoff: 0.6 },
  jump: { vol: 0.75, attack: 0.02, decay: 0.3, rate: 0.65, slide: 0.7, vibrato: 0.08, duty: 0.5, cutoff: 0.75 },
  power: { vol: 0.8, attack: 0.04, decay: 0.45, rate: 0.6, slide: 0.15, vibrato: 0.12, duty: 0.5, cutoff: 0.7 },
};

function presetShape(preset: PresetId, index: number, jitter: number): { pitch: number; volume: number } {
  if (preset === "shoot") {
    return { pitch: 0.85 - index / 40 + jitter, volume: index < 18 ? 1 - index / 18 : 0 };
  }
  if (preset === "coin") {
    const blip = (index >= 0 && index < 3) || (index >= 6 && index < 9);
    return { pitch: index >= 6 ? 0.82 : 0.68, volume: blip ? 1 : 0 };
  }
  if (preset === "boom") {
    return { pitch: 0.22 + jitter, volume: index < 24 ? 1 - index / 24 : 0 };
  }
  if (preset === "hit") {
    return { pitch: 0.55 - index / 30, volume: index < 4 ? 1 : 0 };
  }
  if (preset === "jump") {
    return { pitch: 0.35 + index / 28 + jitter, volume: index < 14 ? 1 : 0 };
  }
  const notes = [0.45, 0.55, 0.62, 0.75];
  return { pitch: (notes[Math.floor(index / 4) % notes.length] ?? 0.5) + jitter, volume: index < 20 ? 0.9 : 0 };
}

const PRESET_WAVES: Record<PresetId, readonly WaveId[]> = {
  shoot: ["noise", "sqr"],
  coin: ["sqr", "pls"],
  boom: ["noise", "wave"],
  hit: ["noise", "sqr"],
  jump: ["sqr", "tri", "pls"],
  power: ["sqr", "wave", "pls"],
};

function patch(name: string, wave: WaveId, values: KnobValues, grid: { pitch: number[]; volume: number[] }): SfxPatch {
  return { name, wave, loop: false, knobs: values, pitch: grid.pitch, volume: grid.volume };
}

/** One variation of a preset for this chip. The same seed always returns the same patch. */
export function generatePreset(preset: PresetId, chip: LiveChipId, seed: number): SfxPatch {
  const rng = mulberry32(seed * 10007 + preset.length * 97 + (chip === "gb" ? 13 : 3));
  const wave = pickWave(rng, chip, PRESET_WAVES[preset]);
  const values = varyKnobs(rng, PRESET_KNOBS[preset]);
  const grid = curve(rng, (index, jitter) => presetShape(preset, index, jitter));
  const suffix = String((seed >>> 0) % 100).padStart(2, "0");
  return patch(`${preset}_${suffix}`, wave, values, grid);
}

/** Fully random patch for the chip. Still deterministic for a seed. */
export function generateDice(chip: LiveChipId, seed: number): SfxPatch {
  const rng = mulberry32(seed * 10007 + 401 + (chip === "gb" ? 13 : 3));
  const wave = pickWave(rng, chip, CHIPS[chip].waves);
  const values: KnobValues = {
    vol: rng(),
    attack: rng() * 0.4,
    decay: rng(),
    rate: rng(),
    slide: rng(),
    vibrato: rng() * 0.5,
    duty: rng(),
    cutoff: rng(),
  };
  const grid = curve(rng, (_index, jitter) => ({
    pitch: rng() * 0.85 + jitter,
    volume: rng() > 0.35 ? rng() : 0,
  }));
  const suffix = String((seed >>> 0) % 100).padStart(2, "0");
  return patch(`dice_${suffix}`, wave, values, grid);
}

function varyKnobs(rng: () => number, base: KnobValues): KnobValues {
  return {
    vol: clamp01(base.vol + (rng() - 0.5) * 0.08),
    attack: clamp01(base.attack + (rng() - 0.5) * 0.06),
    decay: clamp01(base.decay + (rng() - 0.5) * 0.12),
    rate: clamp01(base.rate + (rng() - 0.5) * 0.1),
    slide: clamp01(base.slide + (rng() - 0.5) * 0.1),
    vibrato: clamp01(base.vibrato + (rng() - 0.5) * 0.08),
    duty: clamp01(base.duty + (rng() - 0.5) * 0.1),
    cutoff: clamp01(base.cutoff + (rng() - 0.5) * 0.1),
  };
}
