import { describe, expect, it, vi } from "vitest";
import { Input } from "../src/core/Input";
import { Time } from "../src/core/Time";
import { Timers } from "../src/core/Timers";
import { FixedStepper } from "../src/core/FixedStepper";
import { ObjectPool } from "../src/core/ObjectPool";

function key(type: "keydown" | "keyup", code: string) {
  const event = Object.assign(new Event(type, { cancelable: true }), { code });
  return event;
}

describe("Input", () => {
  it("tracks actions, pressed and released per frame", () => {
    const target = new EventTarget();
    const input = new Input();
    input.attach(target);

    target.dispatchEvent(key("keydown", "ArrowLeft"));
    expect(input.isDown("left")).toBe(true);
    expect(input.wasPressed("left")).toBe(true);
    expect(input.isDown("right")).toBe(false);

    input.endFrame();
    expect(input.wasPressed("left")).toBe(false);
    expect(input.isDown("left")).toBe(true);

    target.dispatchEvent(key("keyup", "ArrowLeft"));
    expect(input.isDown("left")).toBe(false);
    expect(input.wasReleased("left")).toBe(true);
  });

  it("supports several keys per action", () => {
    const target = new EventTarget();
    const input = new Input();
    input.attach(target);
    target.dispatchEvent(key("keydown", "KeyA"));
    expect(input.isDown("left")).toBe(true);
  });

  it("prevents default only for bound keys", () => {
    const target = new EventTarget();
    const input = new Input();
    input.attach(target);
    const bound = key("keydown", "Space");
    const unbound = key("keydown", "KeyQ");
    target.dispatchEvent(bound);
    target.dispatchEvent(unbound);
    expect(bound.defaultPrevented).toBe(true);
    expect(unbound.defaultPrevented).toBe(false);
  });

  it("releases keys on blur so they cannot stick", () => {
    const target = new EventTarget();
    const input = new Input();
    input.attach(target);
    target.dispatchEvent(key("keydown", "Space"));
    target.dispatchEvent(new Event("blur"));
    expect(input.isDown("shoot")).toBe(false);
  });

  it("custom binding and detach", () => {
    const target = new EventTarget();
    const input = new Input({});
    input.bind("jump", ["KeyJ"]);
    input.attach(target);
    target.dispatchEvent(key("keydown", "KeyJ"));
    expect(input.isDown("jump")).toBe(true);
    input.detach();
    target.dispatchEvent(key("keydown", "KeyK"));
    expect(input.isKeyDown("KeyK")).toBe(false);
    expect(input.isDown("jump")).toBe(false);
  });
});

describe("Time", () => {
  it("advances in frames and seconds", () => {
    const time = new Time();
    time.advance(60);
    expect(time.delta).toBe(60);
    expect(time.deltaSeconds).toBe(1);
    expect(time.elapsed).toBe(1);
  });

  it("pause freezes and timeScale scales", () => {
    const time = new Time();
    time.timeScale = 0.5;
    time.advance(2);
    expect(time.delta).toBe(1);
    time.paused = true;
    time.advance(10);
    expect(time.delta).toBe(0);
    expect(time.elapsed).toBeCloseTo(1 / 60);
  });
});

describe("Timers", () => {
  it("after fires once", () => {
    const timers = new Timers();
    const fn = vi.fn();
    timers.after(1, fn);
    timers.update(0.5);
    expect(fn).not.toHaveBeenCalled();
    timers.update(0.5);
    timers.update(5);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(timers.size).toBe(0);
  });

  it("every repeats and can be cancelled", () => {
    const timers = new Timers();
    const fn = vi.fn();
    const handle = timers.every(1, fn);
    timers.update(1);
    timers.update(1);
    expect(fn).toHaveBeenCalledTimes(2);
    timers.cancel(handle);
    timers.update(5);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("callbacks may cancel other timers or schedule new ones", () => {
    const timers = new Timers();
    const second = vi.fn();
    let secondHandle = 0;
    timers.after(1, () => timers.cancel(secondHandle));
    secondHandle = timers.after(1, second);
    timers.update(1);
    expect(second).not.toHaveBeenCalled();

    const chained = vi.fn();
    timers.after(1, () => timers.after(1, chained));
    timers.update(1);
    expect(chained).not.toHaveBeenCalled();
    timers.update(1);
    expect(chained).toHaveBeenCalledTimes(1);
  });

  it("ignores zero deltas (paused)", () => {
    const timers = new Timers();
    const fn = vi.fn();
    timers.after(0.1, fn);
    timers.update(0);
    expect(fn).not.toHaveBeenCalled();
  });

  it("clear removes everything", () => {
    const timers = new Timers();
    timers.after(1, () => {});
    timers.clear();
    expect(timers.size).toBe(0);
  });
});

describe("FixedStepper", () => {
  it("accumulates fractional deltas", () => {
    const stepper = new FixedStepper(1);
    expect(stepper.consume(0.4)).toBe(0);
    expect(stepper.consume(0.4)).toBe(0);
    expect(stepper.consume(0.4)).toBe(1);
  });

  it("runs several steps after a long frame and caps them", () => {
    const stepper = new FixedStepper(1, 3);
    expect(stepper.consume(2)).toBe(2);
    expect(stepper.consume(100)).toBe(3);
    expect(stepper.consume(0)).toBe(0); // backlog dropped
  });

  it("tolerates float error around 1", () => {
    const stepper = new FixedStepper(1);
    expect(stepper.consume(0.9999999)).toBe(1);
  });
});

describe("ObjectPool", () => {
  it("reuses released objects and resets them", () => {
    let created = 0;
    const pool = new ObjectPool(
      () => ({ id: ++created, dirty: false }),
      (o) => (o.dirty = false),
    );
    const a = pool.acquire();
    a.dirty = true;
    expect(pool.release(a)).toBe(true);
    const b = pool.acquire();
    expect(b).toBe(a);
    expect(b.dirty).toBe(false);
    expect(created).toBe(1);
  });

  it("ignores double release and respects maxSize", () => {
    const pool = new ObjectPool(() => ({}), undefined, 1);
    const a = pool.acquire();
    const b = pool.acquire();
    expect(pool.release(a)).toBe(true);
    expect(pool.release(a)).toBe(false);
    expect(pool.release(b)).toBe(false);
    expect(pool.size).toBe(1);
  });

  it("clear disposes pooled items", () => {
    const pool = new ObjectPool(() => ({}));
    pool.release(pool.acquire());
    const dispose = vi.fn();
    pool.clear(dispose);
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(pool.size).toBe(0);
  });
});
