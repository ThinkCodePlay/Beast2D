import {
  AnimatedSprite,
  Assets,
  Graphics,
  Rectangle,
  Texture,
  type Texture as PixiTexture,
} from "pixi.js";
import { RenderComponent } from "./RenderComponent";
import type { RenderOptions } from "./RenderComponent";

export interface SpritesheetAnimationConfig {
  frameWidth: number;
  frameHeight: number;
  columns: number;
  frameCount: number;
  animationSpeed?: number;
  loop?: boolean;
}

function buildGridFrames(
  sheet: PixiTexture,
  config: SpritesheetAnimationConfig,
): Texture[] {
  const frames: Texture[] = [];
  for (let i = 0; i < config.frameCount; i += 1) {
    const column = i % config.columns;
    const row = Math.floor(i / config.columns);
    frames.push(
      new Texture({
        source: sheet.source,
        frame: new Rectangle(
          column * config.frameWidth,
          row * config.frameHeight,
          config.frameWidth,
          config.frameHeight,
        ),
      }),
    );
  }
  return frames;
}

export class SpritesheetAnimationRenderComponent extends RenderComponent {
  private animated: AnimatedSprite | null = null;
  private texturePath: string;
  private animationConfig: SpritesheetAnimationConfig;
  private isDestroyed = false;

  constructor(
    texturePath: string,
    animationConfig: SpritesheetAnimationConfig,
    renderOptions: RenderOptions = {},
  ) {
    super(renderOptions);
    this.texturePath = texturePath;
    this.animationConfig = animationConfig;
  }

  createGraphics(): Graphics {
    const graphics = new Graphics();

    const attachAnimation = (sheet: PixiTexture) => {
      if (this.isDestroyed || graphics.destroyed) return;

      const frames = buildGridFrames(sheet, this.animationConfig);
      this.animated = new AnimatedSprite({
        textures: frames,
        animationSpeed: this.animationConfig.animationSpeed ?? 0.2,
        loop: this.animationConfig.loop ?? true,
        autoPlay: true,
      });
      this.animated.alpha = this.renderOptions.alpha ?? 1;
      this.animated.visible = this.renderOptions.visible ?? true;
      graphics.addChild(this.animated);
    };

    const cached = Assets.get<PixiTexture>(this.texturePath);
    if (cached) {
      attachAnimation(cached);
    } else {
      Assets.load(this.texturePath)
        .then(attachAnimation)
        .catch((error) => {
          console.error(
            `Failed to load spritesheet: ${this.texturePath}`,
            error,
          );
        });
    }

    return graphics;
  }

  override onDestroy(): void {
    this.isDestroyed = true;
    if (this.animated) {
      this.animated.destroy();
      this.animated = null;
    }
    super.onDestroy();
  }
}
