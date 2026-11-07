import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Assets, Texture } from "pixi.js";
import { Globals } from "../src/core/Globals";
import { GameObject } from "../src/core/GameObject";
import { Level1 } from "../src/game/Level1";
import { Level2 } from "../src/game/Level2";
import { SpaceShooter } from "../src/game/Space Shooter/SpaceShooter";
import { Bullet } from "../src/game/Space Shooter/Game Objects/Bullet";
import { Spaceship } from "../src/game/Space Shooter/Game Objects/Spaceship";
import { ShooterEnemy } from "../src/game/Space Shooter/Game Objects/ShooterEnemy";
import { ShooterPlayfield } from "../src/game/Space Shooter/Game Objects/ShooterPlayfield";
import { HeartsUI } from "../src/core/components/UI/HeartsUI";
import { ScoreUI } from "../src/core/components/UI/ScoreUI";
import { DialogUI } from "../src/core/components/UI/DialogUI";
import { createContext, fakeEngine } from "./helpers";

function key(type: "keydown" | "keyup", code: string) {
  return Object.assign(new Event(type, { cancelable: true }), { code });
}

let context = createContext();

beforeEach(() => {
  context = createContext();
  Globals.init(context);
  vi.spyOn(Assets, "load").mockResolvedValue(Texture.EMPTY);
});

afterEach(() => {
  Globals.reset();
  vi.restoreAllMocks();
});

function run(level: { tick(dt: number): void }, frames: number) {
  for (let i = 0; i < frames; i += 1) {
    context.time.advance(1);
    level.tick(context.time.delta);
  }
}

function findPlayfield(root: GameObject): ShooterPlayfield {
  const pf = root.children.find((c) => c instanceof ShooterPlayfield);
  if (!pf) throw new Error("playfield missing");
  return pf;
}

function findShip(root: GameObject): Spaceship {
  const pf = findPlayfield(root);
  const ship = pf.children.find((c) => c instanceof Spaceship);
  if (!ship) throw new Error("ship missing");
  return ship;
}

describe("example levels run on the updated engine", () => {
  it("Level1 starts, animates and tears down", () => {
    const level = new Level1(fakeEngine(context));
    level.start();
    run(level, 5);
    expect(level.getHierarchy()!.children.length).toBe(3);
    level.destroy();
    expect(context.stage.children).toHaveLength(0);
  });

  it("Level1 player moves with the keyboard", () => {
    const target = new EventTarget();
    context.input.attach(target);
    const level = new Level1(fakeEngine(context));
    level.start();
    run(level, 1);
    const player = (level as any).levelRoot.children.at(-1) as GameObject;
    const startX = player.transform!.x;
    target.dispatchEvent(key("keydown", "ArrowRight"));
    run(level, 2);
    expect(player.transform!.x).toBeGreaterThan(startX);
    level.destroy();
  });

  it("Level2 circles stay animated", () => {
    const level = new Level2(fakeEngine(context));
    level.start();
    expect(() => run(level, 30)).not.toThrow();
    level.destroy();
  });

  it("SpaceShooter: ship, UI and restart work", () => {
    const level = new SpaceShooter(fakeEngine(context));
    level.start();
    DialogUI.close();
    expect(() => run(level, 10)).not.toThrow();
    expect(HeartsUI.getHearts()).toBe(3);
    level.destroy();
    expect(HeartsUI.getHearts()).toBe(0);
    level.start();
    expect(HeartsUI.getHearts()).toBe(3);
    level.destroy();
  });

  it("SpaceShooter declares the assets it needs", () => {
    const level = new SpaceShooter(fakeEngine(context));
    expect(level.assets).toContain("BeastShip.32x32.png");
    expect(level.assets).toContain("space-shooter/enemies/scout-sheet.32x32.png");
  });
});

describe("space shooter gameplay", () => {
  function setup() {
    const level = new SpaceShooter(fakeEngine(context));
    level.start();
    DialogUI.close();
    run(level, 2);
    const root = (level as any).levelRoot as GameObject;
    return { level, root, playfield: findPlayfield(root) };
  }

  it("bullet destroys an enemy and scores", () => {
    const { level, playfield } = setup();
    playfield.addChild(new ShooterEnemy(300, 100, "scout"));
    playfield.addChild(new Bullet(307, 117));
    const before = ScoreUI.getScore();
    run(level, 2);
    expect(ScoreUI.getScore()).toBe(before + 100);
    expect(
      playfield.children.filter(
        (c) => c instanceof Bullet || c instanceof ShooterEnemy,
      ),
    ).toHaveLength(0);
    level.destroy();
  });

  it("an enemy hitting the ship costs a heart and is removed", () => {
    const { level, root, playfield } = setup();
    const ship = findShip(root);
    playfield.children
      .find((c) => c.name === "ShooterEnemySpawner")
      ?.destroy();
    const foe = new ShooterEnemy(
      ship.transform!.x + 4,
      ship.transform!.y + 4,
      "scout",
    );
    playfield.addChild(foe);
    run(level, 10);
    expect(HeartsUI.getHearts()).toBe(2);
    expect(foe.destroyed).toBe(true);
    level.destroy();
  });

  it("holding shoot spawns bullets at the muzzle in the level root and they fly up", () => {
    const target = new EventTarget();
    context.input.attach(target);
    const { level, root } = setup();
    const ship = findShip(root);
    target.dispatchEvent(key("keydown", "Space"));
    run(level, 30);

    const bullets = root.children.filter((c) => c instanceof Bullet);
    expect(bullets.length).toBeGreaterThan(0);
    const bullet = bullets[0];
    expect(bullet.parent).toBe(root);
    const shipPos = ship.getWorldPosition();
    expect(bullet.getWorldPosition().x).toBeCloseTo(shipPos.x + 4);
    expect(bullet.getWorldPosition().y).toBeLessThan(shipPos.y);

    const bx = bullet.getWorldPosition().x;
    ship.transform!.translate(-50, 0);
    run(level, 1);
    expect(bullet.getWorldPosition().x).toBe(bx);
    level.destroy();
  });

  it("pausing freezes the game but not its UI", () => {
    const { level, playfield } = setup();
    playfield.addChild(new ShooterEnemy(10, 10, "drifter"));
    const enemy = playfield.children.find((c) => c instanceof ShooterEnemy)!;
    run(level, 2);
    const y = enemy.transform!.y;
    context.time.paused = true;
    run(level, 5);
    expect(enemy.transform!.y).toBe(y);
    level.destroy();
  });
});
