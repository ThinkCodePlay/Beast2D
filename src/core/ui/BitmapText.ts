import { Assets, Container, Rectangle, Sprite, Texture } from "pixi.js";
import { BITMAP_FONT } from "./fontGlyphs";
import { textureNearest } from "./textureNearest";

let atlasTexture: Texture | null = null;
let atlasLoad: Promise<Texture> | null = null;

function loadAtlas(): Promise<Texture> {
  if (atlasTexture) return Promise.resolve(atlasTexture);
  if (!atlasLoad) {
    atlasLoad = Assets.load(BITMAP_FONT.atlasPath).then((tex) => {
      atlasTexture = tex as Texture;
      textureNearest(atlasTexture);
      return atlasTexture;
    });
  }
  return atlasLoad;
}

export interface BitmapTextOptions {
  scale?: number;
  tint?: number;
  letterSpacing?: number;
}

export function measureBitmapText(
  text: string,
  options: BitmapTextOptions = {},
): number {
  if (text.length === 0) return 0;
  const scale = options.scale ?? 1;
  const gap = options.letterSpacing ?? 1;
  const advance = (BITMAP_FONT.glyphW + gap) * scale;
  return (text.length - 1) * advance + BITMAP_FONT.glyphW * scale;
}

function glyphFrame(sheet: Texture, ch: string): Texture {
  const key = ch.toUpperCase();
  const glyphs = BITMAP_FONT.glyphs as Record<string, { x: number; y: number }>;
  const pos = glyphs[key] ?? glyphs[" "];
  if (!pos) {
    return new Texture({
      source: sheet.source,
      frame: new Rectangle(0, 0, 1, 1),
    });
  }
  return new Texture({
    source: sheet.source,
    frame: new Rectangle(
      pos.x,
      pos.y,
      BITMAP_FONT.glyphW,
      BITMAP_FONT.glyphH,
    ),
  });
}

export function buildBitmapTextFromSheet(
  sheet: Texture,
  text: string,
  options: BitmapTextOptions = {},
): Container {
  textureNearest(sheet);
  const scale = options.scale ?? 1;
  const gap = options.letterSpacing ?? 1;
  const advance = Math.round((BITMAP_FONT.glyphW + gap) * scale);
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
    textureNearest(sprite.texture);
    container.addChild(sprite);
    x += advance;
  }
  return container;
}

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
