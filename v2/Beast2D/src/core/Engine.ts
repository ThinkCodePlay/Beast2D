/* Engine.ts
  Engine is the core of the Beast2D game engine, responsible for initializing
  the PixiJS application, managing the game loop, and handling level transitions.
  It sets up the rendering context and provides methods to pause and resume the game.
  */

import { Application } from "pixi.js";
import { LevelManager } from "./LevelManager";
import { Level1 } from "../game/Level1";
import { Level2 } from "../game/Level2";
import { Globals } from "./Globals";

declare global {
  var __PIXI_APP__: Application;
}

export class Engine {
  app: Application;
  private ready: Promise<void>;
  levelManager?: LevelManager;

  constructor() {
    this.app = new Application();
    globalThis.__PIXI_APP__ = this.app; // Expose app globally for debugging
    this.ready = this.app.init({
      width: 800,
      height: 600,
      backgroundAlpha: 1,
      resolution: devicePixelRatio || 1,
      antialias: true,
    });
  }

  async mount(domElement: HTMLElement) {
    await this.ready;

    // Initialize global variables
    Globals.init(
      this.app.renderer.width,
      this.app.renderer.height,
      this.app.stage
    );

    domElement.appendChild(this.app.canvas);
  }

  pause() {
    this.app.ticker.stop();
  }

  resume() {
    this.app.ticker.start();
  }

  bootstrap(container: HTMLElement) {
    (async () => {
      await this.mount(container);

      // Create level manager and register levels
      this.levelManager = new LevelManager(this);
      this.levelManager.registerLevel("level1", new Level1(this));
      this.levelManager.registerLevel("level2", new Level2(this));

      // Start with level 1
      this.levelManager.loadLevel("level1");

      // Log hierarchy every 100ms
      // setInterval(() => {
      //   const currentLevel = this.levelManager?.getCurrentLevel();
      //   if (currentLevel) {
      //     console.log("Current Level Hierarchy:", currentLevel.getHierarchy());
      //   }
      // }, 100);

      // Switch to level 2 after 5 seconds (for demo)
      // setTimeout(() => {
      //   console.log("Switching to Level 2...");
      //   this.levelManager?.loadLevel("level2");
      // }, 5000);
    })();
  }
}
