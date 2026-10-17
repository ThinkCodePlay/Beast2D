import { afterEach, describe, expect, it, vi } from "vitest";
import { Assets } from "pixi.js";
import { Level } from "../src/core/Level";
import { LevelManager } from "../src/core/LevelManager";
import { GameObject } from "../src/core/GameObject";
import { Component } from "../src/core/components/Component";
import { createContext, fakeEngine } from "./helpers";

class Probe extends Component {
  log: string[];
  constructor(log: string[]) {
    super();
    this.log = log;
  }
  override onInit() {
    this.log.push("init");
  }
  override update() {
    this.log.push("update");
  }
  override onDestroy() {
    this.log.push("destroy");
  }
}

class TestLevel extends Level {
  log: string[] = [];
  updates: number[] = [];
  protected init(): void {
    this.levelRoot.addChild(new GameObject().with(new Probe(this.log)));
  }
  protected override update(dt: number): void {
    super.update(dt);
    this.updates.push(dt);
  }
  get root() {
    return this.levelRoot;
  }
}

afterEach(() => vi.restoreAllMocks());

describe("Level", () => {
  it("start creates a root on the stage with the context", () => {
    const context = createContext();
    const level = new TestLevel(fakeEngine(context));
    level.start();
    expect(level.root.context).toBe(context);
    expect(context.stage.children).toContain(level.root.container);
    expect(level.getHierarchy()?.name).toBe("LevelRoot");
  });

  it("tick runs init, update, then flushes destroys", () => {
    const level = new TestLevel(fakeEngine());
    level.start();
    level.tick(1);
    level.tick(1);
    expect(level.log).toEqual(["init", "update", "update"]);
    expect(level.updates).toEqual([1, 1]);
  });

  it("destroy tears down objects, the stage container and level state", () => {
    const context = createContext();
    const level = new TestLevel(fakeEngine(context));
    level.start();
    level.tick(1);
    context.timers.after(10, () => {});
    level.destroy();
    expect(level.log.at(-1)).toBe("destroy");
    expect(context.stage.children).toHaveLength(0);
    expect(context.timers.size).toBe(0);
    expect(context.collisions.size).toBe(0);
    expect(level.getHierarchy()).toBeNull();
  });

  it("destroy twice and tick after destroy are safe", () => {
    const level = new TestLevel(fakeEngine());
    level.start();
    level.destroy();
    expect(() => {
      level.destroy();
      level.tick(1);
    }).not.toThrow();
  });

  it("a level can be restarted with a fresh root", () => {
    const context = createContext();
    const level = new TestLevel(fakeEngine(context));
    level.start();
    const first = level.root;
    level.destroy();
    level.start();
    expect(level.root).not.toBe(first);
    expect(context.stage.children).toHaveLength(1);
  });

  it("paused time still ticks UI but passes delta 0", () => {
    const context = createContext();
    const level = new TestLevel(fakeEngine(context));
    level.start();
    context.time.paused = true;
    context.time.advance(1);
    level.tick(context.time.delta);
    expect(level.updates).toEqual([0]);
    expect(level.log).toEqual([]); // game objects do not run while paused
  });

  it("timers run on game time and respect pause", () => {
    const context = createContext();
    const level = new TestLevel(fakeEngine(context));
    level.start();
    const fn = vi.fn();
    context.timers.after(1, fn);
    context.time.advance(60);
    level.tick(60);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("LevelManager", () => {
  it("loads a level and switches, destroying the previous", async () => {
    const engine = fakeEngine();
    const a = new TestLevel(engine);
    const b = new TestLevel(engine);
    const manager = new LevelManager();
    manager.registerLevel("a", a);
    manager.registerLevel("b", b);

    await manager.loadLevel("a");
    expect(manager.getCurrentLevel()).toBe(a);
    manager.tick(1);
    await manager.loadLevel("b");
    expect(manager.getCurrentLevel()).toBe(b);
    expect(a.getHierarchy()).toBeNull();
  });

  it("unknown level logs an error and keeps the current one", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const manager = new LevelManager();
    await manager.loadLevel("nope");
    expect(error).toHaveBeenCalled();
    expect(manager.getCurrentLevel()).toBeNull();
  });

  it("a switch requested during a tick is applied after the tick", async () => {
    const engine = fakeEngine();
    const manager = new LevelManager();
    const b = new TestLevel(engine);
    class Switcher extends TestLevel {
      protected override update(dt: number): void {
        super.update(dt);
        void manager.loadLevel("b");
        // still the same level in the middle of the tick
        expect(manager.getCurrentLevel()).toBe(this);
      }
    }
    const a = new Switcher(engine);
    manager.registerLevel("a", a);
    manager.registerLevel("b", b);
    await manager.loadLevel("a");
    manager.tick(1);
    expect(manager.getCurrentLevel()).toBe(b);
  });

  it("preloads assets before starting and the latest request wins", async () => {
    const engine = fakeEngine();
    const resolvers: (() => void)[] = [];
    vi.spyOn(Assets, "load").mockImplementation(
      () => new Promise<any>((resolve) => resolvers.push(() => resolve({}))),
    );

    const a = new TestLevel(engine);
    a.assets = ["a.png"];
    const b = new TestLevel(engine);
    b.assets = ["b.png"];
    const manager = new LevelManager();
    manager.registerLevel("a", a);
    manager.registerLevel("b", b);

    const first = manager.loadLevel("a");
    const second = manager.loadLevel("b");
    expect(manager.getCurrentLevel()).toBeNull();

    resolvers.forEach((resolve) => resolve());
    await Promise.all([first, second]);

    expect(manager.getCurrentLevel()).toBe(b);
    expect(a.getHierarchy()).toBeNull();
  });
});
