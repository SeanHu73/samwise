import { describe, expect, it } from "vitest";
import { fromServerEntity } from "./sync";
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
