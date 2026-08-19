import {useLiveQuery} from 'dexie-react-hooks';
import {db} from '../lib/db'; import {todayKey} from '../lib/ids';
export const useInbox=()=>useLiveQuery(()=>db.tasks.where('status').equals('inbox').filter(x=>!x.deletedAt).sortBy('sortOrder'),[],[]);
export const useToday=()=>useLiveQuery(()=>db.tasks.where('plannedForDate').equals(todayKey()).filter(x=>!x.deletedAt&&x.status!=='done'&&x.status!=='dropped').sortBy('sortOrder'),[],[]);
export const useAvailable=()=>useLiveQuery(()=>db.tasks.where('status').equals('next').filter(x=>!x.deletedAt).sortBy('sortOrder'),[],[]);
export const useProjects=()=>useLiveQuery(()=>db.projects.filter(x=>!x.deletedAt).sortBy('updatedAt'),[],[]);
export const useOutboxCount=()=>useLiveQuery(()=>db.outbox.count(),[],0);
