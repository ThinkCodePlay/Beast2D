import { PIXEL_GRID, SPRITE_SIZE } from "../../consts";
import { GameObject } from "../../GameObject";
import { TransformComponent } from "../Movement/TransformComponent";
import { HeartsUIRenderComponent } from "./HeartsUIRenderComponent";
import type { RenderOptions } from "../Render/RenderComponent";

export class HeartsUI extends GameObject {
  private static current: HeartsUI | null = null;
  private renderComponent: HeartsUIRenderComponent;

  constructor(
    x: number = PIXEL_GRID,
    y: number = PIXEL_GRID,
    hearts: number = 3,
    heartSize: number = SPRITE_SIZE,
    spacing: number = PIXEL_GRID / 2,
    renderOptions: RenderOptions = {},
  ) {
    super();
    this.name = "HeartsUI";
    this.runWhenPaused = true;
    HeartsUI.current = this;

    this.addComponent(new TransformComponent(x, y));
    this.renderComponent = this.addComponent(
      new HeartsUIRenderComponent(hearts, heartSize, spacing, renderOptions),
    );
  }

  static decreaseHearts(amount: number = 1): number {
    if (!HeartsUI.current) return 0;

    const next = HeartsUI.current.getHearts() - amount;
    HeartsUI.current.setHearts(next);
    return HeartsUI.current.getHearts();
  }

  static getHearts(): number {
    return HeartsUI.current?.getHearts() ?? 0;
  }

  setHearts(hearts: number): void {
    this.renderComponent.setHearts(hearts);
  }

  getHearts(): number {
    return this.renderComponent.getHearts();
  }

  protected override onDestroy(): void {
    if (HeartsUI.current === this) {
      HeartsUI.current = null;
    }
    super.onDestroy();
  }
}
