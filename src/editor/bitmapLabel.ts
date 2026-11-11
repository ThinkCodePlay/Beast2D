import { DEFAULT_BEAST2D_BITMAP_FONT } from "../core/ui/defaultBitmapFont";
import type { BitmapFontDefinition } from "../core/ui/bitmapFontRegistry";

const BITMAP_GAP = 1;

let atlasReady: Promise<HTMLImageElement> | null = null;

function loadAtlasImage(): Promise<HTMLImageElement> {
  if (atlasReady) return atlasReady;
  atlasReady = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => reject(new Error("bitmap font atlas failed to load"));
    image.src = `/${DEFAULT_BEAST2D_BITMAP_FONT.atlasPath}`;
  });
  return atlasReady;
}

export function bitmapFontDefinition(): BitmapFontDefinition {
  return DEFAULT_BEAST2D_BITMAP_FONT;
}

export function bitmapLabelLetterSpacing(): number {
  return BITMAP_GAP;
}

/** Logical (1×) label width before CSS scale — matches cart `print` advance rules. */
export function bitmapLabelLogicalSize(text: string, font = DEFAULT_BEAST2D_BITMAP_FONT): { width: number; height: number } {
  const advance = font.glyphW + BITMAP_GAP;
  const width = Math.max(font.glyphW, text.length * advance - BITMAP_GAP);
  return { width, height: font.glyphH };
}

export function resolveBitmapLabelGlyphs(
  text: string,
  font = DEFAULT_BEAST2D_BITMAP_FONT,
): { char: string; x: number; y: number }[] {
  const upper = text.toUpperCase();
  const glyphs = font.glyphs;
  return [...upper].map((char) => {
    const pos = glyphs[char] ?? glyphs[" "];
    return { char, x: pos?.x ?? 0, y: pos?.y ?? 0 };
  });
}

/** Sample 5×7 atlas ink for tests (matches cart bitmap charset). */
export function atlasGlyphMask(
  ch: string,
  font = DEFAULT_BEAST2D_BITMAP_FONT,
  atlasRows: Uint8Array,
  atlasWidth: number,
): string {
  const pos = font.glyphs[ch] ?? font.glyphs[" "];
  if (!pos) return "";
  let rows = "";
  for (let y = 0; y < font.glyphH; y += 1) {
    let line = "";
    for (let x = 0; x < font.glyphW; x += 1) {
      const idx = (pos.y + y) * atlasWidth + (pos.x + x);
      line += atlasRows[idx]! > 0 ? "#" : ".";
    }
    rows += `${line}\n`;
  }
  return rows.trimEnd();
}

/** Draws one line with the same 5×7 atlas the cart `print` helper uses. */
export async function paintBitmapLabel(
  canvas: HTMLCanvasElement,
  text: string,
  scale: number,
  color: string,
): Promise<void> {
  const font = DEFAULT_BEAST2D_BITMAP_FONT;
  const image = await loadAtlasImage();
  const { width, height } = bitmapLabelLogicalSize(text, font);
  const advance = font.glyphW + BITMAP_GAP;
  const displayScale = Math.max(1, Math.round(scale));

  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width * displayScale}px`;
  canvas.style.height = `${height * displayScale}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = false;

  const slots = resolveBitmapLabelGlyphs(text, font);
  for (let i = 0; i < slots.length; i += 1) {
    const { x, y } = slots[i]!;
    ctx.drawImage(image, x, y, font.glyphW, font.glyphH, i * advance, 0, font.glyphW, font.glyphH);
  }
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
}
