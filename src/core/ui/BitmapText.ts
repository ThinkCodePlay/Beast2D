import { Assets, Container, Rectangle, Sprite, Texture } from "pixi.js";
import { getBitmapFont, tryGetBitmapFont } from "./bitmapFontRegistry";
import { pixelTexture } from "./pixelTexture";

let atlasTexture: Texture | null = null;
let atlasLoad: Promise<Texture> | null = null;
let loadedAtlasPath: string | null = null;

export function resetBitmapTextAtlas(): void {
  atlasTexture = null;
  atlasLoad = null;
  loadedAtlasPath = null;
}

function loadAtlas(): Promise<Texture> {
  const font = getBitmapFont();
  if (atlasTexture && loadedAtlasPath === font.atlasPath) {
    return Promise.resolve(atlasTexture);
  }
  if (!atlasLoad || loadedAtlasPath !== font.atlasPath) {
    loadedAtlasPath = font.atlasPath;
    atlasLoad = Assets.load(font.atlasPath).then((tex) => {
      atlasTexture = tex as Texture;
      pixelTexture(atlasTexture);
      return atlasTexture;
    });
  }
  return atlasLoad;
}

export interface BitmapTextOptions {
  scale?: number;
  /** Multiplies mono-ink glyphs; defaults to white (no change). */
  tint?: number;
  letterSpacing?: number;
}

export function measureBitmapText(
  text: string,
  options: BitmapTextOptions = {},
): number {
  if (text.length === 0) return 0;
  const font = tryGetBitmapFont();
  const glyphW = font?.glyphW ?? 5;
  const scale = options.scale ?? 1;
  const gap = options.letterSpacing ?? 1;
  const advance = (glyphW + gap) * scale;
  return (text.length - 1) * advance + glyphW * scale;
}

function glyphFrame(sheet: Texture, ch: string): Texture {
  const font = getBitmapFont();
  const key = ch.toUpperCase();
  const glyphs = font.glyphs;
  const pos = glyphs[key] ?? glyphs[" "];
  if (!pos) {
    return new Texture({
      source: sheet.source,
      frame: new Rectangle(0, 0, 1, 1),
    });
  }
  return new Texture({
    source: sheet.source,
    frame: new Rectangle(pos.x, pos.y, font.glyphW, font.glyphH),
  });
}

/** Builds text synchronously when the atlas is already loaded. */
export function buildBitmapTextFromSheet(
  sheet: Texture,
  text: string,
  options: BitmapTextOptions = {},
): Container {
  pixelTexture(sheet);
  const font = getBitmapFont();
  const scale = options.scale ?? 1;
  const gap = options.letterSpacing ?? 1;
  const advance = Math.round((font.glyphW + gap) * scale);
  const tint = options.tint ?? 0xffffff;
  const container = new Container();
  let x = 0;
  for (const ch of text.toUpperCase()) {
    const frame = glyphFrame(sheet, ch);
    const sprite = new Sprite(frame);
    sprite.roundPixels = true;
    sprite.scale.set(scale);
    sprite.tint = tint;
    sprite.x = Math.round(x);
    sprite.y = 0;
    pixelTexture(sprite.texture);
    container.addChild(sprite);
    x += advance;
  }
  return container;
}

/** Async helper; prefer after `preloadBitmapFont()`. */
export function buildBitmapText(
  text: string,
  options: BitmapTextOptions = {},
): Container {
  const container = new Container();
  void loadAtlas().then((sheet) => {
    if (container.destroyed) return;
    const built = buildBitmapTextFromSheet(sheet, text, options);
    while (built.children.length > 0) {
      const child = built.children[0]!;
      built.removeChild(child);
      container.addChild(child);
    }
  });
  return container;
}

export async function buildBitmapTextReady(
  text: string,
  options: BitmapTextOptions = {},
): Promise<Container> {
  const sheet = await loadAtlas();
  return buildBitmapTextFromSheet(sheet, text, options);
}

export async function preloadBitmapFont(): Promise<Texture> {
  return loadAtlas();
}

/** Returns uppercase chars in `text` missing from the active font. */
export function missingGlyphs(text: string): string[] {
  const font = tryGetBitmapFont();
  if (!font) return [...text.toUpperCase()].filter((c) => c !== " ");
  const need = new Set<string>();
  for (const ch of text.toUpperCase()) {
    if (ch === " ") continue;
    if (!font.glyphs[ch]) need.add(ch);
  }
  return [...need].sort();
}
