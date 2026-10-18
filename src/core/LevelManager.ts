/* LevelManager.ts
  Registers levels and switches between them. Switching is safe at any time:
  asset preloading is awaited (latest request wins) and a switch requested
  while a level is ticking is applied after the tick.
*/

import { Assets } from "pixi.js";
import type { Level } from "./Level";

export class LevelManager {
  private currentLevel: Level | null = null;
  private levels: Map<string, Level> = new Map();
  private ticking = false;
  private pending: Level | null = null;
  private loadToken = 0;

  public registerLevel(name: string, level: Level) {
    this.levels.set(name, level);
  }

  public async loadLevel(name: string): Promise<void> {
    const level = this.levels.get(name);
    if (!level) {
      console.error(`Level "${name}" not found!`);
      return;
    }

    const token = ++this.loadToken;
    if (level.assets.length > 0) {
      await Assets.load(level.assets);
      // A newer loadLevel call superseded this one while loading.
      if (token !== this.loadToken) return;
    }

    this.pending = level;
    if (!this.ticking) this.applyPending();
  }

  /** Runs the active level for one frame. */
  public tick(deltaTime: number) {
    this.ticking = true;
    try {
      this.currentLevel?.tick(deltaTime);
    } finally {
      this.ticking = false;
    }
    this.applyPending();
  }

  public getCurrentLevel(): Level | null {
    return this.currentLevel;
  }

  private applyPending() {
    const level = this.pending;
    if (!level) return;
    this.pending = null;

    this.currentLevel?.destroy();
    this.currentLevel = level;
    level.start();
  }
}
