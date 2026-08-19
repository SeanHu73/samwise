import {db} from './db';
import type {SyncOperation,Task} from '../types';
import {id,now} from './ids';
import {supabase} from './supabase';

export function mergeTask(local:Task,remote:Task):Task{
  if(local.status==='done'&&remote.status!=='done')return {...remote,...local,version:Math.max(local.version,remote.version)};
  if(remote.status==='done'&&local.status!=='done')return {...local,...remote,version:Math.max(local.version,remote.version)};
  return local.updatedAt>=remote.updatedAt?local:remote;
}
export async function queueOperation(operation:Omit<SyncOperation,'operationId'|'clientCreatedAt'|'status'>){await db.outbox.add({...operation,operationId:id(),clientCreatedAt:now(),status:'pending'})}
export async function syncNow(){const url=import.meta.env.VITE_SUPABASE_URL;const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;if(!url||!key||!supabase)return {ok:false,reason:'not_configured'};const pending=await db.outbox.where('status').equals('pending').toArray();if(!pending.length)return {ok:true,count:0};const {data}=await supabase.auth.getSession();const token=data.session?.access_token;if(!token)return {ok:false,reason:'not_authenticated'};const response=await fetch(`${url}/functions/v1/sync`,{method:'POST',headers:{'content-type':'application/json',apikey:key,authorization:`Bearer ${token}`},body:JSON.stringify({operations:pending})});if(!response.ok){await db.outbox.bulkUpdate(pending.map(x=>({key:x.operationId,changes:{status:'failed'}})));return {ok:false,reason:'request_failed'}}await db.outbox.bulkDelete(pending.map(x=>x.operationId));return {ok:true,count:pending.length}}
