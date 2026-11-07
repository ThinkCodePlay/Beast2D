import { Graphics } from "pixi.js";
import { Beast2D16 } from "../../palette/beast2d16";
import {
  buildBitmapText,
  estimateBitmapTextWidth,
} from "../../ui/BitmapText";
import { HUD_LETTER_SPACING, HUD_TEXT_SCALE } from "../../ui/hudLayout";
import { RenderComponent } from "../Render/RenderComponent";

export class PlayfieldHintUIRenderComponent extends RenderComponent {
  private message: string;
  private textHost: Graphics | null = null;

  constructor(message: string) {
    super({ color: Beast2D16.Cream });
    this.message = message;
  }

  createGraphics(): Graphics {
    const graphics = new Graphics();
    this.drawMessage(graphics);
    return graphics;
  }

  setMessage(message: string): void {
    this.message = message;
    this.refresh();
  }

  private refresh(): void {
    if (!this.graphics || !(this.graphics instanceof Graphics)) return;
    if (this.textHost?.parent === this.graphics) {
      this.graphics.removeChild(this.textHost);
      this.textHost.destroy({ children: true });
      this.textHost = null;
    }
    this.drawMessage(this.graphics);
  }

  private drawMessage(graphics: Graphics): void {
    const host = new Graphics();
    if (!this.message) {
      graphics.addChild(host);
      this.textHost = host;
      return;
    }

    const line = this.message.toUpperCase();
    const text = buildBitmapText(line, {
      scale: HUD_TEXT_SCALE,
      tint: Beast2D16.Cream,
      letterSpacing: HUD_LETTER_SPACING,
    });
    const w = estimateBitmapTextWidth(line, HUD_LETTER_SPACING, HUD_TEXT_SCALE);
    text.x = -w / 2;
    text.y = 0;
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
