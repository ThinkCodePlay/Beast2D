import { describe, expect, it } from "vitest";
import { compileCart, checkCartSyntax } from "../src/editor/compileCart";

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
});
