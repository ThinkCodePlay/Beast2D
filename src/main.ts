import { Engine } from "./core/Engine";
import {
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  fitGameViewport,
} from "./core/viewportFit";
import { Level1 } from "./game/Level1";
import { Level2 } from "./game/Level2";
import { SpaceShooter } from "./game/Space Shooter/SpaceShooter";
import "./style.css";

const appRoot = document.getElementById("app")!;
const container = document.createElement("div");
container.className = "game-container";
container.style.position = "relative";
appRoot.appendChild(container);

fitGameViewport(container, DESIGN_WIDTH, DESIGN_HEIGHT, {
  integerScale: true,
  padding: 24,
});

const engine = new Engine({ width: DESIGN_WIDTH, height: DESIGN_HEIGHT });

engine
  .bootstrap(container)
  .then((game) => {
    game.registerLevel("level1", new Level1(engine));
    game.registerLevel("level2", new Level2(engine));
    game.registerLevel("spaceShooter", new SpaceShooter(engine));
    return game.loadLevel("spaceShooter");
  })
  .catch((error) => {
    console.error("Failed to start Beast2D engine", error);
  });
