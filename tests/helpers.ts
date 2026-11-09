import { Container } from "pixi.js";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../src/core/display";
import type { Engine } from "../src/core/Engine";
import { EngineContext } from "../src/core/EngineContext";
import { GameObject } from "../src/core/GameObject";

export function createContext(): EngineContext {
  return new EngineContext({
    stage: new Container(),
    width: DISPLAY_WIDTH,
    height: DISPLAY_HEIGHT,
    inputTarget: null,
  });
}

export function fakeEngine(context = createContext()): Engine {
  return { context } as unknown as Engine;
}

/** A level-root-like GameObject with a context attached. */
export function createRoot(context = createContext()): GameObject {
  const root = new GameObject();
  root.context = context;
  context.stage.addChild(root.container);
  return root;
}

/** Runs one engine-like frame over a root: update, collisions, sync, flush. */
export function frame(root: GameObject, dt = 1): void {
  const context = root.context!;
  context.time.advance(dt);
  root.update(context.time.delta);
  context.collisions.update();
  root.syncTransforms();
  GameObject.flushDestroyed();
}
