import { Engine } from './core/Engine';
import { GameObject } from './core/GameObject';
import './style.css'
import { Graphics } from 'pixi.js';

const appRoot = document.getElementById('app')!;
const container = document.createElement('div');
container.className = 'game-container';
container.style.position = 'relative';
appRoot.appendChild(container);

// Initialize and mount the engine to the container
(async () => {
  const engine = new Engine();
  await engine.mount(container);
  const stage = engine.app.stage; // stage is the root container for all display objects
  
  const size = 100;
  const x = (engine.app.renderer.width - size) / 2;
  const y = (engine.app.renderer.height - size) / 2;
  const box = new GameObject(stage, x, y, size, size);
  box.create();
})();