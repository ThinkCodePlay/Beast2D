import { Graphics } from "pixi.js";
import { Beast2D16 } from "../../palette/beast2d16";
import { buildBitmapText, measureBitmapText } from "../../ui/BitmapText";
import { HUD_CONTRACT } from "../../ui/hudContract";
import { RenderComponent } from "../Render/RenderComponent";
import type { RenderOptions } from "../Render/RenderComponent";

/** Legacy per-object score label when `HudHeaderUI` is not active (e.g. main-branch Space Shooter). */
export class ScoreUIRenderComponent extends RenderComponent {
  private score: number;
  private label: string;
  private textHost: Graphics | null = null;

  constructor(
    score: number = 0,
    label: string = "SCORE",
    renderOptions: RenderOptions = {},
  ) {
    super({
      color: Beast2D16.Cream,
      ...renderOptions,
    });
    this.score = score;
    this.label = label;
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
    const line = `${this.label} ${this.score}`;
    const opts = {
      scale: HUD_CONTRACT.fontScale,
      tint: HUD_CONTRACT.fontTint,
      letterSpacing: HUD_CONTRACT.fontLetterSpacing,
    };
    const text = buildBitmapText(line, opts);
    const w = measureBitmapText(line, opts);
    text.x = -w;
    text.y = HUD_CONTRACT.fontY;
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
