/* Engine.ts
  Engine owns the PixiJS application, the EngineContext (services) and the
  game loop. Usage:

    const engine = new Engine({ width: 800, height: 600 });
    const game = await engine.bootstrap(element);
    game.registerLevel("main", new MainLevel(engine));
    game.loadLevel("main");
*/

import { Application, type Ticker } from "pixi.js";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "./consts";
import { EngineContext } from "./EngineContext";
import { GameManager } from "./GameManager";
import { Globals } from "./Globals";

export interface EngineOptions {
  width?: number;
  height?: number;
  backgroundColor?: number | string;
  antialias?: boolean;
  /** Draw collider outlines etc. */
  debug?: boolean;
  /** Backing-store scale; use `1` for crisp pixel art + CSS integer upscale. */
  resolution?: number;
}

export class Engine {
  app: Application;
  gameManager?: GameManager;
  private readonly options: Required<Omit<EngineOptions, "resolution">> & {
    resolution: number;
  };
  private ready: Promise<void>;
  private _context: EngineContext | null = null;
  private destroyed = false;

  constructor(options: EngineOptions = {}) {
    this.options = {
      width: options.width ?? DISPLAY_WIDTH,
      height: options.height ?? DISPLAY_HEIGHT,
      backgroundColor: options.backgroundColor ?? 0x000000,
      antialias: options.antialias ?? false,
      debug: options.debug ?? false,
      resolution: options.resolution ?? 1,
    };

    this.app = new Application();
    this.ready = this.app.init({
      width: this.options.width,
      height: this.options.height,
      background: this.options.backgroundColor,
      backgroundAlpha: 1,
      resolution: this.options.resolution,
      antialias: this.options.antialias,
    });
  }

  /** Shared services. Available after `bootstrap`/`mount`. */
  get context(): EngineContext {
    if (!this._context) throw new Error("Engine not mounted yet");
    return this._context;
  }

  async mount(domElement: HTMLElement) {
    await this.ready;
    if (this.destroyed) return;

    this._context = new EngineContext({
      stage: this.app.stage,
      width: this.app.screen.width,
      height: this.app.screen.height,
      debug: this.options.debug,
    });
    Globals.init(this._context);

    domElement.appendChild(this.app.canvas);
    this._context.canvas = this.app.canvas as HTMLCanvasElement;
    this.gameManager = new GameManager(this);
    this.app.ticker.add(this.tick, this);
  }

  /** Mounts the canvas and returns the GameManager used to register levels. */
  async bootstrap(container: HTMLElement): Promise<GameManager> {
    await this.mount(container);
    return this.gameManager!;
  }

  resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
    this.context.resize(width, height);
  }

  /** Stops the loop and releases the canvas and all listeners. */
  destroy(): void {
    this.destroyed = true;
    this.app.ticker.remove(this.tick, this);
    this.gameManager?.getCurrentLevel()?.destroy();
    this._context?.dispose();
    this._context = null;
    Globals.reset();
    void this.ready.then(() => this.app.destroy(true, { children: true }));
  }

  private tick(ticker: Ticker): void {
    const context = this._context;
    if (!context) return;

    context.time.advance(ticker.deltaTime);
    this.gameManager?.tick(context.time.delta);
    context.input.endFrame();
  }
}
