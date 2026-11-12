import { describe, expect, it } from "vitest";
import { clockText } from "../src/editor/clock";

describe("console clock", () => {
  it("formats weekday, day, and 12-hour time", () => {
    const wednesday = new Date(2026, 10, 11, 21, 16, 0);
    expect(clockText(wednesday)).toBe("WED 11 9:16PM");
  });
});
