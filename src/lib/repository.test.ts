import { describe, expect, it } from "vitest";
import { db } from "./db";
import {
  captureTask,
  createArea,
  deleteTask,
  getPlanningProfile,
  updateTask,
} from "./repository";
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

describe("task organization", () => {
  it("assigns a work category and soft-deletes an Inbox task", async () => {
    const area = await createArea("Job Search");
    const task = await captureTask("Apply for a role");
    const assigned = await updateTask(task, { areaId: area.id });

    expect((await db.tasks.get(task.id))?.areaId).toBe(area.id);

    await deleteTask(assigned);

    expect((await db.tasks.get(task.id))?.deletedAt).toBeTruthy();
    const operations = await db.outbox
      .where("entityId")
      .equals(task.id)
      .toArray();
    expect(operations.some((operation) => operation.kind === "delete")).toBe(
      true,
    );
  });
});
