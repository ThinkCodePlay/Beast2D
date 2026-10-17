import { Graphics } from "pixi.js";
import { GameObject } from "../../../core/GameObject";
import { TransformComponent } from "../../../core/components/Movement/TransformComponent";
import { SpawnerComponent } from "../../../core/components/Behavior/SpawnerComponent";
import { SpaceShootInputComponent } from "../../../core/components/Input/SpaceShootInputComponent";
import { Globals } from "../../../core/Globals";
import { Bullet } from "./Bullet";

/**
 * Child of the ship. Its transform is the muzzle position relative to the
 * ship, so bullets are spawned at its world position into the level root
 * (not as ship children, which would make them follow the ship).
 */
export class BulletSpawner extends GameObject {
  private readonly bulletRadius: number = 5;
  private debugSpawnMarker: Graphics | null = null;

  constructor(offsetX: number = 30, offsetY: number = -8) {
    super();
    this.name = "BulletSpawner";
    this.addComponent(new TransformComponent(offsetX, offsetY));
    this.setupWeaponSystem();
    this.createDebugSpawnMarker();
  }

  private setupWeaponSystem(): void {
    const spawner = this.addComponent(
      new SpawnerComponent(0.2, 0, 0, () => {
        const { x, y } = this.getWorldPosition();
        this.root.addChild(new Bullet(x, y));
      }),
    );

    spawner.enabled = false;
    this.addComponent(new SpaceShootInputComponent(spawner));
  }

  private createDebugSpawnMarker(): void {
    if (!Globals.debug) return;

    this.debugSpawnMarker = new Graphics()
      .circle(this.bulletRadius, this.bulletRadius, 3)
      .fill({ color: 0x00ff66 })
      .stroke({ color: 0x003300, width: 1 });
    this.debugSpawnMarker.zIndex = 1000;
    this.container.sortableChildren = true;
    this.container.addChild(this.debugSpawnMarker);
  }
}
