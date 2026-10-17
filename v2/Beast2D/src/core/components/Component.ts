/* Component.ts
  Component is the base class for all components that can be attached to GameObjects.
  It provides lifecycle methods for initialization, updating, and destruction.
  Specific components should extend this class and implement their own logic.
  */

import type { GameObject } from "../GameObject";

export abstract class Component {
  gameObject: GameObject | null = null;
  enabled: boolean = true;

  // Lifecycle flags, managed by GameObject
  initialized: boolean = false;
  destroyed: boolean = false;

  // Called once, before the first update, after the whole GameObject is assembled
  onInit(): void {
    // Override in subclasses
  }

  // Called every frame
  update(_deltaTime: number): void {
    // Override in subclasses
  }

  // Called once when the component is removed or its GameObject is destroyed
  onDestroy(): void {
    // Override in subclasses
  }
}
