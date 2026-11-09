import { Assets, Container, Graphics, Sprite } from "pixi.js";
import { RenderComponent } from "../Render/RenderComponent";
import type { RenderOptions } from "../Render/RenderComponent";
import { TEXTURE_HEART } from "../../../game/publicAssets";
import { HUD_LAYOUT } from "../../ui/hudLayout";
import type { HudStyle } from "../../ui/hudStyle";
import {
  buildBitmapTextReady,
  measureBitmapText,
  preloadBitmapFont,
} from "../../ui/BitmapText";
import { formatHudScoreLine } from "../../ui/formatHudScore";
import { pixelTexture } from "../../ui/pixelTexture";

export class HudHeaderUIRenderComponent extends RenderComponent {
  private hearts: number;
  private score: number;
  private readonly theme: HudStyle;
  private scoreHost: Container | null = null;
  private paintToken = 0;

  constructor(
    hearts: number = HUD_LAYOUT.defaultLives,
    score: number = 0,
    theme: HudStyle,
    renderOptions: RenderOptions = {},
  ) {
    super(renderOptions);
    this.hearts = hearts;
    this.score = score;
    this.theme = theme;
  }

  createGraphics(): Graphics {
    const root = new Graphics();
    void this.paint(root);
    return root;
  }

  setHearts(hearts: number): void {
    this.hearts = Math.max(0, hearts);
    this.refresh();
  }

  getHearts(): number {
    return this.hearts;
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
    if (this.scoreHost) {
      this.scoreHost.destroy({ children: true });
      this.scoreHost = null;
    }
    this.graphics.removeChildren();
    void this.paint(this.graphics);
  }

  private async paint(root: Graphics): Promise<void> {
    const token = ++this.paintToken;
    const heartTexture = this.theme.heartTexture ?? TEXTURE_HEART;

    await Promise.all([
      preloadBitmapFont(),
      Assets.load(this.theme.bandTexture),
      Assets.load(heartTexture),
    ]);
    if (token !== this.paintToken || root.destroyed) return;

    const bandTex = Assets.get(this.theme.bandTexture);
    if (bandTex) {
      pixelTexture(bandTex);
      const band = new Sprite(bandTex);
      band.width = HUD_LAYOUT.width;
      band.height = HUD_LAYOUT.height;
      root.addChild(band);
    }

    const heartTex = Assets.get(heartTexture);
    if (heartTex) {
      pixelTexture(heartTex);
      const heartY = Math.floor(
        (HUD_LAYOUT.height - HUD_LAYOUT.heartSize) / 2,
      );
      for (let i = 0; i < this.hearts; i += 1) {
        const sprite = new Sprite(heartTex);
        sprite.width = HUD_LAYOUT.heartSize;
        sprite.height = HUD_LAYOUT.heartSize;
        sprite.x = Math.round(
          HUD_LAYOUT.livesLeftX +
            i * (HUD_LAYOUT.heartSize + HUD_LAYOUT.heartGap),
        );
        sprite.y = heartY;
        root.addChild(sprite);
      }
    }

    const line = formatHudScoreLine(this.score, this.hearts);
    const opts = {
      scale: this.theme.fontScale ?? HUD_LAYOUT.fontScale,
      tint: this.theme.fontTint,
      letterSpacing:
        this.theme.fontLetterSpacing ?? HUD_LAYOUT.fontLetterSpacing,
    };
    const drawn = await buildBitmapTextReady(line, opts);
    drawn.x = Math.round(
      HUD_LAYOUT.scoreRightX - measureBitmapText(line, opts),
    );
    drawn.y = HUD_LAYOUT.fontY;
    this.scoreHost = drawn;
    root.addChild(drawn);
  }

  override onDestroy(): void {
    if (this.scoreHost) {
      this.scoreHost.destroy({ children: true });
      this.scoreHost = null;
    }
    super.onDestroy();
  }
}
