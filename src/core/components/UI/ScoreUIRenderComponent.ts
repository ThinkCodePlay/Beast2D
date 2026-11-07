import { Graphics } from "pixi.js";
import { RenderComponent } from "../Render/RenderComponent";
import type { RenderOptions } from "../Render/RenderComponent";
import { Beast2D16 } from "../../palette/beast2d16";
import { buildBitmapText } from "../../ui/BitmapText";

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
      color: Beast2D16.HotPink,
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

    if (this.textHost && this.textHost.parent === this.graphics) {
      this.graphics.removeChild(this.textHost);
      this.textHost.destroy({ children: true });
      this.textHost = null;
    }

    this.drawScore(this.graphics);
  }

  private drawScore(graphics: Graphics): void {
    const line = `${this.label} ${this.score}`;
    const host = new Graphics();
    const text = buildBitmapText(line, {
      scale: 1,
      tint: Beast2D16.Cream,
      letterSpacing: 0,
    });
    const approxW = line.length * 7;
    text.x = -approxW;
    text.y = 0;
    host.addChild(text);
    graphics.addChild(host);
    this.textHost = host;
  }

  override onDestroy(): void {
    if (this.textHost) {
      this.textHost.destroy({ children: true });
      this.textHost = null;
    }
    super.onDestroy();
  }
}
