import { Component } from "../Component";
import { TransformComponent } from "./TransformComponent";

export class HorizontalInputComponent extends Component {
  keyLeft: boolean = false;
  keyRight: boolean = false;
  speed: number;

  constructor(speed: number = 6) {
    super();
    this.speed = speed;
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener("keydown", (event) => {
      switch (event.key) {
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

  update(deltaTime: number): void {
    if (!this.gameObject) {
      return;
    }

    const transform = this.gameObject.getComponent(TransformComponent);
    if (!transform) {
      console.warn("HorizontalInputComponent requires a TransformComponent");
      return;
    }

    let direction = 0;
    if (this.keyLeft) {
      direction -= 1;
    }
    if (this.keyRight) {
      direction += 1;
    }

    if (direction !== 0) {
      transform.setPosition(
        transform.x + direction * this.speed * deltaTime,
        transform.y,
      );
    }
  }
}
