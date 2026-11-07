import { GameObject } from "../../GameObject";
import { TransformComponent } from "../Movement/TransformComponent";
import { HudLivesUIRenderComponent } from "./HudLivesUIRenderComponent";
import {
  hudLivesAnchorX,
  hudTextY,
} from "../../ui/hudLayout";

export class HudLivesUI extends GameObject {
  private static current: HudLivesUI | null = null;
  private renderComponent: HudLivesUIRenderComponent;

  constructor(lives = 3) {
    super();
    this.name = "HudLivesUI";
    this.runWhenPaused = true;
    HudLivesUI.current = this;

    this.addComponent(new TransformComponent(hudLivesAnchorX(), hudTextY()));
    this.renderComponent = this.addComponent(new HudLivesUIRenderComponent(lives));
  }

  static setLives(lives: number): void {
    HudLivesUI.current?.setLives(lives);
  }

  static getLives(): number {
    return HudLivesUI.current?.getLives() ?? 0;
  }

  setLives(lives: number): void {
    this.renderComponent.setLives(lives);
  }

  getLives(): number {
    return this.renderComponent.getLives();
  }

  protected override onDestroy(): void {
    if (HudLivesUI.current === this) {
      HudLivesUI.current = null;
    }
    super.onDestroy();
  }
}
