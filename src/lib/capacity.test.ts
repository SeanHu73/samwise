import { describe, expect, it } from "vitest";
import { capacityState, constrainedCapacity, usableCapacity } from "./capacity";
describe("capacity", () => {
  it("reserves breathing room", () =>
    expect(usableCapacity(300, 35)).toBe(195));
  it("warns without blocking", () =>
    expect(capacityState(220, 195)).toBe("tight"));
  it("subtracts calendar and transition constraints after reserve", () =>
    expect(constrainedCapacity(300, 20, 60, 20)).toBe(160));
});
