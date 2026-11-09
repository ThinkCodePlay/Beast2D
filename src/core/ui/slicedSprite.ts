import { Assets, Container, Rectangle, Sprite, Texture } from "pixi.js";
import { pixelTexture } from "./pixelTexture";

export interface SlicedSpriteOptions {
  texturePath: string;
  width: number;
  height: number;
  /** Corner + edge slice size in source pixels (8px grid). */
  slice: number;
}

function round8(n: number): number {
  return Math.max(8, Math.round(n / 8) * 8);
}

/**
 * Stretchable panel from a square source texture with uniform slice borders.
 */
export class SlicedSprite extends Container {
  private readonly options: SlicedSpriteOptions;

  constructor(options: SlicedSpriteOptions) {
    super();
    this.options = {
      ...options,
      width: round8(options.width),
      height: round8(options.height),
    };
    void this.build();
  }

  private async build(): Promise<void> {
    const sheet = (await Assets.load(this.options.texturePath)) as Texture;
    pixelTexture(sheet);
    if (this.destroyed) return;
    const s = this.options.slice;
    const texW = sheet.width;
    const texH = sheet.height;
    const width = this.options.width;
    const height = this.options.height;

    const regions: {
      sx: number;
      sy: number;
      sw: number;
      sh: number;
      dx: number;
      dy: number;
      dw: number;
      dh: number;
    }[] = [
      { sx: 0, sy: 0, sw: s, sh: s, dx: 0, dy: 0, dw: s, dh: s },
      {
        sx: s,
        sy: 0,
        sw: texW - s * 2,
        sh: s,
        dx: s,
        dy: 0,
        dw: width - s * 2,
        dh: s,
      },
      { sx: texW - s, sy: 0, sw: s, sh: s, dx: width - s, dy: 0, dw: s, dh: s },
      {
        sx: 0,
        sy: s,
        sw: s,
        sh: texH - s * 2,
        dx: 0,
        dy: s,
        dw: s,
        dh: height - s * 2,
      },
      {
        sx: s,
        sy: s,
        sw: texW - s * 2,
        sh: texH - s * 2,
        dx: s,
        dy: s,
        dw: width - s * 2,
        dh: height - s * 2,
      },
      {
        sx: texW - s,
        sy: s,
        sw: s,
        sh: texH - s * 2,
        dx: width - s,
        dy: s,
        dw: s,
        dh: height - s * 2,
      },
      { sx: 0, sy: texH - s, sw: s, sh: s, dx: 0, dy: height - s, dw: s, dh: s },
      {
        sx: s,
        sy: texH - s,
        sw: texW - s * 2,
        sh: s,
        dx: s,
        dy: height - s,
        dw: width - s * 2,
        dh: s,
      },
      {
        sx: texW - s,
        sy: texH - s,
        sw: s,
        sh: s,
        dx: width - s,
        dy: height - s,
        dw: s,
        dh: s,
      },
    ];

    for (const r of regions) {
      const frame = new Texture({
        source: sheet.source,
        frame: new Rectangle(r.sx, r.sy, r.sw, r.sh),
      });
      pixelTexture(frame);
      const spr = new Sprite(frame);
      spr.roundPixels = true;
      spr.x = Math.round(r.dx);
      spr.y = Math.round(r.dy);
      spr.width = Math.round(r.dw);
      spr.height = Math.round(r.dh);
      this.addChild(spr);
    }
  }
}
