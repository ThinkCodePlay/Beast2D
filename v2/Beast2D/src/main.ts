import { Engine } from './core/Engine';
import { GameObject } from './core/GameObject';
import { TransformComponent } from './core/components/TransformComponent';
import { BoxRenderComponent } from './core/components/BoxRenderComponent';
import { CircleRenderComponent } from './core/components/CircleRenderComponent';
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
  
  // Create a box using components
  const box = new GameObject(stage, X, Y);
  // box.addComponent(new TransformComponent());
  box.addComponent(new BoxRenderComponent(SIZE, SIZE, {
    color: 0xff6600,
    strokeColor: 0x333333,
    strokeWidth: 3,
  }));
  
  // Create a circle using components
  const circle = new GameObject(stage, 50, 50);
  circle.addComponent(new TransformComponent());
  circle.addComponent(new CircleRenderComponent(40, {
    color: 0x00ff00,
    strokeWidth: 2,
  }));
  
  // Example: Rotate the box over time
  engine.app.ticker.add(() => {
    const transform = box.getComponent(TransformComponent);
    if (transform) {
      transform.rotate(0.01);
    }
  });
})();