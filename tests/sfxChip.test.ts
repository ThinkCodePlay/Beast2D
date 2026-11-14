import { describe, expect, it } from "vitest";
import { CHIPS, KNOB_IDS, applyChip, type SfxSound } from "../src/core/sfx/chips";
import { createDefaultSfxBank } from "../src/core/sfx/defaultBank";

function sound(): SfxSound {
  const bank = createDefaultSfxBank();
  const slot = bank.slots[0]!;
  slot.chip = null;
  slot.wave = "saw";
  slot.knobs.duty = 84;
  slot.knobs.cutoff = 51;
  return slot;
}

describe("sfx chip limits", () => {
  it("describes every chip, with SAW and TRI missing on GB and the filter off", () => {
    expect(KNOB_IDS).toHaveLength(8);
    expect(CHIPS.pico.live).toBe(true);
    expect(CHIPS.gb.live).toBe(true);
    expect(CHIPS.snes.live).toBe(false);
    expect(CHIPS.gen.live).toBe(false);
    expect(CHIPS.pico.waves).toEqual(["sqr", "pls", "wave", "noise", "saw", "tri"]);
    expect(CHIPS.gb.waves).not.toContain("saw");
    expect(CHIPS.gb.waves).not.toContain("tri");
    expect(CHIPS.gb.knobs.cutoff).toBe(false);
    expect(CHIPS.pico.knobs.cutoff).toBe(true);
    expect(CHIPS.gb.dutySnap).toEqual([0.125, 0.25, 0.5, 0.75]);
    expect(CHIPS.pico.dutySnap).toBeNull();
    expect(CHIPS.snes.pitchHz[0]).not.toBe(CHIPS.pico.pitchHz[0]);
    expect(CHIPS.gen.waves).not.toEqual(CHIPS.pico.waves);
  });

  it("clamps at playback and keeps the stored sound so the other chip restores it", () => {
    const stored = sound();
    const before = structuredClone(stored);
    const gb = applyChip(stored, "gb");
    expect(stored).toEqual(before);
    expect(gb.chip).toBe("gb");
    expect(gb.wave).toBe("sqr");
    expect(gb.duty).toBe(0.25);
    expect(gb.cutoff).toBeNull();
    expect(gb.knobs.duty).toBe(84);
    expect(gb.knobs.cutoff).toBe(51);

    const pico = applyChip(stored, "pico");
    expect(stored).toEqual(before);
    expect(pico.wave).toBe("saw");
    expect(pico.duty).toBeCloseTo(84 / 255);
    expect(pico.cutoff).toBeCloseTo(51 / 255);
  });

  it("lets one sound override the cart chip", () => {
    const stored = sound();
    stored.chip = "pico";
    expect(applyChip(stored, "gb").wave).toBe("saw");
    expect(applyChip(stored, "gb").chip).toBe("pico");
  });
});