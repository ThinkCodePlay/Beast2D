import { describe, expect, it } from "vitest";
import { GameObject } from "../src/core/GameObject";
import { PixelBurstEffectComponent } from "../src/core/effects/PixelBurstEffectComponent";
import { MUZZLE_FLASH } from "../src/core/effects/PixelEffectPresets";
import { TransformComponent } from "../src/core/components/Movement/TransformComponent";
import { Graphics } from "pixi.js";
import { createRoot, frame } from "./helpers";

describe("PixelBurstEffectComponent", () => {
  it("destroys owner after preset duration", () => {
    const root = createRoot();
    const gfx = new Graphics();
    const go = new GameObject();
    go.addComponent(new TransformComponent(0, 0));
    go.addComponent(new PixelBurstEffectComponent(MUZZLE_FLASH, gfx));
    root.addChild(go);

    frame(root);
    frame(root);
    frame(root);
    expect(go.destroyed).toBe(true);
  });
});
