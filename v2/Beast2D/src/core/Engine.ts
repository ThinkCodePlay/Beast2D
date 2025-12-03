import { Application } from "pixi.js";
import { LevelManager } from "./LevelManager";
import { Level1 } from "../game/Level1";
import { Level2 } from "../game/Level2";

export class Engine {
  app: Application;
  private ready: Promise<void>;

  constructor() {
    this.app = new Application();
    this.ready = this.app.init({
      width: 400,
      height: 300,
      backgroundAlpha: 1,
      resolution: devicePixelRatio || 1,
      antialias: true,
    });
  }

  async mount(domElement: HTMLElement) {
    await this.ready;
    domElement.appendChild(this.app.canvas);
  }

  pause() {
    this.app.ticker.stop();
  }

  resume() {
    this.app.ticker.start();
  }

  bootstrap(container: HTMLElement) {
    // Initialize and mount the engine to the container
    (async () => {
      await this.mount(container);

      // Create level manager and register levels
      const levelManager = new LevelManager(this);
      levelManager.registerLevel("level1", new Level1(this));
      levelManager.registerLevel("level2", new Level2(this));

      // Start with level 1
      levelManager.loadLevel("level1");

      // Switch to level 2 after 5 seconds (for demo)
      setTimeout(() => {
        console.log("Switching to Level 2...");
        levelManager.loadLevel("level2");
      }, 5000);

      // Pause the engine after 5 seconds
      setTimeout(() => {
        console.log("Pausing engine after 5 seconds...");
        this.pause();
      }, 10000);

      // Resume the engine after 10 seconds (5 seconds after pause)
      setTimeout(() => {
        console.log("Resuming engine after additional 5 seconds...");
        this.resume();
      }, 15000);
    })();
  }
}
