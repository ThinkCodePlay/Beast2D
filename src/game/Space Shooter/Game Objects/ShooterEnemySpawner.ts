import { GameObject } from "../../../core/GameObject";
import { SpawnerComponent } from "../../../core/components/Behavior/SpawnerComponent";
import { Globals } from "../../../core/Globals";
import { ShooterEnemy } from "./ShooterEnemy";

export class ShooterEnemySpawner extends GameObject {
  constructor() {
    super();
    this.name = "ShooterEnemySpawner";
    this.addComponent(
      new SpawnerComponent(
        { min: 0.8, max: 2.2 },
        { min: 0, max: Globals.canvasWidth - 32 },
        0,
        (x, y) => {
          const parent = this.parent ?? this;
          parent.addChild(
            new ShooterEnemy(x, y, ShooterEnemy.randomKind()),
          );
        },
      ),
    );
  }
}
