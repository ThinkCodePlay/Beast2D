import { BEAST2D16_LIST } from "../ui/palette";

/** Resolves a cart color argument to a Beast2D 16 palette entry. */
export function paletteIndex(index: number): number {
  if (!Number.isInteger(index) || index < 0 || index >= BEAST2D16_LIST.length) {
    throw new Error(
      `Palette index ${index} is outside 0..${BEAST2D16_LIST.length - 1}`,
    );
  }
  return BEAST2D16_LIST[index]!;
}
