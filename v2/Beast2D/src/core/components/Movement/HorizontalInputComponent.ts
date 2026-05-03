import { Component } from "../Component";
import { TransformComponent } from "./TransformComponent";

export class HorizontalInputComponent extends Component {
  keyLeft: boolean = false;
  keyRight: boolean = false;
  speed: number;
  private transform: TransformComponent | null = null;
  private onKeyDown = (event: KeyboardEvent) => {
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
  };
  private onKeyUp = (event: KeyboardEvent) => {
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
  };

  constructor(speed: number = 6) {
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

  override update(deltaTime: number): void {
    if (!this.transform) {
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
      this.transform.setPosition(
        this.transform.x + direction * this.speed * deltaTime,
        this.transform.y,
      );
    }
  }

  override destroy(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.transform = null;
    super.destroy();
  }
}
