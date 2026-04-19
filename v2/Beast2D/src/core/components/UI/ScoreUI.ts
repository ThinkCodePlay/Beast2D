import { Container } from "pixi.js";
import { GameObject } from "../../GameObject";
import { TransformComponent } from "../Movement/TransformComponent";
import { ScoreUIRenderComponent } from "./ScoreUIRenderComponent";
import type { RenderOptions } from "../Render/RenderComponent";

export class ScoreUI extends GameObject {
  private static current: ScoreUI | null = null;
  private renderComponent: ScoreUIRenderComponent;

  constructor(
    container: Container,
    x: number,
    y: number,
    score: number = 0,
    label: string = "Score",
    renderOptions: RenderOptions = {},
  ) {
    super(container);
    this.name = "ScoreUI";
    ScoreUI.current = this;

    this.addComponent(new TransformComponent(x, y));
    this.renderComponent = this.addComponent(
      new ScoreUIRenderComponent(score, label, renderOptions),
    );
  }

  static addScore(amount: number): number {
    if (!ScoreUI.current) return 0;

    const next = ScoreUI.current.getScore() + amount;
    ScoreUI.current.setScore(next);
    return ScoreUI.current.getScore();
  }

  static getScore(): number {
    return ScoreUI.current?.getScore() ?? 0;
  }

  static resetScore(score: number = 0): void {
    ScoreUI.current?.setScore(score);
  }

  setScore(score: number): void {
    this.renderComponent.setScore(score);
  }

  getScore(): number {
    return this.renderComponent.getScore();
  }

  override destroy(): void {
    if (ScoreUI.current === this) {
      ScoreUI.current = null;
    }
    super.destroy();
  }
}
