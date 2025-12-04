/* Globals.ts
  Globals is a singleton class that holds global variables and settings
  for the Beast2D game engine. It provides access to the canvas dimensions
  and the root stage node, ensuring consistent references throughout the engine.
  */

import { Container } from "pixi.js";

export class Globals {
  private static _canvasWidth: number = 0;
  private static _canvasHeight: number = 0;
  private static _stage: Container | null = null;

  // Canvas dimensions
  static get canvasWidth(): number {
    return this._canvasWidth;
  }

  static get canvasHeight(): number {
    return this._canvasHeight;
  }

  // Root stage node
  static get stage(): Container {
    if (!this._stage) {
      throw new Error("Globals.stage accessed before initialization");
    }
    return this._stage;
  }

  // Initialize globals (called by Engine)
  static init(width: number, height: number, stage: Container): void {
    this._canvasWidth = width;
    this._canvasHeight = height;
    this._stage = stage;
  }

  // Update dimensions if canvas is resized
  static updateDimensions(width: number, height: number): void {
    this._canvasWidth = width;
    this._canvasHeight = height;
  }

  // Reset globals (useful for testing or cleanup)
  static reset(): void {
    this._canvasWidth = 0;
    this._canvasHeight = 0;
    this._stage = null;
  }
}
