import { GameObject } from "../../../core/GameObject";
import { SpawnerComponent } from "../../../core/components/Behavior/SpawnerComponent";
import { Globals } from "../../../core/Globals";
import { EnemyCircle } from "./EnemyCircle";

export class EnemyCircleSpawner extends GameObject {
  constructor() {
    super();
    this.name = "EnemyCircleSpawner";
    this.setupSpawner();
  }

  private setupSpawner(): void {
    this.addComponent(
      new SpawnerComponent(
        { min: 1, max: 3 },
        { min: 0, max: Globals.canvasWidth },
        0,
        (x, y) => {
          const parent = this.parent ?? this;
          parent.addChild(new EnemyCircle(x, y));
        },
      ),
    );
  }
}
