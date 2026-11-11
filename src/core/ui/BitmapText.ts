import { Assets, Container, Rectangle, Sprite, Texture } from "pixi.js";
import { BEAST_EMOJI, BEAST_EMOJI_PATH, BEAST_EMOJI_SIZE } from "./beastEmoji";
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
  const chars = [...text];
  if (chars.length === 0) return 0;
  const font = tryGetBitmapFont();
  const glyphW = font?.glyphW ?? 5;
  const scale = options.scale ?? 1;
  const gap = options.letterSpacing ?? 1;
  let width = 0;
  chars.forEach((ch, index) => {
    const cell = ch === BEAST_EMOJI ? BEAST_EMOJI_SIZE : glyphW;
    width += cell * scale;
    if (index < chars.length - 1) width += gap * scale;
  });
  return width;
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
  const glyphH = font.glyphH;
  for (const ch of text.toUpperCase()) {
    if (ch === BEAST_EMOJI) {
      // Native 8×8 PNG, nearest-neighbor only. Not a cell of the 5×7 font.
      const emoji = emojiSprite(scale, glyphH);
      if (emoji) {
        emoji.x = Math.round(x);
        container.addChild(emoji);
      }
      x += Math.round((BEAST_EMOJI_SIZE + gap) * scale);
      continue;
    }
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

function emojiSprite(scale: number, glyphH: number): Sprite | null {
  let texture: Texture;
  try {
    texture = Assets.get<Texture>(BEAST_EMOJI_PATH);
  } catch {
    return null;
  }
  if (!texture) return null;
  pixelTexture(texture);
  const sprite = new Sprite(texture);
  sprite.roundPixels = true;
  sprite.scale.set(scale);
  sprite.y = Math.round((glyphH - BEAST_EMOJI_SIZE) * scale);
  return sprite;
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
    if (ch === " " || ch === BEAST_EMOJI) continue;
    if (!font.glyphs[ch]) need.add(ch);
  }
  return [...need].sort();
}
