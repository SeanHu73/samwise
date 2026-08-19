import type {Task} from '../types';
export type DeferDecision='reschedule'|'shrink'|'waiting'|'delegate'|'drop'|'someday';
export function rolloverState(deferCount:number):Task['rolloverState']{return deferCount>=2?'intervention_required':'decision_required'}
export function validateDeferral(task:Task,decision:DeferDecision,nextAction?:string){if(decision==='reschedule'&&!nextAction?.trim()&&task.deferCount>=1)return 'Rewrite the next action before this task stays active.';if(decision==='shrink'&&!nextAction?.trim())return 'Add a smaller, physical next action.';return null}
