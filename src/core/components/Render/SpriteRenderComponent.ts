import { Graphics, Sprite, Assets } from "pixi.js";
import { RenderComponent } from "./RenderComponent";
import type { RenderOptions } from "./RenderComponent";
import { pixelTexture } from "../../ui/pixelTexture";

export class SpriteRenderComponent extends RenderComponent {
  private sprite: Sprite | null = null;
  private texturePath: string;
  private isDestroyed: boolean = false;

  constructor(texturePath: string, renderOptions: RenderOptions = {}) {
    super(renderOptions);
    this.texturePath = texturePath;
  }

  createGraphics(): Graphics {
    // Create empty graphics container first
    const graphics = new Graphics();

    // Load texture asynchronously
    Assets.load(this.texturePath)
      .then((texture) => {
        if (this.isDestroyed || graphics.destroyed) {
          return;
        }

        pixelTexture(texture);
        this.sprite = new Sprite(texture);
        this.sprite.roundPixels = true;
        this.sprite.alpha = this.renderOptions.alpha ?? 1;
        this.sprite.visible = this.renderOptions.visible ?? true;
        graphics.addChild(this.sprite);
      })
      .catch((error) => {
        console.error(`Failed to load sprite: ${this.texturePath}`, error);
      });

    return graphics;
  }

  override onDestroy(): void {
    this.isDestroyed = true;

    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
    super.onDestroy();
  }
}
