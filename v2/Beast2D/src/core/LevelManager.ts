/* LevelManager.ts
  LevelManager is responsible for managing different game levels (scenes).
  It allows registering levels, switching between them, and ensures proper
  initialization and cleanup of levels during transitions.
  */

import { Engine } from "./Engine";
import { Level } from "./Level";

export class LevelManager {
  private engine: Engine;
  private currentLevel: Level | null = null;
  private levels: Map<string, Level> = new Map();

  constructor(engine: Engine) {
    this.engine = engine;
  }

  // Register a level with a name
  public registerLevel(name: string, level: Level) {
    this.levels.set(name, level);
  }

  // Switch to a specific level by name
  public loadLevel(name: string) {
    const level = this.levels.get(name);
    if (!level) {
      console.error(`Level "${name}" not found!`);
      return;
    }

    // Stop the current level if one is active
    if (this.currentLevel) {
      this.currentLevel.destroy();
    }

    // Start the new level
    this.currentLevel = level;
    this.currentLevel.start();
  }

  // Get the current active level
  public getCurrentLevel(): Level | null {
    return this.currentLevel;
  }
}
