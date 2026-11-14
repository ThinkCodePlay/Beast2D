import { describe, expect, it } from "vitest";
import { CHIPS } from "../src/core/sfx/chips";
import { PRESET_IDS, generateDice, generatePreset } from "../src/core/sfx/generate";

describe("sfx generators", () => {
  it("repeats a preset and a dice roll for the same seed", () => {
    expect(generatePreset("shoot", "gb", 4)).toEqual(generatePreset("shoot", "gb", 4));
    expect(generatePreset("jump", "pico", 9)).toEqual(generatePreset("jump", "pico", 9));
    expect(generateDice("pico", 3)).toEqual(generateDice("pico", 3));
    expect(generatePreset("shoot", "gb", 1).pitch).not.toEqual(generatePreset("shoot", "gb", 2).pitch);
    expect(generateDice("gb", 1).pitch).not.toEqual(generateDice("gb", 2).pitch);
  });

  it("stays on waves that chip can play", () => {
    for (let seed = 0; seed < 12; seed += 1) {
      for (const preset of PRESET_IDS) {
        const gb = generatePreset(preset, "gb", seed);
        const pico = generatePreset(preset, "pico", seed);
        expect(CHIPS.gb.waves).toContain(gb.wave);
        expect(CHIPS.pico.waves).toContain(pico.wave);
        expect(gb.wave === "saw" || gb.wave === "tri").toBe(false);
        expect(gb.pitch).toHaveLength(32);
        expect(pico.knobs.duty).toBeGreaterThanOrEqual(0);
        expect(pico.knobs.duty).toBeLessThanOrEqual(255);
        expect(Number.isInteger(pico.pitch[0])).toBe(true);
      }
      const dice = generateDice("gb", seed);
      expect(CHIPS.gb.waves).toContain(dice.wave);
      expect(dice.wave === "saw" || dice.wave === "tri").toBe(false);
    }
  });
});
