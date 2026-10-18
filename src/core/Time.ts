/* Time.ts
  Game clock. Component `update(deltaTime)` receives `time.delta`, which is
  expressed in frame units (1 = one frame at 60 FPS), the same unit as
  PixiJS `ticker.deltaTime`. `deltaSeconds` and `elapsed` are in real seconds
  of game time. Paused time yields a delta of 0.
*/

export const FRAMES_PER_SECOND = 60;

export class Time {
  /** Game time elapsed in seconds (does not advance while paused). */
  elapsed: number = 0;
  /** Scaled delta of the current frame in frame units (0 while paused). */
  delta: number = 0;
  /** Scaled delta of the current frame in seconds. */
  deltaSeconds: number = 0;
  /** 1 = normal speed, 0.5 = slow motion. */
  timeScale: number = 1;
  paused: boolean = false;

  advance(frameDelta: number): void {
    this.delta = this.paused ? 0 : Math.max(0, frameDelta) * this.timeScale;
    this.deltaSeconds = this.delta / FRAMES_PER_SECOND;
    this.elapsed += this.deltaSeconds;
  }

  reset(): void {
    this.elapsed = 0;
    this.delta = 0;
    this.deltaSeconds = 0;
  }
}
