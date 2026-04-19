import { Component } from "../Component";

export type NumberRange = {
  min: number;
  max: number;
};

export type NumberOrRange = number | NumberRange;

type SpawnCallback = (x: number, y: number) => void;

export class SpawnerComponent extends Component {
  private readonly intervalRangeSeconds: NumberRange;
  private readonly xRange: NumberRange;
  private readonly yRange: NumberRange;
  private readonly spawnCallback: SpawnCallback;
  private timeUntilNextSpawnSeconds: number;

  constructor(
    intervalRangeSeconds: NumberOrRange,
    xRange: NumberOrRange,
    yRange: NumberOrRange,
    spawnCallback: SpawnCallback,
  ) {
    super();
    this.intervalRangeSeconds = this.normalizeToRange(intervalRangeSeconds);
    this.xRange = this.normalizeToRange(xRange);
    this.yRange = this.normalizeToRange(yRange);
    this.spawnCallback = spawnCallback;
    this.timeUntilNextSpawnSeconds = this.randomInRange(
      this.intervalRangeSeconds,
    );
  }

  override update(deltaTime: number): void {
    const deltaSeconds = deltaTime / 60;
    this.timeUntilNextSpawnSeconds -= deltaSeconds;

    while (this.timeUntilNextSpawnSeconds <= 0) {
      this.spawn();
      this.timeUntilNextSpawnSeconds += this.randomInRange(
        this.intervalRangeSeconds,
      );
    }
  }

  private spawn(): void {
    const x = this.randomInRange(this.xRange);
    const y = this.randomInRange(this.yRange);
    this.spawnCallback(x, y);
  }

  private randomInRange(range: NumberRange): number {
    const min = Math.min(range.min, range.max);
    const max = Math.max(range.min, range.max);
    return min + Math.random() * (max - min);
  }

  private normalizeToRange(input: NumberOrRange): NumberRange {
    if (typeof input === "number") {
      return { min: input, max: input };
    }

    return input;
  }
}
