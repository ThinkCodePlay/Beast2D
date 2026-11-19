import { Application } from 'pixi.js';

const mount = document.querySelector<HTMLElement>('#app');

if (!mount) {
  throw new Error('Sound tool mount element #app was not found.');
}

const app = new Application();
await app.init({
  width: 320,
  height: 240,
  backgroundColor: 0x24172f,
  antialias: false,
  autoDensity: false,
  resolution: 1,
});

mount.appendChild(app.canvas);
