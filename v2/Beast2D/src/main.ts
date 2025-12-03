import { Engine } from "./core/Engine";
import "./style.css";

const appRoot = document.getElementById("app")!;
const container = document.createElement("div");
container.className = "game-container";
container.style.position = "relative";
appRoot.appendChild(container);

const engine = new Engine();
engine.bootstrap(container);