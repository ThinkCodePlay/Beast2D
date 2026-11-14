import { CHIPS, type KnobValues, type LiveChipId, type SfxSound, type WaveId } from "./chips";
import { clampKnob, clampPitch, clampVolume, KNOB_MAX, PITCH_MAX, VOLUME_MAX } from "./grid";

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
    pitch.push(clampPitch(step.pitch * PITCH_MAX));
    volume.push(clampVolume(step.volume * VOLUME_MAX));
  }
  return { pitch, volume };
}

const PRESET_KNOBS: Record<PresetId, KnobValues> = {
  shoot: { vol: 217, attack: 5, decay: 89, rate: 179, slide: 115, vibrato: 13, duty: 128, cutoff: 140 },
  coin: { vol: 179, attack: 3, decay: 51, rate: 204, slide: 13, vibrato: 0, duty: 128, cutoff: 204 },
  boom: { vol: 242, attack: 3, decay: 179, rate: 102, slide: 51, vibrato: 5, duty: 128, cutoff: 64 },
  hit: { vol: 204, attack: 0, decay: 38, rate: 217, slide: 26, vibrato: 0, duty: 64, cutoff: 153 },
  jump: { vol: 191, attack: 5, decay: 77, rate: 166, slide: 179, vibrato: 20, duty: 128, cutoff: 191 },
  power: { vol: 204, attack: 10, decay: 115, rate: 153, slide: 38, vibrato: 31, duty: 128, cutoff: 179 },
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
    vol: clampKnob(rng() * KNOB_MAX),
    attack: clampKnob(rng() * 102),
    decay: clampKnob(rng() * KNOB_MAX),
    rate: clampKnob(rng() * KNOB_MAX),
    slide: clampKnob(rng() * KNOB_MAX),
    vibrato: clampKnob(rng() * 128),
    duty: clampKnob(rng() * KNOB_MAX),
    cutoff: clampKnob(rng() * KNOB_MAX),
  };
  const grid = curve(rng, (_index, jitter) => ({
    pitch: rng() * 0.85 + jitter,
    volume: rng() > 0.35 ? rng() : 0,
  }));
  const suffix = String((seed >>> 0) % 100).padStart(2, "0");
  return patch(`dice_${suffix}`, wave, values, grid);
}

function varyKnobs(rng: () => number, base: KnobValues): KnobValues {
  const jitter = (center: number, span: number) => clampKnob(center + (rng() - 0.5) * span);
  return {
    vol: jitter(base.vol, 20),
    attack: jitter(base.attack, 15),
    decay: jitter(base.decay, 31),
    rate: jitter(base.rate, 26),
    slide: jitter(base.slide, 26),
    vibrato: jitter(base.vibrato, 20),
    duty: jitter(base.duty, 26),
    cutoff: jitter(base.cutoff, 26),
  };
}