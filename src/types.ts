export type TaskStatus='inbox'|'next'|'planned'|'in_progress'|'done'|'deferred'|'dropped'|'delegated';
export type Energy='low'|'medium'|'high';
export interface EntityBase {id:string;ownerId:string;createdAt:string;updatedAt:string;deletedAt?:string;version:number}
export interface Project extends EntityBase {title:string;purpose:string;definitionOfDone:string;status:'active'|'paused'|'done';nextReview?:string}
export interface Task extends EntityBase {projectId?:string;parentTaskId?:string;title:string;descriptionMarkdown:string;status:TaskStatus;priority:1|2|3|4;energy:'low'|'medium'|'high';estimatedMinutes?:number;estimateLowMinutes?:number;estimateHighMinutes?:number;estimateConfidence:'low'|'medium'|'high';dueDate?:string;plannedForDate?:string;nextActionText:string;deferCount:number;lastDeferReason?:string;rolloverState:'clear'|'decision_required'|'intervention_required';sortOrder:number;completedAt?:string}
export type TaskEventType='task_created'|'estimate_set'|'timer_started'|'timer_stopped'|'actual_time_logged'|'task_completed'|'task_deferred'|'task_reactivated'|'task_dropped'|'task_split'|'task_planned';
export interface TaskEvent {id:string;ownerId:string;taskId:string;type:TaskEventType;occurredAt:string;minutes?:number;metadata?:Record<string,unknown>}
export interface SyncOperation {operationId:string;deviceId:string;entityType:'task'|'project'|'task_event';entityId:string;baseVersion:number;kind:'create'|'update_fields'|'delete';fields:Record<string,unknown>;clientCreatedAt:string;status:'pending'|'syncing'|'failed'}
export interface SyncConflict {id:string;entityType:string;entityId:string;field:string;localValue:unknown;remoteValue:unknown;createdAt:string}
export interface DailySettings {id:'daily';workMinutes:number;reservePercent:number}
