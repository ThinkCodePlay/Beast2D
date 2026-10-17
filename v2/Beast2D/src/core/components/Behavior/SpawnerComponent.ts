import { Component } from "../Component";
import { FRAMES_PER_SECOND } from "../../Time";

export type NumberRange = {
  min: number;
  max: number;
};

export type NumberOrRange = number | NumberRange;

const MIN_INTERVAL_SECONDS = 0.01;
const MAX_SPAWNS_PER_UPDATE = 10;

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
    const deltaSeconds = deltaTime / FRAMES_PER_SECOND;
    this.timeUntilNextSpawnSeconds -= deltaSeconds;

    // Capped so a zero interval or a long frame cannot loop forever.
    let spawned = 0;
    while (this.timeUntilNextSpawnSeconds <= 0 && spawned < MAX_SPAWNS_PER_UPDATE) {
      this.spawn();
      spawned += 1;
      this.timeUntilNextSpawnSeconds += Math.max(
        this.randomInRange(this.intervalRangeSeconds),
        MIN_INTERVAL_SECONDS,
      );
    }
    if (this.timeUntilNextSpawnSeconds <= 0) {
      this.timeUntilNextSpawnSeconds = MIN_INTERVAL_SECONDS;
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
