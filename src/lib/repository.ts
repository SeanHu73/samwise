import type { EntityTable } from "dexie";
import { db } from "./db";
import { getDeviceId, id, now, todayKey } from "./ids";
import { queueOperation } from "./sync";
import type {
  AgentRun,
  Area,
  Attachment,
  Direction,
  EntityBase,
  Goal,
  Milestone,
  Note,
  PlanningProfile,
  PlanningSession,
  Project,
  SyncEntityType,
  Task,
  TaskEvent,
} from "../types";
const owner = "local";
const base = (): EntityBase => {
  const stamp = now();
  return {
    id: id(),
    ownerId: owner,
    createdAt: stamp,
    updatedAt: stamp,
    version: 1,
  };
};
async function queue(
  type: SyncEntityType,
  value: EntityBase,
  kind: "create" | "update_fields" | "delete" = "create",
  fields: Record<string, unknown> = value as unknown as Record<string, unknown>,
  baseVersion = 0,
) {
  await queueOperation({
    deviceId: getDeviceId(),
    entityType: type,
    entityId: value.id,
    baseVersion,
    kind,
    fields,
  });
}
async function event(
  taskId: string,
  type: TaskEvent["type"],
  extra: Partial<TaskEvent> = {},
) {
  const value: TaskEvent = {
    id: id(),
    ownerId: owner,
    taskId,
    type,
    occurredAt: now(),
    ...extra,
  };
  await db.taskEvents.add(value);
  await queueOperation({
    deviceId: getDeviceId(),
    entityType: "task_event",
    entityId: value.id,
    baseVersion: 0,
    kind: "create",
    fields: value as unknown as Record<string, unknown>,
  });
}

export async function captureTask(title: string, fields: Partial<Task> = {}) {
  const task: Task = {
    ...base(),
    title: title.trim(),
    descriptionMarkdown: "",
    status: "inbox",
    priority: 3,
    energy: "medium",
    estimateConfidence: "low",
    nextActionText: "",
    deferCount: 0,
    rolloverState: "clear",
    sortOrder: Date.now(),
    ...fields,
  };
  await db.tasks.add(task);
  await queue("task", task);
  await event(task.id, "task_created");
  return task;
}
export async function createProject(
  title: string,
  fields: Partial<Project> = {},
) {
  const project: Project = {
    ...base(),
    title: title.trim(),
    purpose: "",
    definitionOfDone: "",
    type: "execute",
    status: "active",
    ...fields,
  };
  await db.projects.add(project);
  await queue("project", project);
  return project;
}
export async function createDirection(title: string) {
  const value: Direction = {
    ...base(),
    title: title.trim(),
    description: "",
    status: "active",
    reviewCadence: "quarterly",
  };
  await db.directions.add(value);
  await queue("direction", value);
  return value;
}
export async function createGoal(
  directionId: string | undefined,
  title: string,
) {
  const value: Goal = {
    ...base(),
    directionId,
    title: title.trim(),
    definitionOfDone: "",
    status: "active",
  };
  await db.goals.add(value);
  await queue("goal", value);
  return value;
}
export async function createMilestone(
  projectId: string,
  title: string,
  fields: Partial<Milestone> = {},
) {
  const value: Milestone = {
    ...base(),
    projectId,
    title: title.trim(),
    status: "pending",
    sortOrder: Date.now(),
    ...fields,
  };
  await db.milestones.add(value);
  await queue("milestone", value);
  return value;
}
export async function createNote(projectId: string, title = "Field notes") {
  const value: Note = { ...base(), projectId, title, markdownContent: "" };
  await db.notes.add(value);
  await queue("note", value);
  return value;
}
export async function createArea(name: string, color = "#3F5A42") {
  const value: Area = { ...base(), name: name.trim(), color, active: true };
  await db.areas.add(value);
  await queue("area", value);
  return value;
}
export async function createAttachment(
  fields: Omit<Attachment, keyof EntityBase>,
) {
  const value: Attachment = { ...base(), ...fields };
  await db.attachments.add(value);
  await queue("attachment", value);
  return value;
}
export async function createAgentRun(fields: Omit<AgentRun, keyof EntityBase>) {
  const value: AgentRun = { ...base(), ...fields };
  await db.agentRuns.add(value);
  await queue("agent_run", value);
  return value;
}
export async function saveEntity<T extends EntityBase>(
  type: SyncEntityType,
  table: { put: (value: T) => PromiseLike<unknown> },
  value: T,
  fields: Partial<T>,
) {
  const updated = {
    ...value,
    ...fields,
    updatedAt: now(),
    version: value.version + 1,
  };
  await table.put(updated);
  await queue(
    type,
    updated,
    "update_fields",
    fields as Record<string, unknown>,
    value.version,
  );
  return updated;
}
// Re-reads the entity inside a transaction so rapid saves of different fields
// (e.g. two debounced inputs in the task detail panel) never build on a stale
// copy and silently drop each other's changes.
function updateFresh<T extends EntityBase>(
  type: SyncEntityType,
  table: EntityTable<T, "id">,
  value: T,
  fields: Partial<T>,
) {
  return db.transaction("rw", table, db.outbox, async () => {
    const current = ((await table.get(value.id as never)) ?? value) as T;
    return saveEntity(
      type,
      table as { put: (item: T) => PromiseLike<unknown> },
      current,
      fields,
    );
  });
}
export const updateTask = (task: Task, fields: Partial<Task>) =>
  updateFresh("task", db.tasks, task, fields);
