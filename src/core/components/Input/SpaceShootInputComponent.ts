import { Component } from "../Component";
import type { Input } from "../../Input";
import { SpawnerComponent } from "../Behavior/SpawnerComponent";

/** Enables the spawner while the "shoot" action is held. */
export class SpaceShootInputComponent extends Component {
  private readonly spawner: SpawnerComponent;
  private input: Input | null = null;

  constructor(spawner: SpawnerComponent) {
    super();
    this.spawner = spawner;
  }

  override onInit(): void {
    this.input = this.requireContext().input;
  }

  override update(_deltaTime: number): void {
    this.spawner.enabled = this.input?.isDown("shoot") ?? false;
  }

  override onDestroy(): void {
    this.input = null;
    this.spawner.enabled = false;
  }
}
