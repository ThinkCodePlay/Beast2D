/**
 * Breakout-only: one line of bitmap help text just below the 16px HUD (serve / restart).
 * Not a general engine widget — keeps prompts out of the score/lives header band.
 */
import { GameObject } from "../../core/GameObject";
import { DISPLAY_WIDTH, PLAYFIELD_TOP } from "../../core/consts";
import { TransformComponent } from "../../core/components/Movement/TransformComponent";
import { BreakoutPlayfieldHintRender } from "./BreakoutPlayfieldHintRender";

export class BreakoutPlayfieldHint extends GameObject {
  private static current: BreakoutPlayfieldHint | null = null;
  private readonly render: BreakoutPlayfieldHintRender;

  constructor(message = "") {
    super();
    this.name = "BreakoutPlayfieldHint";
    this.runWhenPaused = true;
    BreakoutPlayfieldHint.current = this;
    this.addComponent(new TransformComponent(DISPLAY_WIDTH / 2, PLAYFIELD_TOP + 2));
    this.render = this.addComponent(new BreakoutPlayfieldHintRender(message));
  }

  static setMessage(message: string): void {
    BreakoutPlayfieldHint.current?.setMessage(message);
  }

  setMessage(message: string): void {
    this.render.setMessage(message);
  }

  protected override onDestroy(): void {
    if (BreakoutPlayfieldHint.current === this) {
      BreakoutPlayfieldHint.current = null;
    }
    super.onDestroy();
  }
}
