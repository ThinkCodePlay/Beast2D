import { afterEach, describe, expect, it } from "vitest";
import { sfx } from "../src/core/cart/api";
import { compileCart } from "../src/core/cart/compile";
import { DrawList } from "../src/core/cart/commands";
import { withCartContext } from "../src/core/cart/context";
import { Input } from "../src/core/Input";
import { resetSfxBank, getSfxBank } from "../src/core/sfx/bank";
import { onSfxApplied, onSfxPlayed } from "../src/core/sfx/synth";
import type { AppliedSfx } from "../src/core/sfx/chips";

function run(body: () => void): void {
  withCartContext({ drawList: new DrawList(), input: new Input() }, body);
}

function captureApplied(): { stop: () => void; latest: () => AppliedSfx | null } {
  let applied: AppliedSfx | null = null;
  const stop = onSfxApplied((next) => {
    applied = next;
  });
  return { stop, latest: () => applied };
}

afterEach(() => {
  resetSfxBank();
});

describe("sfx(n)", () => {
  it("plays the live slot and throws on a bad index", () => {
    const played: number[] = [];
    const stopPlay = onSfxPlayed((slot) => played.push(slot));
    const applied = captureApplied();
    getSfxBank().slots[2]!.wave = "noise";
    run(() => sfx(2));
    expect(played).toEqual([2]);
    expect(applied.latest()?.wave).toBe("noise");
    getSfxBank().slots[2]!.chip = "pico";
    getSfxBank().slots[2]!.wave = "tri";
    run(() => sfx(2));
    expect(applied.latest()?.wave).toBe("tri");
    run(() => {
      expect(() => sfx(16)).toThrow(/out of range/);
      expect(() => sfx(-1)).toThrow(/out of range/);
    });
    expect(played).toEqual([2, 2]);
    applied.stop();
    stopPlay();
  });

  it("throws outside a cart and on a fractional slot", () => {
    expect(() => sfx(0)).toThrow(/cart is running/);
    run(() => {
      expect(() => sfx(1.5)).toThrow(/integer/);
    });
  });

  it("is injected into a compiled cart", () => {
    const played: number[] = [];
    const stopPlay = onSfxPlayed((slot) => played.push(slot));
    const applied = captureApplied();
    const compiled = compileCart(`function init(){ sfx(4); }\nfunction update(){}\nfunction draw(){}`);
    expect(compiled.ok).toBe(true);
    if (!compiled.ok) return;
    run(() => compiled.cart.init());
    expect(played).toEqual([4]);
    expect(applied.latest()?.chip).toBe("gb");
    applied.stop();
    stopPlay();
  });

  it("applies GB limits without rewriting the saved knobs", () => {
    const slot = getSfxBank().slots[0]!;
    slot.chip = "gb";
    slot.wave = "tri";
    slot.knobs.duty = 84;
    slot.knobs.cutoff = 38;
    const before = structuredClone(slot);
    const applied = captureApplied();
    run(() => sfx(0));
    expect(slot).toEqual(before);
    expect(applied.latest()).toMatchObject({ wave: "sqr", duty: 0.25, cutoff: null });
    slot.chip = "pico";
    run(() => sfx(0));
    expect(slot.knobs.duty).toBe(84);
    expect(slot.wave).toBe("tri");
    expect(applied.latest()?.wave).toBe("tri");
    expect(applied.latest()?.cutoff).toBeCloseTo(38 / 255);
    applied.stop();
  });
});