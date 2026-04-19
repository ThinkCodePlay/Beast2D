import { Graphics, Text, TextStyle } from "pixi.js";
import { RenderComponent } from "../Render/RenderComponent";
import type { RenderOptions } from "../Render/RenderComponent";

export class ScoreUIRenderComponent extends RenderComponent {
  private score: number;
  private label: string;
  private textNode: Text | null = null;

  constructor(
    score: number = 0,
    label: string = "Score",
    renderOptions: RenderOptions = {},
  ) {
    super({
      color: 0xffffff,
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

    if (this.textNode && this.textNode.parent === this.graphics) {
      this.graphics.removeChild(this.textNode);
      this.textNode.destroy();
      this.textNode = null;
    }

    this.drawScore(this.graphics);
  }

  private drawScore(graphics: Graphics): void {
    this.textNode = new Text({
      text: `${this.label}: ${this.score}`,
      style: new TextStyle({
        fill: this.renderOptions.color,
        fontSize: 28,
        fontWeight: "700",
      }),
    });

    this.textNode.anchor.set(1, 0);
    this.textNode.x = 0;
    this.textNode.y = 0;
    graphics.addChild(this.textNode);
  }

  override destroy(): void {
    if (this.textNode) {
      this.textNode.destroy();
      this.textNode = null;
    }
    super.destroy();
  }
}
