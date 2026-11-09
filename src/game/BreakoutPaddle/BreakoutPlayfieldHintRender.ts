import { Graphics } from "pixi.js";
import { Beast2D16 } from "../../core/ui/palette";
import {
  buildBitmapTextReady,
  measureBitmapText,
  preloadBitmapFont,
} from "../../core/ui/BitmapText";
import { HUD_LAYOUT } from "../../core/ui/hudLayout";
import { RenderComponent } from "../../core/components/Render/RenderComponent";

export class BreakoutPlayfieldHintRender extends RenderComponent {
  private static hintTextReady = false;
  private message: string;
  private textHost: Graphics | null = null;
  private paintToken = 0;

  static isTextReady(): boolean {
    return BreakoutPlayfieldHintRender.hintTextReady;
  }

  constructor(message: string) {
    super({ color: Beast2D16.Cream });
    this.message = message;
  }

  createGraphics(): Graphics {
    const graphics = new Graphics();
    void this.drawMessage(graphics);
    return graphics;
  }

  setMessage(message: string): void {
    this.message = message;
    BreakoutPlayfieldHintRender.hintTextReady = false;
    this.refresh();
  }

  private refresh(): void {
    if (!this.graphics || !(this.graphics instanceof Graphics)) return;
    if (this.textHost?.parent === this.graphics) {
      this.graphics.removeChild(this.textHost);
      this.textHost.destroy({ children: true });
      this.textHost = null;
    }
    void this.drawMessage(this.graphics);
  }

  private async drawMessage(graphics: Graphics): Promise<void> {
    const token = ++this.paintToken;
    const host = new Graphics();
    if (!this.message) {
      BreakoutPlayfieldHintRender.hintTextReady = true;
      graphics.addChild(host);
      this.textHost = host;
      return;
    }

    await preloadBitmapFont();
    if (token !== this.paintToken || graphics.destroyed) return;

    const line = this.message.toUpperCase();
    const opts = {
      scale: HUD_LAYOUT.fontScale,
      tint: Beast2D16.Cream,
      letterSpacing: HUD_LAYOUT.fontLetterSpacing,
    };
    const text = await buildBitmapTextReady(line, opts);
    if (token !== this.paintToken || graphics.destroyed) {
      text.destroy({ children: true });
      return;
    }
    text.x = -measureBitmapText(line, opts) / 2;
    host.addChild(text);
    graphics.addChild(host);
    this.textHost = host;
    BreakoutPlayfieldHintRender.hintTextReady = true;
  }

  override onDestroy(): void {
    this.textHost?.destroy({ children: true });
    super.onDestroy();
  }
}
