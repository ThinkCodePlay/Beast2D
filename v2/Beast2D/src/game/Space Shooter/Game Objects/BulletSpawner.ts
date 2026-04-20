import { Container, Graphics } from "pixi.js";
import { GameObject } from "../../../core/GameObject";
import { SpawnerComponent } from "../../../core/components/Behavior/SpawnerComponent";
import { SpaceShootInputComponent } from "../../../core/components/Input/SpaceShootInputComponent";
import { Globals } from "../../../core/Globals";
import { Bullet } from "./Bullet";

export class BulletSpawner extends GameObject {
  private readonly bulletSpawnOffsetX: number = 30;
  private readonly bulletSpawnOffsetY: number = -8;
  private readonly bulletRadius: number = 5;
  private getShipX: () => number;
  private getShipY: () => number;
  private debugSpawnMarker: Graphics | null = null;

  constructor(
    container: Container,
    getShipX: () => number,
    getShipY: () => number,
  ) {
    super(container);
    this.name = "BulletSpawner";
    this.getShipX = getShipX;
    this.getShipY = getShipY;
    this.setupWeaponSystem();
    this.createDebugSpawnMarker();
  }

  private setupWeaponSystem(): void {
    const spawner = this.addComponent(
      new SpawnerComponent(0.2, 0, 0, () => {
        const parent = this.parent ?? this;
        parent.addChild(
          new Bullet(
            Globals.stage,
            this.getShipX() + this.bulletSpawnOffsetX,
            this.getShipY() + this.bulletSpawnOffsetY,
          ),
        );
      }),
    );

    spawner.enabled = false;
    this.addComponent(new SpaceShootInputComponent(spawner));
  }

  private createDebugSpawnMarker(): void {
    if (!Globals.debug) return;

    this.debugSpawnMarker = new Graphics()
      .circle(0, 0, 3)
      .fill({ color: 0x00ff66 })
      .stroke({ color: 0x003300, width: 1 });

    this.container.sortableChildren = true;
    this.debugSpawnMarker.zIndex = 1000;
    this.container.addChild(this.debugSpawnMarker);
    this.updateDebugSpawnMarker();
  }

  private updateDebugSpawnMarker(): void {
    if (!this.debugSpawnMarker) return;

    this.debugSpawnMarker.x =
      this.getShipX() + this.bulletSpawnOffsetX + this.bulletRadius;
    this.debugSpawnMarker.y =
      this.getShipY() + this.bulletSpawnOffsetY + this.bulletRadius;
  }

  override update(deltaTime: number): void {
    super.update(deltaTime);
    if (this.debugSpawnMarker) {
      this.updateDebugSpawnMarker();
    }
  }

  override destroy(): void {
    if (this.debugSpawnMarker) {
      this.container.removeChild(this.debugSpawnMarker);
      this.debugSpawnMarker.destroy();
      this.debugSpawnMarker = null;
    }

    super.destroy();
  }
}
