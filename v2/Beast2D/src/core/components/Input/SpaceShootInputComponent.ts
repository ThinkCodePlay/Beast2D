import { Component } from "../Component";
import { SpawnerComponent } from "../Behavior/SpawnerComponent";

export class SpaceShootInputComponent extends Component {
  private readonly spawner: SpawnerComponent;
  private isShooting: boolean = false;
  private onKeyDown = (event: KeyboardEvent) => {
    if (event.code !== "Space") return;
    this.isShooting = true;
    event.preventDefault();
  };
  private onKeyUp = (event: KeyboardEvent) => {
    if (event.code !== "Space") return;
    this.isShooting = false;
  };

  constructor(spawner: SpawnerComponent) {
    super();
    this.spawner = spawner;
  }

  override init(): void {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  override update(_deltaTime: number): void {
    this.spawner.enabled = this.isShooting;
  }

  override destroy(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.isShooting = false;
    this.spawner.enabled = false;
    super.destroy();
  }
}
