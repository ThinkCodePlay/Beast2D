/* FixedStepper.ts
  Accumulates variable frame deltas and reports how many fixed steps are due.
  Used so systems such as collision run at a stable rate regardless of the
  display refresh rate. Units are frame units (1 = 1/60 s).
*/

export class FixedStepper {
  private accumulator = 0;

  readonly step: number;
  readonly maxSteps: number;

  constructor(step: number = 1, maxSteps: number = 5) {
    this.step = step;
    this.maxSteps = maxSteps;
  }

  consume(delta: number): number {
    this.accumulator += Math.max(0, delta);

    let steps = 0;
    while (this.accumulator >= this.step - 1e-6 && steps < this.maxSteps) {
      this.accumulator -= this.step;
      steps += 1;
    }

    // Drop the backlog after a long stall instead of spiralling.
    if (steps === this.maxSteps) this.accumulator = 0;
    if (this.accumulator < 0) this.accumulator = 0;

    return steps;
  }

  reset(): void {
    this.accumulator = 0;
  }
}
