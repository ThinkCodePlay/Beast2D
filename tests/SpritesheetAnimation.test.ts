import { describe, expect, it, vi } from "vitest";
import { Assets, Texture } from "pixi.js";
import { GameObject } from "../src/core/GameObject";
import { SpriteAnimationComponent } from "../src/core/components/Render/SpriteAnimationComponent";
import { createRoot, frame } from "./helpers";

const clipOptions = {
  defaultClip: "idle",
  clips: {
    idle: {
      texturePath: "idle.png",
      frameWidth: 64,
      frameHeight: 64,
      columns: 1,
      frameCount: 1,
    },
    walk: {
      texturePath: "walk.png",
      frameWidth: 64,
      frameHeight: 64,
      columns: 1,
      frameCount: 1,
    },
  },
} as const;

async function flushAsyncLoads(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("SpriteAnimationComponent", () => {
  it("loads default clip then playClip switches currentClip", async () => {
    vi.spyOn(Assets, "get").mockReturnValue(Texture.EMPTY);
    vi.spyOn(Assets, "load").mockResolvedValue(Texture.EMPTY);

    const root = createRoot();
    const render = new SpriteAnimationComponent(clipOptions);
    root.addChild(new GameObject().with(render));
    frame(root);

    await flushAsyncLoads();
    expect(render.currentClip).toBe("idle");

    render.playClip("walk");
    expect(render.currentClip).toBe("walk");
  });

  it("throws for unknown clip names", () => {
    const render = new SpriteAnimationComponent(clipOptions);
    expect(() => render.playClip("jump")).toThrow(/unknown clip/);
  });
});
