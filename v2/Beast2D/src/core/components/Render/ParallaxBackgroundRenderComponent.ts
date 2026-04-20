import { Assets, Container, Sprite, Texture } from "pixi.js";
import { Component } from "../Component";
import { Globals } from "../../Globals";

export interface ParallaxLayerConfig {
  texturePath: string;
  speed?: number; // Used when direction is set (vertical by default)
  speedX?: number; // Horizontal speed (overrides speed if set)
  speedY?: number; // Vertical speed (overrides speed if set)
  direction?: "vertical" | "horizontal"; // Default: "vertical"
  alpha?: number;
}

interface LayerRuntime {
  speedX: number;
  speedY: number;
  sprites: [Sprite, Sprite];
}

export class ParallaxBackgroundRenderComponent extends Component {
  private layerContainer: Container | null = null;
  private readonly layersConfig: ParallaxLayerConfig[];
  private layers: LayerRuntime[] = [];
  private isDestroyed: boolean = false;

  constructor(layersConfig: ParallaxLayerConfig[]) {
    super();
    this.layersConfig = layersConfig;
  }

  override init(): void {
    if (!this.gameObject) return;

    this.layerContainer = new Container();
    this.gameObject.container.addChild(this.layerContainer);

    void this.buildLayers();
  }

  override update(deltaTime: number): void {
    const canvasWidth = Globals.canvasWidth;
    const canvasHeight = Globals.canvasHeight;

    for (const layer of this.layers) {
      const offsetX = layer.speedX * deltaTime;
      const offsetY = layer.speedY * deltaTime;
      const [sprite1, sprite2] = layer.sprites;

      // Horizontal wrapping
      if (offsetX !== 0) {
        sprite1.x += offsetX;
        sprite2.x += offsetX;

        if (sprite1.x >= canvasWidth) {
          sprite1.x -= canvasWidth * 2;
        } else if (sprite1.x < -canvasWidth) {
          sprite1.x += canvasWidth * 2;
        }

        if (sprite2.x >= canvasWidth) {
          sprite2.x -= canvasWidth * 2;
        } else if (sprite2.x < -canvasWidth) {
          sprite2.x += canvasWidth * 2;
        }
      }

      // Vertical wrapping
      if (offsetY !== 0) {
        sprite1.y += offsetY;
        sprite2.y += offsetY;

        if (sprite1.y >= canvasHeight) {
          sprite1.y -= canvasHeight * 2;
        } else if (sprite1.y < -canvasHeight) {
          sprite1.y += canvasHeight * 2;
        }

        if (sprite2.y >= canvasHeight) {
          sprite2.y -= canvasHeight * 2;
        } else if (sprite2.y < -canvasHeight) {
          sprite2.y += canvasHeight * 2;
        }
      }
    }
  }

  override destroy(): void {
    this.isDestroyed = true;

    if (this.layerContainer && this.gameObject) {
      this.gameObject.container.removeChild(this.layerContainer);
      this.layerContainer.destroy({ children: true });
      this.layerContainer = null;
    }

    this.layers = [];
  }

  private async buildLayers(): Promise<void> {
    if (!this.layerContainer) return;

    const textures = await Promise.all(
      this.layersConfig.map(({ texturePath }) => Assets.load(texturePath)),
    );

    if (this.isDestroyed || !this.layerContainer) {
      return;
    }

    const canvasWidth = Globals.canvasWidth;
    const canvasHeight = Globals.canvasHeight;

    for (let i = 0; i < textures.length; i += 1) {
      const texture = textures[i] as Texture;
      const config = this.layersConfig[i];

      const spriteA = this.createLayerSprite(
        texture,
        canvasWidth,
        canvasHeight,
      );
      const spriteB = this.createLayerSprite(
        texture,
        canvasWidth,
        canvasHeight,
      );

      // Parse speeds from config
      const direction = config.direction ?? "vertical";
      const baseSpeed = config.speed ?? 0;

      let speedX = 0;
      let speedY = 0;

      if (config.speedX !== undefined) {
        speedX = config.speedX;
      } else if (config.speedY !== undefined) {
        speedY = config.speedY;
      } else if (direction === "vertical") {
        speedY = baseSpeed;
      } else if (direction === "horizontal") {
        speedX = baseSpeed;
      }

      // Position sprites based on direction
      if (direction === "horizontal") {
        spriteA.x = 0;
        spriteB.x = -canvasWidth;
        spriteA.y = 0;
        spriteB.y = 0;
      } else {
        spriteA.y = 0;
        spriteB.y = -canvasHeight;
        spriteA.x = 0;
        spriteB.x = 0;
      }

      const alpha = config.alpha ?? 1;
      spriteA.alpha = alpha;
      spriteB.alpha = alpha;

      this.layerContainer.addChild(spriteA, spriteB);
      this.layers.push({
        speedX,
        speedY,
        sprites: [spriteA, spriteB],
      });
    }
  }

  private createLayerSprite(
    texture: Texture,
    canvasWidth: number,
    canvasHeight: number,
  ): Sprite {
    const sprite = new Sprite(texture);
    sprite.width = canvasWidth;
    sprite.height = canvasHeight;
    sprite.x = 0;
    return sprite;
  }
}
