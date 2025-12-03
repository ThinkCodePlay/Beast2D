import { Engine } from './core/Engine';
import { Box } from './core/prefabs/Box';
import { Circle } from './core/prefabs/Circle';
import { TransformComponent } from './core/components/TransformComponent';
import './style.css';

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
  
  const SIZE = 100;
  const X = (engine.app.renderer.width - SIZE) / 2;
  const Y = (engine.app.renderer.height - SIZE) / 2;
  
  // Create a box - components are added automatically
  const box = new Box(stage, X, Y, SIZE, SIZE, {
    color: 0xff6600,
    strokeColor: 0x333333,
    strokeWidth: 3,
  });
  
  // Create a circle - components are added automatically
  const circle = new Circle(stage, 50, 50, 40, {
    color: 0x00ff00,
    strokeWidth: 2,
  });
  
})();