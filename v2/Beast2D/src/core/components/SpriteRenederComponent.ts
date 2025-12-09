import { Graphics, Sprite, Assets } from "pixi.js";
import { RenderComponent } from "./RenderComponent";
import type { RenderOptions } from "./RenderComponent";

export class SpriteRenderComponent extends RenderComponent {
  private sprite: Sprite | null = null;
  private texturePath: string;

  constructor(texturePath: string, renderOptions: RenderOptions = {}) {
    super(renderOptions);
    this.texturePath = texturePath;
  }

  createGraphics(): Graphics {
    // Create empty graphics container first
    const graphics = new Graphics();
    
    // Load texture asynchronously
    Assets.load(this.texturePath).then((texture) => {
      this.sprite = new Sprite(texture);
    //   this.sprite.anchor.set(0.5);
      this.sprite.alpha = this.renderOptions.alpha ?? 1;
      this.sprite.visible = this.renderOptions.visible ?? true;
      graphics.addChild(this.sprite);
    }).catch((error) => {
      console.error(`Failed to load sprite: ${this.texturePath}`, error);
    });
    
    return graphics;
  }

  override destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
    super.destroy();
  }
}
