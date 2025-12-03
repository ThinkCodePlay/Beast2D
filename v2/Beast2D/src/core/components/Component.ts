import type { GameObject } from "../GameObject";

export abstract class Component {
  gameObject: GameObject | null = null;
  enabled: boolean = true;

  // Called when component is added to a GameObject
  init(): void {
    // Override in subclasses
  }

  // Called every frame
  update(deltaTime: number): void {
    // Override in subclasses
  }

  // Called when component is removed
  destroy(): void {
    // Override in subclasses
  }
}
