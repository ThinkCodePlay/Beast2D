import { describe, expect, it } from "vitest";
import { KNOB_IDS, SFX_SLOTS, SFX_STEPS } from "../src/core/sfx/chips";
import {
  createDefaultSfxBank,
  isSfxBankJson,
  parseSfxBank,
  serializeSfxBank,
} from "../src/core/sfx/format";

describe("sfx bank format", () => {
  it("ships 16 slots of 32 steps with the cart chip separate from the grid", () => {
    const bank = createDefaultSfxBank();
    expect(bank.version).toBe(1);
    expect(bank.chip).toBe("gb");
    expect(bank.slots).toHaveLength(SFX_SLOTS);
    expect(bank.slots[3]?.name).toBe("laser_01");
    expect(bank.slots[7]?.chip).toBe("pico");
    for (const sound of bank.slots) {
      expect(sound.pitch).toHaveLength(SFX_STEPS);
      expect(sound.volume).toHaveLength(SFX_STEPS);
      expect(Object.keys(sound.knobs)).toEqual([...KNOB_IDS]);
    }
    const sound = bank.slots[0]!;
    const pitch = [...sound.pitch];
    sound.knobs.duty = 0.15;
    sound.knobs.cutoff = 0.2;
    expect(sound.pitch).toEqual(pitch);
    expect(sound.volume).toHaveLength(SFX_STEPS);
  });

  it("round-trips and repairs a bad document back to the default bank", () => {
    const bank = createDefaultSfxBank();
    bank.slots[1]!.name = "blip";
    bank.slots[1]!.knobs.vol = 0.25;
    const saved = serializeSfxBank(bank);
    expect(isSfxBankJson(saved)).toBe(true);
    expect(parseSfxBank(saved).slots[1]).toEqual(saved.slots[1]);
    expect(parseSfxBank({ version: 2 })).toEqual(createDefaultSfxBank());
    expect(parseSfxBank(null).slots).toHaveLength(SFX_SLOTS);
    expect(isSfxBankJson({ version: 1, chip: "snes", slots: [] })).toBe(false);

    const repaired = parseSfxBank({
      version: 1,
      chip: "nope",
      slots: [{ name: "x", wave: "nope", knobs: { duty: 4, vol: -2 }, pitch: [2], volume: [] }],
    });
    expect(repaired.chip).toBe("gb");
    expect(repaired.slots[0]?.wave).toBe("sqr");
    expect(repaired.slots[0]?.knobs.duty).toBe(1);
    expect(repaired.slots[0]?.knobs.vol).toBe(0);
    expect(repaired.slots[0]?.pitch).toHaveLength(SFX_STEPS);
    expect(repaired.slots[15]?.name).toBe("empty");
  });
});
