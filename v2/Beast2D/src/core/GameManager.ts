import type { Engine } from "./Engine";
import { LevelManager } from "./LevelManager";
import type { Level } from "./Level";
import { Level1 } from "../game/Level1";
import { Level2 } from "../game/Level2";

export class GameManager {
  private engine: Engine;
  private levelManager: LevelManager;

  constructor(engine: Engine) {
    this.engine = engine;
    this.levelManager = new LevelManager(this.engine);
  }

  public initialize() {
    this.registerLevel("level1", new Level1(this.engine));
    this.registerLevel("level2", new Level2(this.engine));
    this.loadLevel("level1");
  }

  pause() {
    this.engine.app.ticker.stop();
  }

  resume() {
    this.engine.app.ticker.start();
  }

  // Register a level with a name
  public registerLevel(name: string, level: Level) {
    this.levelManager.registerLevel(name, level);
  }

  // Load a specific level by name
  public loadLevel(name: string) {
    this.levelManager.loadLevel(name);
  }

  // Get the current active level
  public getCurrentLevel() {
    return this.levelManager.getCurrentLevel();
  }
}
