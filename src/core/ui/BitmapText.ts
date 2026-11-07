import { Assets, Container, Rectangle, Sprite, Texture } from "pixi.js";
import { BITMAP_FONT } from "./fontGlyphs";

let atlasTexture: Texture | null = null;
let atlasLoad: Promise<Texture> | null = null;

function loadAtlas(): Promise<Texture> {
  if (atlasTexture) return Promise.resolve(atlasTexture);
  if (!atlasLoad) {
    atlasLoad = Assets.load(BITMAP_FONT.atlasPath).then((tex) => {
      atlasTexture = tex as Texture;
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

export function bitmapGlyphAdvance(
  letterSpacing = 1,
  scale = 1,
): number {
  return (BITMAP_FONT.glyphW + letterSpacing) * scale;
}

export function estimateBitmapTextWidth(
  text: string,
  letterSpacing = 0,
  scale = 1,
): number {
  const advance = bitmapGlyphAdvance(letterSpacing, scale);
  return Math.max(0, text.length * advance - letterSpacing * scale);
}

/** Draw bitmap glyphs into a container (call after loadAtlas). */
export function buildBitmapText(
  text: string,
  options: BitmapTextOptions = {},
): Container {
  const scale = options.scale ?? 1;
  const spacing = bitmapGlyphAdvance(options.letterSpacing ?? 0, scale);
  const container = new Container();
  void loadAtlas().then((sheet) => {
    if (container.destroyed) return;
    let x = 0;
    for (const ch of text.toUpperCase()) {
      const pos = BITMAP_FONT.glyphs[ch] ?? BITMAP_FONT.glyphs[" "];
      if (!pos) continue;
      const frame = new Texture({
        source: sheet.source,
        frame: new Rectangle(
          pos.x,
          pos.y,
          BITMAP_FONT.glyphW,
          BITMAP_FONT.glyphH,
        ),
      });
      const sprite = new Sprite(frame);
      sprite.texture.source.scaleMode = "nearest";
      sprite.scale.set(scale);
      if (options.tint !== undefined) sprite.tint = options.tint;
      sprite.x = x;
      sprite.y = 0;
      container.addChild(sprite);
      x += spacing;
    }
  });
  return container;
}

export async function preloadBitmapFont(): Promise<void> {
  await loadAtlas();
}
