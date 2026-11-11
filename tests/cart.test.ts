import { afterEach, describe, expect, it } from "vitest";
import { Level } from "../src/core/Level";
import { CartLevel } from "../src/core/cart/CartLevel";
import { DrawList } from "../src/core/cart/commands";
import { btn, btnp, cls, print, rect, rectfill } from "../src/core/cart/api";
import type { Cart } from "../src/core/cart/Cart";
import { withCartContext } from "../src/core/cart/context";
import { measureBitmapText } from "../src/core/ui/BitmapText";
import { useBitmapFont } from "../src/core/ui/bitmapFontRegistry";
import { DEFAULT_BEAST2D_BITMAP_FONT } from "../src/core/ui/defaultBitmapFont";
import { Input } from "../src/core/Input";
import { createContext, fakeEngine } from "./helpers";

function key(type: "keydown" | "keyup", code: string) {
  return Object.assign(new Event(type, { cancelable: true }), { code });
}

function cartContext(input = new Input()) {
  const drawList = new DrawList();
  return { drawList, input };
}

afterEach(() => {
  useBitmapFont(DEFAULT_BEAST2D_BITMAP_FONT);
});

describe("cart draw API", () => {
  it("records cls, rect, rectfill, and print while a cart is running", () => {
    const frame = cartContext();
    withCartContext(frame, () => {
      cls(0);
      rect(1, 2, 3, 4, 10);
      rectfill(5, 6, 7, 8, 4);
      print("HELLO", 8, 8, 4);
      print("HI", 0, 0, 4, 2);
    });
    expect(frame.drawList.commands).toEqual([
      { op: "cls", color: 0 },
      { op: "rect", x: 1, y: 2, w: 3, h: 4, color: 10 },
      { op: "rectfill", x: 5, y: 6, w: 7, h: 8, color: 4 },
      { op: "print", text: "HELLO", x: 8, y: 8, color: 4, scale: 1 },
      { op: "print", text: "HI", x: 0, y: 0, color: 4, scale: 2 },
    ]);
    expect(measureBitmapText("HELLO")).toBe(29);
    expect(measureBitmapText("HI", { scale: 2 })).toBe(22);
  });

  it("throws outside a cart and on a bad palette index or scale", () => {
    expect(() => cls(0)).toThrow(/cart is running/);
    const frame = cartContext();
    withCartContext(frame, () => {
      expect(() => cls(16)).toThrow(/Palette index/);
      expect(() => print("X", 0, 0, 0, 0)).toThrow(/scale/);
    });
    expect(frame.drawList.commands).toEqual([]);
  });

  it("reads held and pressed actions from the cart input", () => {
    const target = new EventTarget();
    const frame = cartContext();
    frame.input.attach(target);
    target.dispatchEvent(key("keydown", "ArrowRight"));
    withCartContext(frame, () => {
      expect(btn("right")).toBe(true);
      expect(btnp("right")).toBe(true);
      expect(btn("left")).toBe(false);
    });
    frame.input.detach();
  });
});

describe("CartLevel", () => {
  it("calls init once, then update and draw each tick with dt in seconds", () => {
    const calls: string[] = [];
    const dts: number[] = [];
    const cart: Cart = {
      init() {
        calls.push("init");
      },
      update(dt) {
        calls.push("update");
        dts.push(dt);
      },
      draw() {
        calls.push("draw");
        cls(0);
      },
    };
    const context = createContext();
    const level = new CartLevel(fakeEngine(context), cart);
    level.start();
    expect(level.getHierarchy()?.children).toHaveLength(1);

    context.time.advance(1);
    level.tick(context.time.delta);
    context.time.advance(1);
    level.tick(context.time.delta);

    expect(calls).toEqual(["init", "update", "draw", "update", "draw"]);
    expect(dts[0]).toBeCloseTo(1 / 60);
    expect(dts[1]).toBeCloseTo(1 / 60);
    level.destroy();
  });

  it("does not add the lives and score band", () => {
    class Plain extends Level {
      protected override showHud = false;
      protected init(): void {}
      get childCount() {
        return this.levelRoot.children.length;
      }
    }
    const level = new Plain(fakeEngine());
    level.start();
    expect(level.childCount).toBe(0);
    level.destroy();
  });
});
