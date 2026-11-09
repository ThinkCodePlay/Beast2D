import { Graphics } from "pixi.js";
import { Component } from "../../../core/components/Component";
import type { PixelBurstPreset } from "./PixelEffectPresets";

export class PixelBurstEffectComponent extends Component {
  private graphics: Graphics;
  private frame = 0;

  private readonly preset: PixelBurstPreset;

  constructor(preset: PixelBurstPreset, graphics: Graphics) {
    super();
    this.preset = preset;
    this.graphics = graphics;
  }

  override update(_dt: number): void {
    this.frame += 1;
    const t = this.frame / this.preset.durationFrames;
    if (t >= 1) {
      this.gameObject?.destroy();
      return;
    }

    this.graphics.clear();
    const spread = 2 + t * 6;
    for (const p of this.preset.particles) {
      const px = Math.round(p.dx * spread);
      const py = Math.round(p.dy * spread);
      const alpha = 1 - t;
      this.graphics.rect(px, py, 2, 2).fill({ color: p.color, alpha });
    }
  }
}
