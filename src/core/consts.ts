/* consts.ts — engine layout and collision identifiers (no per-level art paths). */

/** Fixed virtual resolution (fantasy-console style). Keep in sync with `main.ts` and `style.css`. */
export const DISPLAY_WIDTH = 320;
export const DISPLAY_HEIGHT = 240;

/** Art and layout snap to this pixel grid. Runtime sprite bitmaps are 32×32 (2×2 cells). Masters may stay at 64×64 in public/. */
export const PIXEL_GRID = 16;
export const SPRITE_SIZE = 32;

/** Top HUD band (score, lives). Playfield begins at y = HUD_HEIGHT. */
export const HUD_HEIGHT = PIXEL_GRID;
export const PLAYFIELD_TOP = HUD_HEIGHT;
export const PLAYFIELD_HEIGHT = DISPLAY_HEIGHT - HUD_HEIGHT;

export const ObjectNames = {
  LevelRoot: "LevelRoot",
  GameObject: "GameObject",
  BoxObject: "BoxObject",
  CircleObject: "CircleObject",
} as const;

export const ColliderModes = {
  Active: "active",
  Passive: "passive",
  Both: "both",
} as const;

export const CollisionLayers = {
  Default: "default",
  Bullet: "bullet",
  Enemy: "enemy",
  Player: "player",
} as const;
