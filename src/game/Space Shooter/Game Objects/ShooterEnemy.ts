import { GameObject } from "../../../core/GameObject";
import { TransformComponent } from "../../../core/components/Movement/TransformComponent";
import { SpritesheetAnimationRenderComponent } from "../../../core/components/Render/SpritesheetAnimationRenderComponent";
import { VerticalMoveComponent } from "../../../core/components/Movement/VerticalMoveComponent";
import { DestroyOutOfBoundsComponent } from "../../../core/components/Behavior/DestroyBelowScreenComponent";
import { SquareColliderComponent } from "../../../core/components/Collision/SquareColliderComponent";
import {
  CollisionLayers,
  ColliderModes,
  PLAYFIELD_TOP,
  SPRITE_SIZE,
  TEXTURE_ENEMY_CRUISER_SHEET,
  TEXTURE_ENEMY_DRIFTER_SHEET,
  TEXTURE_ENEMY_SCOUT_SHEET,
} from "../../../core/consts";
import { Globals } from "../../../core/Globals";
import { EXHAUST_PUFF, EXPLOSION_SMALL } from "../../../core/effects/PixelEffectPresets";
import { spawnPixelBurst } from "../../../core/effects/spawnEffect";
import { ShooterPlayfield } from "./ShooterPlayfield";

export type EnemyKind = "scout" | "cruiser" | "drifter";

const ENEMY_DEFS: Record<
  EnemyKind,
  { texture: string; frames: number; speed: number; animSpeed: number }
> = {
  scout: {
    texture: `/${TEXTURE_ENEMY_SCOUT_SHEET}`,
    frames: 2,
    speed: 2.2,
    animSpeed: 0.25,
  },
  cruiser: {
    texture: `/${TEXTURE_ENEMY_CRUISER_SHEET}`,
    frames: 2,
    speed: 1.4,
    animSpeed: 0.15,
  },
  drifter: {
    texture: `/${TEXTURE_ENEMY_DRIFTER_SHEET}`,
    frames: 3,
    speed: 1.8,
    animSpeed: 0.12,
  },
};

export class ShooterEnemy extends GameObject {
  static spawnBurst(kind: EnemyKind, x: number, y: number): void {
    const host = ShooterPlayfield.current;
    if (!host) return;
    const wx = x + SPRITE_SIZE / 2;
    const wy = y + SPRITE_SIZE / 2;
    spawnPixelBurst(host, wx, wy, EXPLOSION_SMALL);
    if (kind === "cruiser") {
      spawnPixelBurst(host, wx, y + SPRITE_SIZE - 4, EXHAUST_PUFF);
    }
  }

  constructor(x: number, y: number, kind: EnemyKind) {
    super();
    this.name = `Enemy_${kind}`;
    const def = ENEMY_DEFS[kind];

    this.addComponent(new TransformComponent(x, y));
    this.addComponent(
      new SpritesheetAnimationRenderComponent({
        defaultClip: "fly",
        clips: {
          fly: {
            texturePath: def.texture,
            frameWidth: SPRITE_SIZE,
            frameHeight: SPRITE_SIZE,
            columns: def.frames,
            frameCount: def.frames,
            animationSpeed: def.animSpeed,
            loop: true,
          },
        },
      }),
    );
    this.addComponent(new VerticalMoveComponent(def.speed));
    this.addComponent(
      new SquareColliderComponent(SPRITE_SIZE, SPRITE_SIZE, {
        layer: CollisionLayers.Enemy,
        mode: ColliderModes.Passive,
      }),
    );
    this.addComponent(
      new DestroyOutOfBoundsComponent({
        minX: -SPRITE_SIZE,
        maxX: Globals.canvasWidth + SPRITE_SIZE,
        minY: PLAYFIELD_TOP - SPRITE_SIZE,
        maxY: Globals.canvasHeight + SPRITE_SIZE,
      }),
    );
  }

  static randomKind(): EnemyKind {
    const kinds: EnemyKind[] = ["scout", "cruiser", "drifter"];
    return kinds[Math.floor(Math.random() * kinds.length)]!;
  }
}
