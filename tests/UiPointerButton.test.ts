import { describe, expect, it, vi } from "vitest";
import { Container } from "pixi.js";
import { wireUiPointerButton } from "../src/core/ui/UiPointerButton";

describe("wireUiPointerButton", () => {
  it("fires once per pointertap", () => {
    const activate = vi.fn();
    const btn = new Container();
    wireUiPointerButton(btn, { onActivate: activate });

    btn.emit("pointertap", { stopPropagation: vi.fn(), pointerId: 1 } as never);
    btn.emit("pointertap", { stopPropagation: vi.fn(), pointerId: 1 } as never);
    expect(activate).toHaveBeenCalledTimes(2);
  });

  it("stops propagation so gameplay does not receive the tap", () => {
    const stopPropagation = vi.fn();
    const btn = new Container();
    wireUiPointerButton(btn, { onActivate: () => {} });
    btn.emit("pointertap", { stopPropagation, pointerId: 1 } as never);
    expect(stopPropagation).toHaveBeenCalled();
  });
});
