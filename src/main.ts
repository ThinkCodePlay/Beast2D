import { Engine } from "./core/Engine";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "./core/consts";
import {
  attachDisplayScaleFit,
  configurePixelArtRendering,
} from "./core/displayScale";

configurePixelArtRendering();
import { Level1 } from "./game/Level1";
import { Level2 } from "./game/Level2";
import { SpaceShooter } from "./game/Space Shooter/SpaceShooter";
import { BunnyHop } from "./game/Bunny Hop/BunnyHop";
import { BreakoutPaddle } from "./game/BreakoutPaddle/BreakoutPaddle";
import "./style.css";

const appRoot = document.getElementById("app")!;
const container = document.createElement("div");
container.className = "game-container";
container.style.position = "relative";
appRoot.appendChild(container);

attachDisplayScaleFit(container, DISPLAY_WIDTH, DISPLAY_HEIGHT, {
  padding: 16,
});

const engine = new Engine({
  width: DISPLAY_WIDTH,
  height: DISPLAY_HEIGHT,
  antialias: false,
});

engine
  .bootstrap(container)
  .then((game) => {
    game.registerLevel("level1", new Level1(engine));
    game.registerLevel("level2", new Level2(engine));
    game.registerLevel("spaceShooter", new SpaceShooter(engine));
    game.registerLevel("bunnyHop", new BunnyHop(engine));
    game.registerLevel("breakoutPaddle", new BreakoutPaddle(engine));
    return game.loadLevel("spaceShooter");
  })
  .catch((error) => {
    console.error("Failed to start Beast2D engine", error);
  });
