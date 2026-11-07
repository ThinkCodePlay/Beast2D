import { SCALE_MODES, TextureStyle } from "pixi.js";
import { Engine } from "./core/Engine";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "./core/consts";

TextureStyle.defaultOptions.scaleMode = SCALE_MODES.NEAREST;
import { Level1 } from "./game/Level1";
import { Level2 } from "./game/Level2";
import { SpaceShooter } from "./game/Space Shooter/SpaceShooter";
import { BunnyHop } from "./game/Bunny Hop/BunnyHop";
import "./style.css";

const appRoot = document.getElementById("app")!;
const container = document.createElement("div");
container.className = "game-container";
container.style.position = "relative";
appRoot.appendChild(container);

const engine = new Engine({
  width: DISPLAY_WIDTH,
  height: DISPLAY_HEIGHT,
  antialias: false,
  debug: false,
});

engine
  .bootstrap(container)
  .then((game) => {
    game.registerLevel("level1", new Level1(engine));
    game.registerLevel("level2", new Level2(engine));
    game.registerLevel("spaceShooter", new SpaceShooter(engine));
    game.registerLevel("bunnyHop", new BunnyHop(engine));
    return game.loadLevel("spaceShooter");
  })
  .catch((error) => {
    console.error("Failed to start Beast2D engine", error);
  });
