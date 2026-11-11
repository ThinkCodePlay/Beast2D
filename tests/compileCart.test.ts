import { describe, expect, it } from "vitest";
import { compileCart, checkCartSyntax, guardCart, runtimeErrorLine } from "../src/core/cart/compile";

const validCart = `
let x = 0;
function init() { x = 0; }
function update(dt: number) { x += dt; }
function draw() { cls(0); }
`;

describe("compileCart", () => {
  it("compiles a script with init, update, and draw", () => {
    const result = compileCart(validCart);
    expect(result.ok).toBe(true);
    if (result.ok) {
      result.cart.init();
      result.cart.update(1 / 60);
      expect(() => result.cart.draw()).toThrow(/cart is running/);
    }
  });

  it("reports syntax errors with a line when possible", () => {
    const bad = "function init() { cls(0;\nfunction update() {}\nfunction draw() {}";
    const syntax = checkCartSyntax(bad);
    expect(syntax.ok).toBe(false);
    if (!syntax.ok) {
      expect(syntax.message.length).toBeGreaterThan(0);
    }
    const compiled = compileCart(bad);
    expect(compiled.ok).toBe(false);
  });

  it("requires update", () => {
    const missing = `
function init() {}
function draw() { cls(0); }
`;
    const result = compileCart(missing);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/update/);
    }
  });

  it("maps runtime stack lines with a stable offset", () => {
    const source = `
function init() {}
function update(dt: number) {}
function draw() {
  throw new Error("boom");
}
`;
    const compiled = compileCart(source);
    expect(compiled.ok).toBe(true);
    if (!compiled.ok) return;
    let caught: unknown;
    try {
      compiled.cart.draw();
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeDefined();
    const line = runtimeErrorLine(caught);
    const throwLine =
      source.split("\n").findIndex((row) => row.includes("throw new Error")) + 1;
    expect(line).toBe(throwLine);
  });

  it("dedupes identical runtime reports per phase but reports across phases", () => {
    let reports = 0;
    const cart = {
      init() {},
      update() {
        throw new Error("same");
      },
      draw() {
        throw new Error("same");
      },
    };
    const guarded = guardCart(cart, () => {
      reports += 1;
    });
    expect(() => guarded.update(1 / 60)).toThrow();
    expect(() => guarded.update(1 / 60)).toThrow();
    expect(reports).toBe(1);
    expect(() => guarded.draw()).toThrow();
    expect(reports).toBe(2);
  });

  it("reports a new message on the same phase", () => {
    let last = "";
    let n = 0;
    let flip = false;
    const cart = {
      init() {},
      update() {
        throw new Error(flip ? "b" : "a");
      },
      draw() {},
    };
    const guarded = guardCart(cart, (message) => {
      last = message;
      n += 1;
    });
    expect(() => guarded.update(1)).toThrow();
    flip = true;
    expect(() => guarded.update(1)).toThrow();
    expect(n).toBe(2);
    expect(last).toBe("b");
  });
});
