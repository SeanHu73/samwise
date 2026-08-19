import Dexie,{type EntityTable} from 'dexie';
import type {DailySettings,Project,SyncConflict,SyncOperation,Task,TaskEvent} from '../types';

export class SamwiseDB extends Dexie {
  tasks!:EntityTable<Task,'id'>; projects!:EntityTable<Project,'id'>; taskEvents!:EntityTable<TaskEvent,'id'>; outbox!:EntityTable<SyncOperation,'operationId'>; conflicts!:EntityTable<SyncConflict,'id'>; settings!:EntityTable<DailySettings,'id'>;
  constructor(){super('samwise');this.version(1).stores({tasks:'id,status,plannedForDate,projectId,updatedAt,deletedAt',projects:'id,status,updatedAt,deletedAt',taskEvents:'id,taskId,type,occurredAt',outbox:'operationId,status,entityType,entityId,clientCreatedAt',conflicts:'id,entityType,entityId,createdAt',settings:'id'});}
}
export const db=new SamwiseDB();
