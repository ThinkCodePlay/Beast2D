export const TRANSPORT_SPRITE_W = 32;
export const TRANSPORT_SPRITE_H = 28;

export type TransportSpriteId = "play" | "stop" | "loop";

const FILES: Record<TransportSpriteId, string> = {
  play: "play.png",
  stop: "stop.png",
  loop: "loop.png",
};

export function transportSpriteUrl(id: TransportSpriteId): string {
  return new URL(`../assets/sfx-transport/${FILES[id]}`, import.meta.url).href;
}
