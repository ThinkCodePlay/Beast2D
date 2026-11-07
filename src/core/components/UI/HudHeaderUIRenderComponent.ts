import { Assets, Container, Graphics, Sprite } from "pixi.js";
import { RenderComponent } from "../Render/RenderComponent";
import type { RenderOptions } from "../Render/RenderComponent";
import { HUD_CONTRACT, hudScoreMaxWidth } from "../../ui/hudContract";
import {
  buildBitmapTextReady,
  measureBitmapText,
  preloadBitmapFont,
} from "../../ui/BitmapText";
import { textureNearest } from "../../ui/textureNearest";

export class HudHeaderUIRenderComponent extends RenderComponent {
  private hearts: number;
  private score: number;
  private scoreHost: Container | null = null;
  private paintToken = 0;

  constructor(
    hearts: number = HUD_CONTRACT.defaultLives,
    score: number = 0,
    renderOptions: RenderOptions = {},
  ) {
    super(renderOptions);
    this.hearts = hearts;
    this.score = score;
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

    await Promise.all([
      preloadBitmapFont(),
      Assets.load(HUD_CONTRACT.bandTexture),
      Assets.load(HUD_CONTRACT.heartTexture),
    ]);
    if (token !== this.paintToken || root.destroyed) return;

    const bandTex = Assets.get(HUD_CONTRACT.bandTexture);
    if (bandTex) {
      textureNearest(bandTex);
      const band = new Sprite(bandTex);
      band.width = HUD_CONTRACT.width;
      band.height = HUD_CONTRACT.height;
      root.addChild(band);
    }

    const heartTex = Assets.get(HUD_CONTRACT.heartTexture);
    if (heartTex) {
      textureNearest(heartTex);
      const heartY = Math.floor(
        (HUD_CONTRACT.height - HUD_CONTRACT.heartSize) / 2,
      );
      for (let i = 0; i < this.hearts; i += 1) {
        const sprite = new Sprite(heartTex);
        sprite.width = HUD_CONTRACT.heartSize;
        sprite.height = HUD_CONTRACT.heartSize;
        sprite.x = Math.round(
          HUD_CONTRACT.livesLeftX +
            i * (HUD_CONTRACT.heartSize + HUD_CONTRACT.heartGap),
        );
        sprite.y = heartY;
        root.addChild(sprite);
      }
    }

    const line = `${HUD_CONTRACT.scoreLabel} ${this.score}`;
    const baseOpts = {
      scale: HUD_CONTRACT.fontScale,
      tint: HUD_CONTRACT.fontTint,
      letterSpacing: HUD_CONTRACT.fontLetterSpacing,
    };
    const maxW = hudScoreMaxWidth(this.hearts);
    let scale: number = HUD_CONTRACT.fontScale;
    const natural = measureBitmapText(line, baseOpts);
    if (natural > maxW) {
      scale = Math.max(1, Math.floor((maxW / natural) * HUD_CONTRACT.fontScale));
    }
    const opts = { ...baseOpts, scale };
    const drawn = await buildBitmapTextReady(line, opts);
    drawn.x = Math.round(HUD_CONTRACT.scoreRightX - measureBitmapText(line, opts));
    drawn.y = HUD_CONTRACT.fontY;
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
