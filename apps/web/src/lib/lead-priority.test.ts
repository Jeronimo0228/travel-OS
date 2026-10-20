import { describe, expect, it } from "vitest";
import { priorityBand } from "./lead-priority";

describe("priorityBand", () => {
  it("is high from 70 up", () => {
    expect(priorityBand(70)).toBe("high");
    expect(priorityBand(100)).toBe("high");
  });

  it("is medium from 40 to 69", () => {
    expect(priorityBand(40)).toBe("medium");
    expect(priorityBand(69)).toBe("medium");
  });

  it("is low below 40", () => {
    expect(priorityBand(39)).toBe("low");
    expect(priorityBand(0)).toBe("low");
  });
});
