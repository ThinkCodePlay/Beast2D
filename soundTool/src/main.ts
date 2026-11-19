import { Application } from 'pixi.js';
import { SoundBoardFrame } from './SoundBoardFrame';

const DISPLAY_WIDTH = 480;
const DISPLAY_HEIGHT = 320;
const mount = document.querySelector<HTMLElement>('#app');

if (!mount) {
  throw new Error('Sound tool mount element #app was not found.');
}

const app = new Application();
await app.init({
  width: DISPLAY_WIDTH,
  height: DISPLAY_HEIGHT,
  backgroundColor: 0x24172f,
  antialias: false,
  autoDensity: false,
  resolution: 1,
});

app.stage.addChild(new SoundBoardFrame());
mount.appendChild(app.canvas);
