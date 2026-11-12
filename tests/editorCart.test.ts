import { describe, expect, it } from "vitest";
import type { Cart } from "../src/core/cart/Cart";
import { loadEditorCart } from "../src/editor/editorCart";

const cartSource = `
let x = 4;
function init() { x = 0; }
function update(dt: number) { x += dt; }
function draw() {}
`;

describe("loadEditorCart", () => {
  it("loads a newly compiled cart so the preview is not a leftover level", async () => {
    const loaded: Cart[] = [];
    const result = await loadEditorCart(cartSource, async (cart) => {
      loaded.push(cart);
    });
    expect(result.ok).toBe(true);
    expect(loaded).toHaveLength(1);
    const first = loaded[0]!;
    first.init();
    first.update(1);
    const again: Cart[] = [];
    await loadEditorCart(cartSource, async (cart) => {
      again.push(cart);
    });
    expect(again[0]).not.toBe(first);
    again[0]!.init();
    again[0]!.update(0);
  });

  it("does not load a cart when the source fails to compile", async () => {
    const loaded: Cart[] = [];
    const result = await loadEditorCart("function init() {", async (cart) => {
      loaded.push(cart);
    });
    expect(result.ok).toBe(false);
    expect(loaded).toHaveLength(0);
  });
});
