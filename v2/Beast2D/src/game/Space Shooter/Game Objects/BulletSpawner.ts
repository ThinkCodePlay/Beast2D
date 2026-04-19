import { Container } from "pixi.js";
import { GameObject } from "../../../core/GameObject";
import { SpawnerComponent } from "../../../core/components/Behavior/SpawnerComponent";
import { SpaceShootInputComponent } from "../../../core/components/Input/SpaceShootInputComponent";
import { Globals } from "../../../core/Globals";
import { Bullet } from "./Bullet";

export class BulletSpawner extends GameObject {
  constructor(
    container: Container,
    getShipX: () => number,
    getShipY: () => number,
  ) {
    super(container);
    this.name = "BulletSpawner";
    this.setupWeaponSystem(getShipX, getShipY);
  }

  private setupWeaponSystem(
    getShipX: () => number,
    getShipY: () => number,
  ): void {
    const spawner = this.addComponent(
      new SpawnerComponent(0.2, 0, 0, () => {
        const parent = this.parent ?? this;
        parent.addChild(
          new Bullet(Globals.stage, getShipX() + 30, getShipY() - 8),
        );
      }),
    );

    spawner.enabled = false;
    this.addComponent(new SpaceShootInputComponent(spawner));
  }
}
