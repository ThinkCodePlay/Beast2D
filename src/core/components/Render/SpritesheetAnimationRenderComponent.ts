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
import { textureNearest } from "../../ui/textureNearest";

export interface SpritesheetClipConfig {
  texturePath: string;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  frameCount: number;
  frameStart?: number;
  animationSpeed?: number;
  loop?: boolean;
}

export interface SpritesheetAnimationClipsOptions {
  clips: Record<string, SpritesheetClipConfig>;
  defaultClip: string;
}

function buildGridFrames(
  sheet: PixiTexture,
  config: SpritesheetClipConfig,
): Texture[] {
  const start = config.frameStart ?? 0;
  const frames: Texture[] = [];
  for (let i = 0; i < config.frameCount; i += 1) {
    const frameIndex = start + i;
    const column = frameIndex % config.columns;
    const row = Math.floor(frameIndex / config.columns);
    const frame = new Texture({
      source: sheet.source,
      frame: new Rectangle(
        column * config.frameWidth,
        row * config.frameHeight,
        config.frameWidth,
        config.frameHeight,
      ),
    });
    textureNearest(frame);
    frames.push(frame);
  }
  return frames;
}

export class SpritesheetAnimationRenderComponent extends RenderComponent {
  private animated: AnimatedSprite | null = null;
  private readonly clipsOptions: SpritesheetAnimationClipsOptions;
  private readonly clipFrames = new Map<string, Texture[]>();
  private isDestroyed = false;
  private horizontalFacing: 1 | -1 = 1;
  private currentClipName: string | null = null;
  private pendingClipName: string | null = null;

  constructor(
    clipsOptions: SpritesheetAnimationClipsOptions,
    renderOptions: RenderOptions = {},
  ) {
    super(renderOptions);
    if (!clipsOptions.clips[clipsOptions.defaultClip]) {
      throw new Error(
        `SpritesheetAnimationRenderComponent: unknown defaultClip "${clipsOptions.defaultClip}"`,
      );
    }
    this.clipsOptions = clipsOptions;
  }

  get currentClip(): string | null {
    return this.currentClipName;
  }

  createGraphics(): Graphics {
    const graphics = new Graphics();
    void this.loadClips(graphics);
    return graphics;
  }

  playClip(name: string, options: { restart?: boolean } = {}): void {
    if (!this.clipsOptions.clips[name]) {
      throw new Error(
        `SpritesheetAnimationRenderComponent: unknown clip "${name}"`,
      );
    }

    if (
      name === this.currentClipName &&
      !options.restart &&
      this.animated
    ) {
      return;
    }

    if (!this.animated || !this.clipFrames.has(name)) {
      this.pendingClipName = name;
      return;
    }

    this.applyClip(name, options.restart ?? true);
  }

  override setHorizontalFacing(direction: 1 | -1): void {
    this.horizontalFacing = direction;
    this.applyHorizontalFacing();
  }

  private async loadClips(graphics: Graphics): Promise<void> {
    const paths = new Set(
      Object.values(this.clipsOptions.clips).map((clip) => clip.texturePath),
    );

    try {
      await Promise.all(
        [...paths].map(async (path) => {
          const cached = Assets.get<PixiTexture>(path);
          if (cached) return;
          await Assets.load(path);
        }),
      );
    } catch (error) {
      console.error("Failed to load spritesheet clip textures", error);
      return;
    }

    if (this.isDestroyed || graphics.destroyed) return;

    for (const [name, config] of Object.entries(this.clipsOptions.clips)) {
      const sheet = Assets.get<PixiTexture>(config.texturePath);
      if (!sheet) continue;
      this.clipFrames.set(name, buildGridFrames(sheet, config));
    }

    const initialClip =
      this.pendingClipName ?? this.clipsOptions.defaultClip;
    this.pendingClipName = null;
    this.mountAnimatedSprite(graphics, initialClip);
  }

  private mountAnimatedSprite(graphics: Graphics, clipName: string): void {
    const frames = this.clipFrames.get(clipName);
    const config = this.clipsOptions.clips[clipName];
    if (!frames || !config) return;

    this.animated = new AnimatedSprite({
      textures: frames,
      animationSpeed: config.animationSpeed ?? 0.2,
      loop: config.loop ?? true,
      autoPlay: false,
    });
    this.animated.alpha = this.renderOptions.alpha ?? 1;
    this.animated.visible = this.renderOptions.visible ?? true;
    graphics.addChild(this.animated);
    this.currentClipName = clipName;
    this.startClipPlayback(config);
    this.applyHorizontalFacing();
  }

  private startClipPlayback(config: SpritesheetClipConfig): void {
    if (!this.animated) return;

    if (config.frameCount > 1) {
      this.animated.play();
      return;
    }

    this.animated.currentFrame = 0;
    this.animated.stop();
  }

  private applyClip(clipName: string, restart: boolean): void {
    const config = this.clipsOptions.clips[clipName];
    const frames = this.clipFrames.get(clipName);
    if (!this.animated || !frames) return;

    this.animated.textures = frames;
    this.animated.animationSpeed = config.animationSpeed ?? 0.2;
    this.animated.loop = config.loop ?? true;
    if (restart) {
      this.animated.currentFrame = 0;
    }
    this.startClipPlayback(config);
    this.currentClipName = clipName;
    this.applyHorizontalFacing();
  }

  private applyHorizontalFacing(): void {
    if (!this.animated || !this.currentClipName) return;

    const config = this.clipsOptions.clips[this.currentClipName];
    const width = config.frameWidth;
    this.animated.scale.x = this.horizontalFacing;
    this.animated.x = this.horizontalFacing === -1 ? width : 0;
  }

  override onDestroy(): void {
    this.isDestroyed = true;
    if (this.animated) {
      this.animated.destroy();
      this.animated = null;
    }
    this.clipFrames.clear();
    super.onDestroy();
  }
}
