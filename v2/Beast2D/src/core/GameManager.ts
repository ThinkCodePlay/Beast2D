import type { Engine } from "./Engine";
import { LevelManager } from "./LevelManager";
import type { Level } from "./Level";

/* GameManager: game-agnostic facade for levels and pause. The game registers
  its own levels (see src/main.ts). */
export class GameManager {
  private engine: Engine;
  private levelManager: LevelManager;

  constructor(engine: Engine) {
    this.engine = engine;
    this.levelManager = new LevelManager();
  }

  /** Pauses game time. Objects with `runWhenPaused` (UI) keep updating and rendering continues. */
  pause() {
    this.engine.context.time.paused = true;
  }

  resume() {
    this.engine.context.time.paused = false;
  }

  get paused(): boolean {
    return this.engine.context.time.paused;
  }

  public registerLevel(name: string, level: Level) {
    this.levelManager.registerLevel(name, level);
  }

  public loadLevel(name: string): Promise<void> {
    return this.levelManager.loadLevel(name);
  }

  public getCurrentLevel() {
    return this.levelManager.getCurrentLevel();
  }

  /** Called by the engine every frame. */
  tick(deltaTime: number) {
    this.levelManager.tick(deltaTime);
  }
}
