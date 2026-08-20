export type TaskStatus =
  | "inbox"
  | "next"
  | "planned"
  | "in_progress"
  | "done"
  | "deferred"
  | "dropped"
  | "delegated";
export type Energy = "low" | "medium" | "high";
export interface EntityBase {
  id: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  version: number;
}
export interface Area extends EntityBase {
  name: string;
  color: string;
  active: boolean;
}
export interface Direction extends EntityBase {
  title: string;
  description: string;
  horizonStart?: string;
  horizonEnd?: string;
  status: "active" | "parked" | "done";
  reviewCadence: "monthly" | "quarterly";
}
export interface Goal extends EntityBase {
  directionId?: string;
  title: string;
  definitionOfDone: string;
  targetDate?: string;
  status: "active" | "parked" | "done";
}
export interface Project extends EntityBase {
  goalId?: string;
  areaId?: string;
  title: string;
  purpose: string;
  definitionOfDone: string;
  type: "explore" | "execute";
  status: "active" | "paused" | "done";
  targetDate?: string;
  nextReview?: string;
}
export interface Milestone extends EntityBase {
  projectId: string;
  title: string;
  targetDate?: string;
  status: "pending" | "done";
  sortOrder: number;
}
export interface Task extends EntityBase {
  projectId?: string;
  milestoneId?: string;
  areaId?: string;
  parentTaskId?: string;
  title: string;
  descriptionMarkdown: string;
  status: TaskStatus;
  priority: 1 | 2 | 3 | 4;
  energy: Energy;
  context?: string;
  estimatedMinutes?: number;
  estimateLowMinutes?: number;
  estimateHighMinutes?: number;
  estimateConfidence: "low" | "medium" | "high";
  dueDate?: string;
  earliestStartDate?: string;
  plannedForDate?: string;
  isCommitment?: boolean;
  nextActionText: string;
  deferCount: number;
  lastDeferReason?: string;
  rolloverState: "clear" | "decision_required" | "intervention_required";
  sortOrder: number;
  completedAt?: string;
}
export type TaskEventType =
  | "task_created"
  | "estimate_set"
  | "timer_started"
  | "timer_stopped"
  | "actual_time_logged"
  | "task_completed"
  | "task_deferred"
  | "task_reactivated"
  | "task_dropped"
  | "task_split"
  | "task_planned";
export interface TaskEvent {
  id: string;
  ownerId: string;
  taskId: string;
  type: TaskEventType;
  occurredAt: string;
  minutes?: number;
  metadata?: Record<string, unknown>;
}
export interface Note extends EntityBase {
  projectId: string;
  title: string;
  markdownContent: string;
}
export interface Attachment extends EntityBase {
  projectId?: string;
  taskId?: string;
  storagePath: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}
export interface PlanningSession extends EntityBase {
  kind: "daily_close" | "weekly_reset" | "quarterly_review" | "ai_schedule";
  inputs: Record<string, unknown>;
  proposal?: Record<string, unknown>;
  approved?: Record<string, unknown>;
  status: "draft" | "approved" | "completed" | "skipped";
}
export interface PlanningProfile extends EntityBase {
  workDays: number[];
  preferredWorkWindows: string[];
  dailyFocusMinutes: number;
  reservePercent: number;
  maximumTodayCommitments: number;
  minimumTaskMinutes: number;
  preferredFocusSessionMinutes: number;
  transitionBufferMinutes: number;
  planningDetail: "compact" | "balanced" | "detailed";
  breakdownStyle: "smallest_start" | "outcome_steps" | "mixed";
  promptTone: "direct" | "gentle" | "coaching";
  deadlineBufferDays: number;
  weeklyReviewDay: number;
  reduceDecoration: boolean;
}
export interface CalendarEvent extends EntityBase {
  externalId: string;
  calendarId: string;
  title: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  travel: boolean;
  privacy: "details" | "busy_only";
}
export interface AgentRun extends EntityBase {
  kind: "breakdown" | "schedule" | "rewrite";
  promptVersion: string;
  model: string;
  input: Record<string, unknown>;
  result?: Record<string, unknown>;
  status: "draft" | "accepted" | "rejected" | "failed";
  feedback?: string[];
}
export type SyncEntityType =
  | "task"
  | "project"
  | "task_event"
  | "area"
  | "direction"
  | "goal"
  | "milestone"
  | "note"
  | "attachment"
  | "planning_session"
  | "planning_profile"
  | "calendar_event"
  | "agent_run";
export interface SyncOperation {
  operationId: string;
  deviceId: string;
  entityType: SyncEntityType;
  entityId: string;
  baseVersion: number;
  kind: "create" | "update_fields" | "delete";
  fields: Record<string, unknown>;
  clientCreatedAt: string;
  status: "pending" | "syncing" | "failed";
}
export interface SyncConflict {
  id: string;
  entityType: string;
  entityId: string;
  field: string;
  localValue: unknown;
  remoteValue: unknown;
  createdAt: string;
}
export interface DailySettings {
  id: "daily";
  workMinutes: number;
  reservePercent: number;
}
