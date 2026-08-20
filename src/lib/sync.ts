import {db} from './db';
import type {Project,SyncOperation,Task,TaskEvent} from '../types';
import {id,now} from './ids';
import {supabase} from './supabase';

type RemoteChange={sequence:number;entityType:'task'|'project'|'task_event';entity:Record<string,unknown>;conflicts:string[]};
type SyncPayload={results:Array<{operationId:string;ok:boolean}>;changes:RemoteChange[];nextCursor:number;hasMore:boolean};
let activeSync:Promise<{ok:boolean;reason?:string;count?:number}>|null=null;

export function mergeTask(local:Task,remote:Task):Task{
  if(local.status==='done'&&remote.status!=='done')return {...remote,...local,version:Math.max(local.version,remote.version)};
  if(remote.status==='done'&&local.status!=='done')return {...local,...remote,version:Math.max(local.version,remote.version)};
  return local.updatedAt>=remote.updatedAt?local:remote;
}

export function fromServerEntity(entityType:RemoteChange['entityType'],entity:Record<string,unknown>){
  const mapped=Object.fromEntries(Object.entries(entity).map(([key,value])=>[key.replace(/_([a-z])/g,(_match,letter:string)=>letter.toUpperCase()),value]));
  if(entityType==='task_event'){
    mapped.type=mapped.eventType;delete mapped.eventType;
  }
  for(const [key,value] of Object.entries(mapped))if(value===null)delete mapped[key];
  return mapped;
}

export async function queueOperation(operation:Omit<SyncOperation,'operationId'|'clientCreatedAt'|'status'>){
  await db.outbox.add({...operation,operationId:id(),clientCreatedAt:now(),status:'pending'});
  window.dispatchEvent(new Event('samwise:outbox'));
}

export function syncNow(){
  if(activeSync)return activeSync;
  activeSync=performSync().finally(()=>{activeSync=null});
  return activeSync;
}

async function performSync(){
  const url=import.meta.env.VITE_SUPABASE_URL;
  const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key||!supabase)return {ok:false,reason:'not_configured'};
  if(!navigator.onLine)return {ok:false,reason:'offline'};
  const {data}=await supabase.auth.getSession();
  const session=data.session;
  if(!session)return {ok:false,reason:'not_authenticated'};

  const pending=await db.outbox.orderBy('clientCreatedAt').toArray();
  if(pending.length)await db.outbox.bulkUpdate(pending.map(item=>({key:item.operationId,changes:{status:'syncing'}})));
  const cursorKey=`samwise-sync-cursor-${session.user.id}`;
  const cursor=Number(localStorage.getItem(cursorKey)??0);

  try{
    const response=await fetch(`${url}/functions/v1/sync`,{
      method:'POST',headers:{'content-type':'application/json',apikey:key,authorization:`Bearer ${session.access_token}`},
      body:JSON.stringify({operations:pending,cursor}),
    });
    if(!response.ok)throw new Error(`Sync request failed (${response.status})`);
    const payload=await response.json() as SyncPayload;
    await applyPayload(payload,cursorKey);
    const succeeded=payload.results.filter(result=>result.ok).map(result=>result.operationId);
    const failed=payload.results.filter(result=>!result.ok).map(result=>result.operationId);
    if(succeeded.length)await db.outbox.bulkDelete(succeeded);
    if(failed.length)await db.outbox.bulkUpdate(failed.map(operationId=>({key:operationId,changes:{status:'failed'}})));
    if(payload.hasMore)window.dispatchEvent(new Event('samwise:outbox'));
    return failed.length?{ok:false,reason:'operation_failed',count:succeeded.length}:{ok:true,count:succeeded.length};
  }catch{
    if(pending.length)await db.outbox.bulkUpdate(pending.map(item=>({key:item.operationId,changes:{status:'failed'}})));
    return {ok:false,reason:'request_failed'};
  }
}

async function applyPayload(payload:SyncPayload,cursorKey:string){
  await db.transaction('rw',[db.tasks,db.projects,db.taskEvents,db.conflicts],async()=>{
    for(const change of payload.changes){
      const entity=fromServerEntity(change.entityType,change.entity);
      if(change.entityType==='task')await db.tasks.put(entity as unknown as Task);
      else if(change.entityType==='project')await db.projects.put(entity as unknown as Project);
      else await db.taskEvents.put(entity as unknown as TaskEvent);
      for(const field of change.conflicts??[]){
        await db.conflicts.put({id:`${change.entityType}:${String(entity.id)}:${field}:${change.sequence}`,entityType:change.entityType,entityId:String(entity.id),field,localValue:'Preserved on this device',remoteValue:(entity as Record<string,unknown>)[field],createdAt:now()});
      }
    }
  });
  localStorage.setItem(cursorKey,String(payload.nextCursor));
}
