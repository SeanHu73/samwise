import Dexie, { type EntityTable } from "dexie";
import type {
  AgentRun,
  Area,
  Attachment,
  CalendarEvent,
  DailySettings,
  Direction,
  Goal,
  Milestone,
  Note,
  PlanningProfile,
  PlanningSession,
  Project,
  SyncConflict,
  SyncOperation,
  Task,
  TaskEvent,
} from "../types";

export class SamwiseDB extends Dexie {
  tasks!: EntityTable<Task, "id">;
  projects!: EntityTable<Project, "id">;
  taskEvents!: EntityTable<TaskEvent, "id">;
  outbox!: EntityTable<SyncOperation, "operationId">;
  conflicts!: EntityTable<SyncConflict, "id">;
  settings!: EntityTable<DailySettings, "id">;
  areas!: EntityTable<Area, "id">;
  directions!: EntityTable<Direction, "id">;
  goals!: EntityTable<Goal, "id">;
  milestones!: EntityTable<Milestone, "id">;
  notes!: EntityTable<Note, "id">;
  attachments!: EntityTable<Attachment, "id">;
  planningSessions!: EntityTable<PlanningSession, "id">;
  planningProfiles!: EntityTable<PlanningProfile, "id">;
  calendarEvents!: EntityTable<CalendarEvent, "id">;
  agentRuns!: EntityTable<AgentRun, "id">;
  constructor() {
    super("samwise");
    this.version(1).stores({
      tasks: "id,status,plannedForDate,projectId,updatedAt,deletedAt",
      projects: "id,status,updatedAt,deletedAt",
      taskEvents: "id,taskId,type,occurredAt",
      outbox: "operationId,status,entityType,entityId,clientCreatedAt",
      conflicts: "id,entityType,entityId,createdAt",
      settings: "id",
    });
    this.version(2).stores({
      tasks:
        "id,status,plannedForDate,projectId,milestoneId,areaId,updatedAt,deletedAt",
      projects: "id,status,goalId,areaId,updatedAt,deletedAt",
      taskEvents: "id,taskId,type,occurredAt",
      outbox: "operationId,status,entityType,entityId,clientCreatedAt",
      conflicts: "id,entityType,entityId,createdAt",
      settings: "id",
      areas: "id,active,updatedAt",
      directions: "id,status,updatedAt",
      goals: "id,directionId,status,updatedAt",
      milestones: "id,projectId,status,sortOrder",
      notes: "id,projectId,updatedAt",
      attachments: "id,projectId,taskId,updatedAt",
      planningSessions: "id,kind,status,updatedAt",
      planningProfiles: "id,updatedAt",
      calendarEvents: "id,startAt,endAt,calendarId",
      agentRuns: "id,kind,status,createdAt",
    });
  }
}
export const db = new SamwiseDB();
