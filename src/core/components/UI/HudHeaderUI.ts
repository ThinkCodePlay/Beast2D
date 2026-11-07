import { GameObject } from "../../GameObject";
import { TransformComponent } from "../Movement/TransformComponent";
import { HudHeaderUIRenderComponent } from "./HudHeaderUIRenderComponent";
import type { RenderOptions } from "../Render/RenderComponent";
import { HUD_CONTRACT } from "../../ui/hudContract";

/**
 * Single 320×16 HUD band: lives left, `SCORE <n>` right-aligned.
 * Registers as the active score/lives provider for static HUD APIs.
 */
export class HudHeaderUI extends GameObject {
  private static current: HudHeaderUI | null = null;
  private renderComponent: HudHeaderUIRenderComponent;

  constructor(
    score: number = 0,
    hearts: number = HUD_CONTRACT.defaultLives,
    renderOptions: RenderOptions = {},
  ) {
    super();
    this.name = "HudHeaderUI";
    this.runWhenPaused = true;
    HudHeaderUI.current = this;

    this.addComponent(new TransformComponent(0, 0));
    this.renderComponent = this.addComponent(
      new HudHeaderUIRenderComponent(hearts, score, renderOptions),
    );
  }

  static isActive(): boolean {
    return HudHeaderUI.current !== null;
  }

  static addScore(amount: number): number {
    if (!HudHeaderUI.current) return 0;
    const next = HudHeaderUI.current.getScore() + amount;
    HudHeaderUI.current.setScore(next);
    return next;
  }

  static getScore(): number {
    return HudHeaderUI.current?.getScore() ?? 0;
  }

  static resetScore(score: number = 0): void {
    HudHeaderUI.current?.setScore(score);
  }

  static decreaseHearts(amount: number = 1): number {
    if (!HudHeaderUI.current) return 0;
    const next = HudHeaderUI.current.getHearts() - amount;
    HudHeaderUI.current.setHearts(next);
    return next;
  }

  static getHearts(): number {
    return HudHeaderUI.current?.getHearts() ?? 0;
  }

  setScore(score: number): void {
    this.renderComponent.setScore(score);
  }

  getScore(): number {
    return this.renderComponent.getScore();
  }

  setHearts(hearts: number): void {
    this.renderComponent.setHearts(hearts);
  }

  getHearts(): number {
    return this.renderComponent.getHearts();
  }

  protected override onDestroy(): void {
    if (HudHeaderUI.current === this) {
      HudHeaderUI.current = null;
    }
    super.onDestroy();
  }
}
