import { Component } from "../Component";
import { SpawnerComponent } from "../Behavior/SpawnerComponent";

export class SpaceShootInputComponent extends Component {
  private readonly spawner: SpawnerComponent;
  private isShooting: boolean = false;

  constructor(spawner: SpawnerComponent) {
    super();
    this.spawner = spawner;
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener("keydown", (event) => {
      if (event.code !== "Space") return;
      this.isShooting = true;
      event.preventDefault();
    });

    window.addEventListener("keyup", (event) => {
      if (event.code !== "Space") return;
      this.isShooting = false;
    });
  }

  override update(_deltaTime: number): void {
    this.spawner.enabled = this.isShooting;
  }
}
