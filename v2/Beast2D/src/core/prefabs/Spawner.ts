import { GameObject } from "../GameObject";
import {
  SpawnerComponent,
  type NumberOrRange,
} from "../components/Behavior/SpawnerComponent";

type SpawnCallback = (x: number, y: number) => void;

export class Spawner extends GameObject {
  constructor(
    intervalRangeSeconds: NumberOrRange,
    xRange: NumberOrRange,
    yRange: NumberOrRange,
    spawnCallback: SpawnCallback,
    name: string = "Spawner",
  ) {
    super();
    this.name = name;
    this.addComponent(
      new SpawnerComponent(intervalRangeSeconds, xRange, yRange, spawnCallback),
    );
  }
}
