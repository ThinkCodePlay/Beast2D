/** Immediate-mode draw commands recorded while a cart's `draw()` runs. */

export type DrawCommand =
  | { op: "cls"; color: number }
  | { op: "rect"; x: number; y: number; w: number; h: number; color: number }
  | { op: "rectfill"; x: number; y: number; w: number; h: number; color: number }
  | { op: "print"; text: string; x: number; y: number; color: number; scale: number };

export class DrawList {
  readonly commands: DrawCommand[] = [];

  clear(): void {
    this.commands.length = 0;
  }

  push(command: DrawCommand): void {
    this.commands.push(command);
  }
}
