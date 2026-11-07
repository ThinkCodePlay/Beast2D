import { SCALE_MODES, type Texture } from "pixi.js";

/** Force crisp pixel sampling on a loaded texture (Pixi v8). */
export function textureNearest(texture: Texture): void {
  texture.source.style.scaleMode = SCALE_MODES.NEAREST;
}
