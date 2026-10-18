/* Timers.ts
  Simple scheduler driven by game time (so it respects pause and time scale).
*/

export type TimerHandle = number;

interface TimerEntry {
  id: TimerHandle;
  remaining: number;
  interval: number | null;
  callback: () => void;
}

export class Timers {
  private entries: TimerEntry[] = [];
  private nextId = 1;

  /** Runs `callback` once after `seconds`. */
  after(seconds: number, callback: () => void): TimerHandle {
    return this.add(seconds, null, callback);
  }

  /** Runs `callback` every `seconds` until cancelled. */
  every(seconds: number, callback: () => void): TimerHandle {
    return this.add(seconds, Math.max(seconds, 0.001), callback);
  }

  cancel(handle: TimerHandle): void {
    this.entries = this.entries.filter((entry) => entry.id !== handle);
  }

  get size(): number {
    return this.entries.length;
  }

  clear(): void {
    this.entries = [];
  }

  update(deltaSeconds: number): void {
    if (deltaSeconds <= 0) return;

    for (const entry of [...this.entries]) {
      // The entry may have been cancelled by an earlier callback.
      if (!this.entries.includes(entry)) continue;

      entry.remaining -= deltaSeconds;
      if (entry.remaining > 0) continue;

      if (entry.interval === null) {
        this.cancel(entry.id);
      } else {
        entry.remaining += entry.interval;
      }
      entry.callback();
    }
  }

  private add(
    seconds: number,
    interval: number | null,
    callback: () => void,
  ): TimerHandle {
    const id = this.nextId++;
    this.entries.push({ id, remaining: seconds, interval, callback });
    return id;
  }
}
