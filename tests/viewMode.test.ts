import { describe, expect, it } from "vitest";
import {
  parsePlaySurface,
  shellClassForViewMode,
  standaloneCartUrl,
  viewModeAfterEscape,
} from "../src/editor/viewMode";

describe("editor viewMode", () => {
  it("detects standalone play surface from ?play=cart", () => {
    expect(parsePlaySurface("?play=cart")).toBe("standalone");
    expect(parsePlaySurface("?level=level1")).toBe("editor");
    expect(parsePlaySurface("")).toBe("editor");
  });

  it("builds standalone cart URLs", () => {
    const url = standaloneCartUrl("https://example.test/?resetCart=1&foo=bar");
    expect(url).toContain("play=cart");
    expect(url).not.toContain("resetCart");
    expect(url).toContain("foo=bar");
  });

  it("returns to split view on escape from expanded", () => {
    expect(viewModeAfterEscape("expanded")).toBe("split");
    expect(viewModeAfterEscape("split")).toBe("split");
  });

  it("maps view mode to shell class", () => {
    expect(shellClassForViewMode("split")).toBe("beast2d-view-split");
    expect(shellClassForViewMode("expanded")).toBe("beast2d-view-expanded");
  });
});
