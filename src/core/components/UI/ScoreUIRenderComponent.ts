import { Container, Graphics } from "pixi.js";
import { RenderComponent } from "../Render/RenderComponent";
import type { RenderOptions } from "../Render/RenderComponent";
import { Beast2D16 } from "../../palette/beast2d16";
import {
  buildBitmapTextReady,
  measureBitmapText,
  preloadBitmapFont,
} from "../../ui/BitmapText";

export class ScoreUIRenderComponent extends RenderComponent {
  private score: number;
  private label: string;
  private textHost: Container | null = null;
  private paintToken = 0;

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
    this.label = label.toUpperCase();
  }

  createGraphics(): Graphics {
    const graphics = new Graphics();
    void this.paint(graphics);
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
    if (this.textHost) {
      this.graphics.removeChild(this.textHost);
      this.textHost.destroy({ children: true });
      this.textHost = null;
    }
    void this.paint(this.graphics);
  }

  private async paint(graphics: Graphics): Promise<void> {
    const token = ++this.paintToken;
    await preloadBitmapFont();
    if (token !== this.paintToken || graphics.destroyed) return;

    const line = `${this.label} ${this.score}`;
    const opts = { scale: 1, tint: Beast2D16.Cream, letterSpacing: 1 };
    const text = await buildBitmapTextReady(line, opts);
    text.x = Math.round(-measureBitmapText(line, opts));
    text.y = 2;
    graphics.addChild(text);
    this.textHost = text;
  }

  override onDestroy(): void {
    if (this.textHost) {
      this.textHost.destroy({ children: true });
      this.textHost = null;
    }
    super.onDestroy();
  }
}
