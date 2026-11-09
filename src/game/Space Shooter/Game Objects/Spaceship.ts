import { GameObject } from "../../../core/GameObject";
import { TransformComponent } from "../../../core/components/Movement/TransformComponent";
import { SpriteRenderComponent } from "../../../core/components/Render/SpriteRenderComponent";
import type { RenderOptions } from "../../../core/components/Render/RenderComponent";
import { HorizontalClampComponent } from "../../../core/components/Movement/HorizontalClampComponent";
import { Globals } from "../../../core/Globals";
import {
  ColliderModes,
  CollisionLayers,
  SPRITE_SIZE,
} from "../../../core/consts";
import { TEXTURE_BEAST_SHIP } from "../../publicAssets";
import { BulletSpawner } from "./BulletSpawner";
import { CircleColliderComponent } from "../../../core/components/Collision/CircleColliderComponent";
import { HeartsUI } from "../../../core/components/UI/HeartsUI";
import { DialogUI } from "../../../core/components/UI/DialogUI";
import { ScoreUI } from "../../../core/components/UI/ScoreUI";
import { BlinkInvulnerabilityComponent } from "../../../core/components/Behavior/BlinkInvulnerabilityComponent";
import { EXPLOSION_SMALL } from "../../../core/effects/PixelEffectPresets";
import { spawnPixelBurst } from "../../../core/effects/spawnEffect";
import { ShooterPlayfield } from "./ShooterPlayfield";
import { ShooterEnemy } from "./ShooterEnemy";
import type { EnemyKind } from "./ShooterEnemy";
import { SpaceShooter } from "../SpaceShooter";

export class Spaceship extends GameObject {
  constructor(x: number = 0, y: number = 0, renderOptions: RenderOptions = {}) {
    super();
    const shipWidth = SPRITE_SIZE;
    this.name = "Spaceship";

    this.addComponent(new TransformComponent(x, y));
    this.addComponent(
      new SpriteRenderComponent(TEXTURE_BEAST_SHIP, renderOptions),
    );
    const invuln = this.addComponent(new BlinkInvulnerabilityComponent(90));
    const hitRadius = 10;
    const hitCenter = shipWidth / 2;
    this.addComponent(
      new CircleColliderComponent(
        hitRadius,
        {
          layer: CollisionLayers.Player,
          mode: ColliderModes.Active,
          mask: [CollisionLayers.Enemy],
          onCollisionEnter: (_self, other) => {
            if (invuln.invulnerable) return;

            const hearts = HeartsUI.decreaseHearts(1);
            invuln.trigger();

            const { x: px, y: py } = this.getWorldPosition();
            const host = ShooterPlayfield.current;
            if (host) {
              spawnPixelBurst(host, px + shipWidth / 2, py + shipWidth / 2, {
                ...EXPLOSION_SMALL,
                durationFrames: 8,
              });
              host.shake(8, 1);
            }

            if (hearts <= 0) {
              DialogUI.open("GAME OVER", ScoreUI.getScore());
              DialogUI.setPrimaryLabel("RESTART");
              DialogUI.setOnRestart(() => {
                SpaceShooter.triggerGameOverRestart();
              });
              return;
            }

            const enemy = other.gameObject;
            if (!enemy || !host) return;
            const { x: ex, y: ey } = enemy.getWorldPosition();
            const kind = enemy.name.replace("Enemy_", "") as EnemyKind;
            ShooterEnemy.spawnBurst(kind, ex, ey);
            host.shake(4, 1);
            enemy.destroy();
          },
        },
        {},
        hitCenter,
        hitCenter,
      ),
    );
    this.addComponent(
      new HorizontalClampComponent(0, Globals.canvasWidth - shipWidth),
    );

    this.addChild(new BulletSpawner());
  }
}
