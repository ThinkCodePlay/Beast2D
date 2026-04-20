import { Component } from "../Component";
import { TransformComponent } from "./TransformComponent";

export class UserInputComponent extends Component {
  keyUp: boolean = false;
  keyDown: boolean = false;
  keyLeft: boolean = false;
  keyRight: boolean = false;
  speed: number = 5;

  constructor(speed: number = 5) {
    super();
    this.speed = speed;
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener("keydown", (event) => {
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
    });

    window.addEventListener("keyup", (event) => {
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
    });
  }

  update(_deltaTime: number): void {
    if (!this.gameObject) {
      return;
    }

    const transform = this.gameObject.getComponent(TransformComponent);
    if (!transform) {
      console.warn(
        "UserInputComponent requires a TransformComponent on the GameObject",
      );
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
      transform.translate(dx, dy);
    }
  }

  destroy(): void {
    // Note: In a production system, you'd want to remove the event listeners
    // to prevent memory leaks. This would require storing bound functions.
    super.destroy();
  }
}
