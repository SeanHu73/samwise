import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe,expect,it} from 'vitest';

const source=readFileSync(resolve(process.cwd(),'supabase/functions/sync/index.ts'),'utf8');

describe('sync account isolation',()=>{
  it('scopes operation lookup and pull to the authenticated owner',()=>{
    expect(source).toContain(".eq('owner_id',user.id).eq('operation_id',operation.operationId)");
    expect(source).toContain(".select('server_sequence,entity_type,result').eq('owner_id',user.id).gt('server_sequence',cursor)");
  });

  it('scopes mutable entity reads and writes to the authenticated owner',()=>{
    expect(source).toContain(".select('*').eq('owner_id',ownerId).eq('id',operation.entityId)");
    expect(source.match(/\.eq\('owner_id',ownerId\)\.eq\('id',operation\.entityId\)/g)).toHaveLength(3);
  });
});
