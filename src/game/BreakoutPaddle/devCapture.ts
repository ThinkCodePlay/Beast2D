/**
 * Playwright / dev capture entry only — not used by the default game (`src/main.ts`).
 */
import { Assets } from "pixi.js";
import { Engine } from "../../core/Engine";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../../core/consts";
import {
  attachDisplayScaleFit,
  configurePixelArtRendering,
} from "../../core/displayScale";
import { BreakoutPaddle } from "./BreakoutPaddle";
import "../../style.css";

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

// Nested capture HTML lives under `/src/...`; Pixi must resolve `public/` from site root.
void Assets.init({ basePath: `${window.location.origin}/` })
  .then(() => engine.bootstrap(container))
  .then((game) => {
    game.registerLevel("breakoutPaddle", new BreakoutPaddle(engine));
    return game.loadLevel("breakoutPaddle");
  })
  .catch((error) => {
    console.error("Failed to start Breakout capture", error);
  });
