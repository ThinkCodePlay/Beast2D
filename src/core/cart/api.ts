import { paletteIndex } from "./paletteIndex";
import { requireCartContext } from "./context";

function finite(name: string, value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }
  return value;
}

function colorIndex(index: number): number {
  finite("color", index);
  paletteIndex(index);
  return index;
}

/** Clears the screen to a palette index. */
export function cls(color: number): void {
  requireCartContext("cls").drawList.push({ op: "cls", color: colorIndex(color) });
}

/** Draws a 1 px rectangle outline. */
export function rect(x: number, y: number, w: number, h: number, color: number): void {
  requireCartContext("rect").drawList.push({
    op: "rect",
    x: finite("x", x),
    y: finite("y", y),
    w: finite("w", w),
    h: finite("h", h),
    color: colorIndex(color),
  });
}

/** Draws a filled rectangle. */
export function rectfill(x: number, y: number, w: number, h: number, color: number): void {
  requireCartContext("rectfill").drawList.push({
    op: "rectfill",
    x: finite("x", x),
    y: finite("y", y),
    w: finite("w", w),
    h: finite("h", h),
    color: colorIndex(color),
  });
}

/**
 * Draws bitmap text. `scale` is an integer multiplier of the 5×7 font
 * (1 is the small size, 2 is the large size).
 */
export function print(
  text: string,
  x: number,
  y: number,
  color: number,
  scale = 1,
): void {
  const drawList = requireCartContext("print").drawList;
  if (!Number.isInteger(scale) || scale < 1) {
    throw new Error("print scale must be an integer >= 1");
  }
  drawList.push({
    op: "print",
    text,
    x: finite("x", x),
    y: finite("y", y),
    color: colorIndex(color),
    scale,
  });
}

/** True while the named action is held. */
export function btn(action: string): boolean {
  return requireCartContext("btn").input.isDown(action);
}

/** True on the frame the named action was pressed. */
export function btnp(action: string): boolean {
  return requireCartContext("btnp").input.wasPressed(action);
}
