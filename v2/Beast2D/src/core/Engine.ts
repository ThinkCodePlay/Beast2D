/* Engine.ts
  Engine is the core of the Beast2D game engine, responsible for initializing
  the PixiJS application, managing the game loop, and handling level transitions.
  It sets up the rendering context and provides methods to pause and resume the game.
  */

import { Application } from "pixi.js";
import { GameManager } from "./GameManager";
import { Globals } from "./Globals";

declare global {
  var __PIXI_APP__: Application;
}

export class Engine {
  app: Application;
  private ready: Promise<void>;
  gameManager?: GameManager;

  constructor() {
    this.app = new Application();
    globalThis.__PIXI_APP__ = this.app; // Expose app globally for debugging
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

    Globals.init(this.app);

    domElement.appendChild(this.app.canvas);
  }

  bootstrap(container: HTMLElement) {
    (async () => {
      await this.mount(container);

      // Create and initialize game manager
      this.gameManager = new GameManager(this);
      this.gameManager.initialize();
    })();
  }
}
