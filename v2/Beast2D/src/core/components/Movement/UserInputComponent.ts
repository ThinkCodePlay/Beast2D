import { Component } from "../Component";
import { TransformComponent } from "./TransformComponent";

export class UserInputComponent extends Component {
  keyUp: boolean = false;
  keyDown: boolean = false;
  keyLeft: boolean = false;
  keyRight: boolean = false;
  speed: number = 5;
  private transform: TransformComponent | null = null;
  private onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowUp":
      case "w":
      case "W":
        this.keyUp = true;
        event.preventDefault();
        break;
      case "ArrowDown":
      case "s":
      case "S":
        this.keyDown = true;
        event.preventDefault();
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        this.keyLeft = true;
        event.preventDefault();
        break;
      case "ArrowRight":
      case "d":
      case "D":
        this.keyRight = true;
        event.preventDefault();
        break;
    }
  };
  private onKeyUp = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowUp":
      case "w":
      case "W":
        this.keyUp = false;
        break;
      case "ArrowDown":
      case "s":
      case "S":
        this.keyDown = false;
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        this.keyLeft = false;
        break;
      case "ArrowRight":
      case "d":
      case "D":
        this.keyRight = false;
        break;
    }
  };

  constructor(speed: number = 5) {
    super();
    this.speed = speed;
  }

  override onInit(): void {
    if (!this.gameObject) return;

    this.transform = this.gameObject.getRequiredComponent(
      TransformComponent,
      this.constructor.name,
    );

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  override update(deltaTime: number): void {
    if (!this.transform) {
      return;
    }

    let dx = 0;
    let dy = 0;

    if (this.keyUp) dy -= 1;
    if (this.keyDown) dy += 1;
    if (this.keyLeft) dx -= 1;
    if (this.keyRight) dx += 1;

    // Apply movement to the transform
    if (dx !== 0 || dy !== 0) {
      // Normalize so diagonal movement is not faster, then scale by speed
      const magnitude = Math.hypot(dx, dy);
      const scale = (this.speed * deltaTime) / magnitude;
      this.transform.translate(dx * scale, dy * scale);
    }
  }

  override onDestroy(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.transform = null;
    super.onDestroy();
  }
}
