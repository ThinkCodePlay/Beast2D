/* consts.ts */
// Core constants for the Beast2D engine

export const ObjectNames = {
  LevelRoot: "LevelRoot",
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
