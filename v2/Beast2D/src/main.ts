import './style.css'

import { Application, Assets, Container, Sprite, Graphics } from 'pixi.js';

const appRoot = document.getElementById('app')!;
const container = document.createElement('div');
container.className = 'game-container';
container.style.position = 'relative';
appRoot.appendChild(container);

const app = new Application();
await app.init({ width: 800, height: 600 });
container.appendChild(app.canvas);

// Add a simple red square to the scene
const square = new Graphics();
square.rect(100, 100, 100, 100).fill(0xff0000);
app.stage.addChild(square);