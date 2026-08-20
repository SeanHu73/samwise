import { describe, expect, it } from "vitest";
import { durationProfile } from "./duration";
describe("duration calibration", () => {
  it("reports ranges and sample confidence", () =>
    expect(durationProfile([10, 20, 30, 40, 50])).toEqual({
      low: 20,
      typical: 30,
      high: 40,
      samples: 5,
      confidence: "medium",
    }));
  it("can exclude an outlier by original sample index", () =>
    expect(durationProfile([10, 12, 500], [2])?.high).toBe(10));
  it("does not invent evidence", () =>
    expect(durationProfile([])).toBeUndefined());
});
