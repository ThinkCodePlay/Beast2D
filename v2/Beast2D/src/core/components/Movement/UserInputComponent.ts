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

  override init(): void {
    if (!this.gameObject) return;

    this.transform = this.gameObject.getRequiredComponent(
      TransformComponent,
      this.constructor.name,
    );

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  override update(_deltaTime: number): void {
    if (!this.transform) {
      return;
    }

    let dx = 0;
    let dy = 0;

    if (this.keyUp) {
      dy -= this.speed;
    }
    if (this.keyDown) {
      dy += this.speed;
    }
    if (this.keyLeft) {
      dx -= this.speed;
    }
    if (this.keyRight) {
      dx += this.speed;
    }

    // Apply movement to the transform
    if (dx !== 0 || dy !== 0) {
      this.transform.translate(dx, dy);
    }
  }

  override destroy(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.transform = null;
    super.destroy();
  }
}
