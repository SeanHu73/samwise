import { describe, expect, it } from "vitest";
import { db } from "./db";
import { getPlanningProfile } from "./repository";
describe("planning profile initialization", () => {
  it("creates one profile when React effects run concurrently", async () => {
    const [first, second] = await Promise.all([
      getPlanningProfile(),
      getPlanningProfile(),
    ]);
    expect(first.id).toBe(second.id);
    expect(await db.planningProfiles.count()).toBe(1);
    expect(
      await db.outbox.where("entityType").equals("planning_profile").count(),
    ).toBe(1);
  });
});
