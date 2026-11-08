/**
 * Playwright / dev capture entry only — not used by the default game (`src/main.ts`).
 */
import { Engine } from "../../../../src/core/Engine";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../../../../src/core/consts";
import {
  attachDisplayScaleFit,
  configurePixelArtRendering,
} from "../../../../src/core/displayScale";
import { exposePixiAppForCapture } from "../../../capture/exposePixiApp";
import { SpaceShooter } from "../../../../src/game/Space Shooter/SpaceShooter";
import "../../../../src/style.css";

configurePixelArtRendering();

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
    exposePixiAppForCapture(engine);
    game.registerLevel("spaceShooter", new SpaceShooter(engine));
    return game.loadLevel("spaceShooter");
  })
  .catch((error) => {
    console.error("Failed to start Space Shooter capture", error);
  });
