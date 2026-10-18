/* Globals.ts
  Thin static facade over the active EngineContext, kept for code that has no
  GameObject yet, such as prefab constructors that need the canvas size.
  Inside components prefer `this.context` / `gameObject.context`.
*/

import type { Container } from "pixi.js";
import type { EngineContext } from "./EngineContext";

export class Globals {
  private static _context: EngineContext | null = null;
  private static _debug: boolean = true;

  static get context(): EngineContext {
    if (!this._context) {
      throw new Error("Globals accessed before engine initialization");
    }
    return this._context;
  }

  static get canvasWidth(): number {
    return this._context?.width ?? 0;
  }

  static get canvasHeight(): number {
    return this._context?.height ?? 0;
  }

  static get stage(): Container {
    if (!this._context) {
      throw new Error("Globals.stage accessed before initialization");
    }
    return this._context.stage;
  }

  static get debug(): boolean {
    return this._context ? this._context.debug : this._debug;
  }

  static set debug(value: boolean) {
    this._debug = value;
    if (this._context) this._context.debug = value;
  }

  // Called by Engine
  static init(context: EngineContext): void {
    this._context = context;
  }

  static reset(): void {
    this._context = null;
    this._debug = true;
  }
}
