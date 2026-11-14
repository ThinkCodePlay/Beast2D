import { afterEach, describe, expect, it } from "vitest";
import { sfx } from "../src/core/cart/api";
import { compileCart } from "../src/core/cart/compile";
import { DrawList } from "../src/core/cart/commands";
import { withCartContext } from "../src/core/cart/context";
import { Input } from "../src/core/Input";
import { resetSfxBank, getSfxBank } from "../src/core/sfx/bank";
import { lastAppliedSfx, onSfxPlayed } from "../src/core/sfx/synth";

function run(body: () => void): void {
  withCartContext({ drawList: new DrawList(), input: new Input() }, body);
}

afterEach(() => {
  resetSfxBank();
});

describe("sfx(n)", () => {
  it("plays the live slot and ignores a bad index", () => {
    const played: number[] = [];
    const stop = onSfxPlayed((slot) => played.push(slot));
    getSfxBank().slots[2]!.wave = "noise";
    run(() => sfx(2));
    expect(played).toEqual([2]);
    expect(lastAppliedSfx()?.wave).toBe("noise");
    getSfxBank().slots[2]!.chip = "pico";
    getSfxBank().slots[2]!.wave = "tri";
    run(() => sfx(2));
    expect(lastAppliedSfx()?.wave).toBe("tri");
    run(() => {
      sfx(16);
      sfx(-1);
    });
    expect(played).toEqual([2, 2]);
    stop();
  });

  it("throws outside a cart and on a fractional slot", () => {
    expect(() => sfx(0)).toThrow(/cart is running/);
    run(() => {
      expect(() => sfx(1.5)).toThrow(/integer/);
    });
  });

  it("is injected into a compiled cart", () => {
    const played: number[] = [];
    const stop = onSfxPlayed((slot) => played.push(slot));
    const compiled = compileCart(`function init(){ sfx(4); }\nfunction update(){}\nfunction draw(){}`);
    expect(compiled.ok).toBe(true);
    if (!compiled.ok) return;
    run(() => compiled.cart.init());
    expect(played).toEqual([4]);
    expect(lastAppliedSfx()?.chip).toBe("gb");
    stop();
  });

  it("applies GB limits without rewriting the saved knobs", () => {
    const slot = getSfxBank().slots[0]!;
    slot.chip = "gb";
    slot.wave = "tri";
    slot.knobs.duty = 0.33;
    slot.knobs.cutoff = 0.15;
    const before = structuredClone(slot);
    run(() => sfx(0));
    expect(slot).toEqual(before);
    expect(lastAppliedSfx()).toMatchObject({ wave: "sqr", duty: 0.25, cutoff: null });
    slot.chip = "pico";
    run(() => sfx(0));
    expect(slot.knobs.duty).toBe(0.33);
    expect(slot.wave).toBe("tri");
    expect(lastAppliedSfx()).toMatchObject({ wave: "tri", cutoff: 0.15 });
  });
});
