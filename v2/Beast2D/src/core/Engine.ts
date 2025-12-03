import { Application } from "pixi.js";

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
}