export async function deleteTask(task: Task) {
  const deletedAt = now(),
    updated = {
      ...task,
      deletedAt,
      updatedAt: deletedAt,
      version: task.version + 1,
    };
  await db.tasks.put(updated);
  await queue("task", updated, "delete", {}, task.version);
}
export const updateProject = (value: Project, fields: Partial<Project>) =>
  updateFresh("project", db.projects, value, fields);
export const updateDirection = (value: Direction, fields: Partial<Direction>) =>
  updateFresh("direction", db.directions, value, fields);
export const updateGoal = (value: Goal, fields: Partial<Goal>) =>
  updateFresh("goal", db.goals, value, fields);
export const updateMilestone = (value: Milestone, fields: Partial<Milestone>) =>
  updateFresh("milestone", db.milestones, value, fields);
export const updateNote = (value: Note, fields: Partial<Note>) =>
  updateFresh("note", db.notes, value, fields);
export const updateArea = (value: Area, fields: Partial<Area>) =>
  updateFresh("area", db.areas, value, fields);

export async function planTask(task: Task, date: string) {
  const value = await updateTask(task, {
    status: "planned",
    plannedForDate: date,
    rolloverState: "clear",
  });
  await event(task.id, "task_planned", { metadata: { date } });
  return value;
}
export const planToday = (task: Task) => planTask(task, todayKey());
export const unplanTask = (task: Task) =>
  updateTask(task, {
    status: "inbox",
    // null (not undefined) so the cleared field survives JSON and reaches the server.
    plannedForDate: null as unknown as undefined,
  });
export async function completeTask(task: Task, minutes?: number) {
  const value = await updateTask(task, {
    status: "done",
    completedAt: now(),
    rolloverState: "clear",
  });
  if (minutes) await event(task.id, "actual_time_logged", { minutes });
  await event(task.id, "task_completed");
  return value;
}
/** Swap two tasks' manual positions (the lists sort by sortOrder). */
export async function swapTaskOrder(a: Task, b: Task) {
  const orderA = a.sortOrder === b.sortOrder ? b.sortOrder + 1 : a.sortOrder;
  await updateTask(a, { sortOrder: b.sortOrder });
  await updateTask(b, { sortOrder: orderA });
}
export async function dropTask(task: Task) {
  const value = await updateTask(task, {
    status: "dropped",
    rolloverState: "clear",
  });
  await event(task.id, "task_dropped");
  return value;
}
export async function logTimer(task: Task, minutes: number) {
  if (minutes > 0) await event(task.id, "actual_time_logged", { minutes });
}

let planningProfileRequest: Promise<PlanningProfile> | undefined;
export function getPlanningProfile() {
  if (planningProfileRequest) return planningProfileRequest;
  planningProfileRequest = (async () => {
    const existing = await db.planningProfiles.toCollection().first();
    if (existing) return existing;
    const value: PlanningProfile = {
      ...base(),
      workDays: [1, 2, 3, 4, 5],
      preferredWorkWindows: ["09:00-17:00"],
      dailyFocusMinutes: 240,
      reservePercent: 20,
      maximumTodayCommitments: 3,
      minimumTaskMinutes: 5,
      preferredFocusSessionMinutes: 25,
      transitionBufferMinutes: 10,
      planningDetail: "balanced",
      breakdownStyle: "mixed",
      promptTone: "gentle",
      deadlineBufferDays: 2,
      weeklyReviewDay: 0,
      reduceDecoration: false,
    };
    await db.planningProfiles.add(value);
    await queue("planning_profile", value);
    return value;
  })().finally(() => {
    planningProfileRequest = undefined;
  });
  return planningProfileRequest;
}
export async function recordReview(
  kind: PlanningSession["kind"],
  inputs: Record<string, unknown>,
  status: PlanningSession["status"] = "completed",
) {
  const value: PlanningSession = { ...base(), kind, inputs, status };
  await db.planningSessions.add(value);
  await queue("planning_session", value);
  return value;
}
