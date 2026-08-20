import { describe, expect, it } from "vitest";
import { fromServerEntity, mergeTask } from "./sync";
import type { Task } from "../types";
const base = {
  id: "1",
  ownerId: "u",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-02",
  version: 2,
  title: "Task",
  descriptionMarkdown: "",
  priority: 3,
  energy: "medium",
  estimateConfidence: "low",
  nextActionText: "Open",
  deferCount: 0,
  rolloverState: "clear",
  sortOrder: 0,
} as Task;
describe("sync conflicts", () => {
  it("completion wins over concurrent status edits", () => {
    const done = { ...base, status: "done" as const };
    const deferred = {
      ...base,
      status: "deferred" as const,
      updatedAt: "2026-01-03",
    };
    expect(mergeTask(done, deferred).status).toBe("done");
  });
  it("latest edit otherwise wins", () =>
    expect(
      mergeTask(
        { ...base, status: "next" },
        { ...base, status: "planned", updatedAt: "2026-01-03" },
      ).status,
    ).toBe("planned"));
});
describe("server changes", () => {
  it("maps database task fields to the local model", () => {
    expect(
      fromServerEntity("task", {
        id: "1",
        owner_id: "u",
        due_at: "2026-01-03",
        project_id: null,
      }),
    ).toEqual({ id: "1", ownerId: "u", dueAt: "2026-01-03" });
  });
  it("maps event_type to the local event type", () => {
    expect(
      fromServerEntity("task_event", {
        id: "e1",
        task_id: "1",
        event_type: "completed",
      }),
    ).toEqual({ id: "e1", taskId: "1", type: "completed" });
  });
});
