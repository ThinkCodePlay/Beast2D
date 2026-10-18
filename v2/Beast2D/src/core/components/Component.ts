/* Component.ts
  Base class for everything that can be attached to a GameObject.

  Lifecycle (three hooks):
  - onInit():    once, on the first update of the owner, after all of its
                 components exist (siblings can be looked up safely).
  - update(dt):  every frame while enabled. `dt` is in frame units
                 (1 = 1/60 s); use `context.time.deltaSeconds` for seconds.
  - onDestroy(): once, when removed or when the owner is destroyed. Only runs
                 if onInit ran.
*/

import type { EngineContext } from "../EngineContext";
import type { GameObject } from "../GameObject";

export abstract class Component {
  gameObject: GameObject | null = null;
  enabled: boolean = true;

  // Lifecycle flags, managed by GameObject
  initialized: boolean = false;
  destroyed: boolean = false;

  /** Engine services, or null if the owner is not part of a level yet. */
  get context(): EngineContext | null {
    return this.gameObject?.context ?? null;
  }

  /** Like `context`, but throws a descriptive error when missing. */
  protected requireContext(): EngineContext {
    const context = this.context;
    if (!context) {
      throw new Error(
        `${this.constructor.name} needs an EngineContext: its GameObject must be part of a level`,
      );
    }
    return context;
  }

  onInit(): void {
    // Override in subclasses
  }

  update(_deltaTime: number): void {
    // Override in subclasses
  }

  onDestroy(): void {
    // Override in subclasses
  }
}
