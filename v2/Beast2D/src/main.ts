import { Engine } from './core/Engine';
import './style.css'

const appRoot = document.getElementById('app')!;
const container = document.createElement('div');
container.className = 'game-container';
container.style.position = 'relative';

// Ensure the container is in the DOM so the engine can mount
appRoot.appendChild(container);

// Initialize and mount the engine to the container
(async () => {
  const engine = new Engine();
  await engine.mount(container);
})();