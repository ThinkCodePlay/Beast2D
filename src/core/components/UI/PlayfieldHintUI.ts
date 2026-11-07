import { GameObject } from "../../GameObject";
import { TransformComponent } from "../Movement/TransformComponent";
import { PlayfieldHintUIRenderComponent } from "./PlayfieldHintUIRenderComponent";
import { DISPLAY_WIDTH } from "../../consts";
import { HUD_HEIGHT } from "../../ui/hudLayout";

/** Short centered prompt below the HUD (not in the 16px header strip). */
export class PlayfieldHintUI extends GameObject {
  private static current: PlayfieldHintUI | null = null;
  private renderComponent: PlayfieldHintUIRenderComponent;

  constructor(message = "") {
    super();
    this.name = "PlayfieldHintUI";
    this.runWhenPaused = true;
    PlayfieldHintUI.current = this;

    this.addComponent(
      new TransformComponent(DISPLAY_WIDTH / 2, HUD_HEIGHT + 2),
    );
    this.renderComponent = this.addComponent(
      new PlayfieldHintUIRenderComponent(message),
    );
  }

  static setMessage(message: string): void {
    PlayfieldHintUI.current?.setMessage(message);
  }

  setMessage(message: string): void {
    this.renderComponent.setMessage(message);
  }

  protected override onDestroy(): void {
    if (PlayfieldHintUI.current === this) {
      PlayfieldHintUI.current = null;
    }
    super.onDestroy();
  }
}
