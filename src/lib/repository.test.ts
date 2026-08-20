import { describe, expect, it } from "vitest";
import { db } from "./db";
import {
  captureTask,
  createArea,
  createMilestone,
  createProject,
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

  it("stores a priority-first capture as an available task", async () => {
    const task = await captureTask("Email the recruiter", {
      priority: 2,
      status: "next",
      nextActionText: "Email the recruiter",
    });

    expect(task.priority).toBe(2);
    expect(task.status).toBe("next");
  });

  it("stores target dates used by reverse planning", async () => {
    const project = await createProject("Finish portfolio", {
      targetDate: "2026-11-30",
    });
    const milestone = await createMilestone(project.id, "Draft case studies", {
      targetDate: "2026-10-15",
    });

    expect(project.targetDate).toBe("2026-11-30");
    expect(milestone.targetDate).toBe("2026-10-15");
  });
});
