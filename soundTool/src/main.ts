import { Application } from 'pixi.js';

const mount = document.querySelector<HTMLElement>('#app');

if (!mount) {
  throw new Error('Sound tool mount element #app was not found.');
}

const app = new Application();
await app.init({
  backgroundColor: 0x24172f,
  antialias: false,
  autoDensity: true,
  resolution: Math.max(1, window.devicePixelRatio || 1),
  resizeTo: window,
});

mount.appendChild(app.canvas);
