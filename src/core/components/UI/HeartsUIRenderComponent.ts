import { Graphics, Sprite, Assets } from "pixi.js";
import { SPRITE_SIZE } from "../../consts";
import { TEXTURE_HEART } from "../../../game/publicAssets";
import { RenderComponent } from "../Render/RenderComponent";
import type { RenderOptions } from "../Render/RenderComponent";
import { textureNearest } from "../../ui/textureNearest";

export class HeartsUIRenderComponent extends RenderComponent {
  private hearts: number;
  private heartSize: number;
  private spacing: number;

  constructor(
    hearts: number = 3,
    heartSize: number = SPRITE_SIZE,
    spacing: number = 8,
    renderOptions: RenderOptions = {},
  ) {
    super(renderOptions);
    this.hearts = hearts;
    this.heartSize = heartSize;
    this.spacing = spacing;
  }

  createGraphics(): Graphics {
    const container = new Graphics();
    this.loadAndDrawHearts(container);
    return container;
  }

  setHearts(hearts: number): void {
    this.hearts = Math.max(0, hearts);

    if (this.graphics && this.graphics instanceof Graphics) {
      this.graphics.removeChildren();
      this.loadAndDrawHearts(this.graphics);
    }
  }

  getHearts(): number {
    return this.hearts;
  }

  private loadAndDrawHearts(container: Graphics): void {
    Assets.load(TEXTURE_HEART)
      .then((texture) => {
        textureNearest(texture);
        for (let i = 0; i < this.hearts; i += 1) {
          const sprite = new Sprite(texture);
          sprite.roundPixels = true;
          sprite.width = this.heartSize;
          sprite.height = this.heartSize;
          sprite.x = i * (this.heartSize + this.spacing);
          sprite.y = 0;
          container.addChild(sprite);
        }
      })
      .catch((error) => {
        console.error(
          `Failed to load heart texture: ${TEXTURE_HEART}`,
          error,
        );
      });
  }
}
