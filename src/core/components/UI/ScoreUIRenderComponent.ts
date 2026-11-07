import { Graphics } from "pixi.js";
import { Beast2D16 } from "../../palette/beast2d16";
import {
  buildBitmapText,
  estimateBitmapTextWidth,
} from "../../ui/BitmapText";
import {
  formatHudScore,
  HUD_LETTER_SPACING,
  HUD_TEXT_SCALE,
} from "../../ui/hudLayout";
import { RenderComponent } from "../Render/RenderComponent";
import type { RenderOptions } from "../Render/RenderComponent";

export class ScoreUIRenderComponent extends RenderComponent {
  private score: number;
  private label: string;
  private compactHud: boolean;
  private textHost: Graphics | null = null;

  constructor(
    score: number = 0,
    label: string = "SCORE",
    renderOptions: RenderOptions & { compactHud?: boolean } = {},
  ) {
    super({
      color: Beast2D16.Cream,
      ...renderOptions,
    });
    this.score = score;
    this.label = label;
    this.compactHud = renderOptions.compactHud ?? true;
  }

  createGraphics(): Graphics {
    const graphics = new Graphics();
    this.drawScore(graphics);
    return graphics;
  }

  setScore(score: number): void {
    this.score = Math.max(0, score);
    this.refresh();
  }

  getScore(): number {
    return this.score;
  }

  private refresh(): void {
    if (!this.graphics || !(this.graphics instanceof Graphics)) return;

    if (this.textHost?.parent === this.graphics) {
      this.graphics.removeChild(this.textHost);
      this.textHost.destroy({ children: true });
      this.textHost = null;
    }

    this.drawScore(this.graphics);
  }

  private drawScore(graphics: Graphics): void {
    const host = new Graphics();
    const line = this.compactHud
      ? formatHudScore(this.score, this.label)
      : `${this.label}: ${this.score}`;
    const text = buildBitmapText(line, {
      scale: HUD_TEXT_SCALE,
      tint: this.renderOptions.color ?? Beast2D16.Cream,
      letterSpacing: HUD_LETTER_SPACING,
    });
    const w = estimateBitmapTextWidth(
      line,
      HUD_LETTER_SPACING,
      HUD_TEXT_SCALE,
    );
    text.x = this.compactHud ? -w : 0;
    text.y = 0;
    host.addChild(text);
    graphics.addChild(host);
    this.textHost = host;
  }

  override onDestroy(): void {
    this.textHost?.destroy({ children: true });
    this.textHost = null;
    super.onDestroy();
  }
}
