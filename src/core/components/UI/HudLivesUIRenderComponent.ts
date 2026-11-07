import { Graphics } from "pixi.js";
import { Beast2D16 } from "../../palette/beast2d16";
import { buildBitmapText } from "../../ui/BitmapText";
import {
  formatHudLives,
  HUD_LETTER_SPACING,
  HUD_TEXT_SCALE,
} from "../../ui/hudLayout";
import { RenderComponent } from "../Render/RenderComponent";

export class HudLivesUIRenderComponent extends RenderComponent {
  private lives: number;
  private textHost: Graphics | null = null;

  constructor(lives: number) {
    super({ color: Beast2D16.HotPink });
    this.lives = lives;
  }

  createGraphics(): Graphics {
    const graphics = new Graphics();
    this.drawLives(graphics);
    return graphics;
  }

  setLives(lives: number): void {
    this.lives = Math.max(0, lives);
    this.refresh();
  }

  getLives(): number {
    return this.lives;
  }

  private refresh(): void {
    if (!this.graphics || !(this.graphics instanceof Graphics)) return;
    if (this.textHost?.parent === this.graphics) {
      this.graphics.removeChild(this.textHost);
      this.textHost.destroy({ children: true });
      this.textHost = null;
    }
    this.drawLives(this.graphics);
  }

  private drawLives(graphics: Graphics): void {
    const host = new Graphics();
    const text = buildBitmapText(formatHudLives(this.lives), {
      scale: HUD_TEXT_SCALE,
      tint: Beast2D16.HotPink,
      letterSpacing: HUD_LETTER_SPACING,
    });
    text.x = 0;
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
