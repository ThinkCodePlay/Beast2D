/* Input.ts
  Keyboard input service with named actions. Keys are tracked by
  `KeyboardEvent.code` (layout independent). Components query actions such as
  `input.isDown("left")` instead of registering their own listeners.
*/

export const DefaultBindings: Record<string, string[]> = {
  left: ["ArrowLeft", "KeyA"],
  right: ["ArrowRight", "KeyD"],
  up: ["ArrowUp", "KeyW"],
  down: ["ArrowDown", "KeyS"],
  shoot: ["Space"],
};

export class Input {
  private bindings = new Map<string, string[]>();
  private down = new Set<string>();
  private pressed = new Set<string>();
  private released = new Set<string>();
  private target: EventTarget | null = null;

  constructor(bindings: Record<string, string[]> = DefaultBindings) {
    for (const [action, codes] of Object.entries(bindings)) {
      this.bind(action, codes);
    }
  }

  bind(action: string, codes: string[]): void {
    this.bindings.set(action, [...codes]);
  }

  attach(target: EventTarget): void {
    this.detach();
    this.target = target;
    target.addEventListener("keydown", this.onKeyDown);
    target.addEventListener("keyup", this.onKeyUp);
    target.addEventListener("blur", this.onBlur);
  }

  detach(): void {
    if (!this.target) return;
    this.target.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("keyup", this.onKeyUp);
    this.target.removeEventListener("blur", this.onBlur);
    this.target = null;
    this.reset();
  }

  isKeyDown(code: string): boolean {
    return this.down.has(code);
  }

  isDown(action: string): boolean {
    return this.anyIn(action, this.down);
  }

  wasPressed(action: string): boolean {
    return this.anyIn(action, this.pressed);
  }

  wasReleased(action: string): boolean {
    return this.anyIn(action, this.released);
  }

  /** Clears the per-frame pressed/released sets. Called by the engine. */
  endFrame(): void {
    this.pressed.clear();
    this.released.clear();
  }

  reset(): void {
    this.down.clear();
    this.pressed.clear();
    this.released.clear();
  }

  private anyIn(action: string, keys: Set<string>): boolean {
    const codes = this.bindings.get(action);
    return !!codes && codes.some((code) => keys.has(code));
  }

  private isBound(code: string): boolean {
    for (const codes of this.bindings.values()) {
      if (codes.includes(code)) return true;
    }
    return false;
  }

  private onKeyDown = (event: Event): void => {
    const code = (event as KeyboardEvent).code;
    if (!code) return;
    if (this.isBound(code)) event.preventDefault();
    if (!this.down.has(code)) {
      this.down.add(code);
      this.pressed.add(code);
    }
  };

  private onKeyUp = (event: Event): void => {
    const code = (event as KeyboardEvent).code;
    if (!code) return;
    if (this.down.delete(code)) this.released.add(code);
  };

  private onBlur = (): void => {
    // Keys released while the window is unfocused would otherwise stick.
    for (const code of this.down) this.released.add(code);
    this.down.clear();
  };
}
