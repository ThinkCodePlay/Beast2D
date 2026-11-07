/* consts.ts */
// Core constants for the Beast2D engine

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

/** Textures fitted for SPRITE_SIZE (see scripts/compress_display_png.py). */
export const TEXTURE_BEAST_SHIP = "BeastShip.32x32.png";
export const TEXTURE_HEART = "HeartBeast.32x32.png";
export const TEXTURE_BUNNY_WALK_ANIMATION = "bunny-walk-animation.64x64.png";
export const TEXTURE_BUNNY_IDLE = "BunnyIdle.png";
/** Bunny Hop level uses 64×64 frames from the walk spritesheet (1×18 strip). */
export const BUNNY_SPRITE_SIZE = 64;
export const BUNNY_WALK_ANIMATION_COLUMNS = 18;
export const BUNNY_WALK_ANIMATION_FRAME_COUNT = 18;
export const TEXTURE_STARS_LAYER_1 = "background/Stars-Big_1_1_PC.320x240.png";
export const TEXTURE_STARS_LAYER_2 = "background/Stars-Big_1_2_PC.320x240.png";

export const TEXTURE_SHOOTER_BULLET = "space-shooter/bullet.16x16.png";
export const TEXTURE_SHOOTER_HUD = "space-shooter/ui/hud-band.320x16.png";
export const TEXTURE_SHOOTER_PANEL = "space-shooter/ui/panel-9slice.24x24.png";
export const TEXTURE_SHOOTER_BUTTON = "space-shooter/ui/button.48x16.png";
export const TEXTURE_SHOOTER_FONT = "space-shooter/ui/font-atlas.5x7.png";

export const TEXTURE_ENEMY_SCOUT_SHEET =
  "space-shooter/enemies/scout-sheet.32x32.png";
export const TEXTURE_ENEMY_CRUISER_SHEET =
  "space-shooter/enemies/cruiser-sheet.32x32.png";
export const TEXTURE_ENEMY_DRIFTER_SHEET =
  "space-shooter/enemies/drifter-sheet.32x32.png";

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
