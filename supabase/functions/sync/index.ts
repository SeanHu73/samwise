import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type EntityType =
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
type Operation = {
  operationId: string;
  deviceId: string;
  entityType: EntityType;
  entityId: string;
  baseVersion: number;
  kind: "create" | "update_fields" | "delete";
  fields: Record<string, unknown>;
  clientCreatedAt: string;
};
type OperationResult = {
  operationId: string;
  ok: boolean;
  error?: string;
  entityType: EntityType;
  entity?: Record<string, unknown>;
  conflicts?: string[];
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: cors },
    );

  const auth = req.headers.get("Authorization") ?? "";
  const apiKey = req.headers.get("apikey") ?? "";
  const client = createClient(Deno.env.get("SUPABASE_URL")!, apiKey, {
    global: { headers: { Authorization: auth } },
  });
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user)
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: cors },
    );

  const body = (await req.json()) as {
    operations?: Operation[];
    cursor?: number;
  };
  const operations = [...(body.operations ?? [])].sort((a, b) =>
    a.clientCreatedAt.localeCompare(b.clientCreatedAt),
  );
  const results: OperationResult[] = [];

  for (const operation of operations) {
    const { data: prior } = await client
      .from("sync_operations")
      .select("result")
      .eq("owner_id", user.id)
      .eq("operation_id", operation.operationId)
      .maybeSingle();
    if (prior?.result) {
      results.push(prior.result as OperationResult);
      continue;
    }

    const result = await applyOperation(client, user.id, operation);
    results.push(result);
    if (!result.ok) continue;

    const { error: logError } = await client.from("sync_operations").insert({
      operation_id: operation.operationId,
      owner_id: user.id,
      device_id: operation.deviceId,
      entity_type: operation.entityType,
      entity_id: operation.entityId,
      base_version: operation.baseVersion,
      kind: operation.kind,
      fields: operation.fields,
      client_created_at: operation.clientCreatedAt,
      result,
    });
    if (logError)
      results[results.length - 1] = {
        ...result,
        ok: false,
        error: `Operation log: ${logError.message}`,
      };
  }

  const cursor = Number.isFinite(body.cursor) ? Number(body.cursor) : 0;
  const { data: rows, error: pullError } = await client
    .from("sync_operations")
    .select("server_sequence,entity_type,result")
    .eq("owner_id", user.id)
    .gt("server_sequence", cursor)
    .order("server_sequence", { ascending: true })
    .limit(1000);
  if (pullError)
    return Response.json(
      { error: pullError.message, results },
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
    );

  const changes = (rows ?? []).flatMap((row) => {
    const result = row.result as OperationResult;
    return result?.entity
      ? [
          {
            sequence: Number(row.server_sequence),
            entityType: row.entity_type as EntityType,
            entity: result.entity,
            conflicts: result.conflicts ?? [],
          },
        ]
      : [];
  });
  const nextCursor = rows?.length
    ? Number(rows[rows.length - 1].server_sequence)
    : cursor;
  return Response.json(
    { results, changes, nextCursor, hasMore: (rows?.length ?? 0) === 1000 },
    { headers: { ...cors, "Content-Type": "application/json" } },
  );
});

async function applyOperation(
  client: any,
  ownerId: string,
  operation: Operation,
): Promise<OperationResult> {
  const table = tableName(operation.entityType);
  const fields = normalizeFields(operation.entityType, operation.fields);
  const base = {
    operationId: operation.operationId,
    entityType: operation.entityType,
  };

  if (operation.entityType === "task_event") {
    const { data, error } = await client
      .from(table)
      .upsert({ ...fields, owner_id: ownerId }, { onConflict: "id" })
      .select()
      .single();
    return error
      ? { ...base, ok: false, error: error.message }
      : { ...base, ok: true, entity: data };
  }

  if (operation.kind === "create") {
    const { data, error } = await client
      .from(table)
      .upsert({ ...fields, owner_id: ownerId }, { onConflict: "id" })
      .select()
      .single();
    return error
      ? { ...base, ok: false, error: error.message }
      : { ...base, ok: true, entity: data };
  }

  const { data: current, error: readError } = await client
    .from(table)
    .select("*")
    .eq("owner_id", ownerId)
    .eq("id", operation.entityId)
    .maybeSingle();
  if (readError || !current)
    return {
      ...base,
      ok: false,
      error: readError?.message ?? "Entity not found",
    };

  if (operation.kind === "delete") {
    const { data, error } = await client
      .from(table)
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: Number(current.version) + 1,
      })
      .eq("owner_id", ownerId)
      .eq("id", operation.entityId)
      .select()
      .single();
    return error
      ? { ...base, ok: false, error: error.message }
      : { ...base, ok: true, entity: data };
  }

  const patch = { ...fields };
  delete patch.id;
  delete patch.owner_id;
  delete patch.created_at;
  delete patch.version;
  const conflicts: string[] = [];
  if (Number(current.version) !== operation.baseVersion) {
    if (
      operation.entityType === "task" &&
      current.status === "done" &&
      patch.status &&
      patch.status !== "done"
    )
      delete patch.status;
    for (const field of longTextFields(operation.entityType)) {
      if (field in patch && patch[field] !== current[field]) {
        await client
          .from("sync_conflicts")
          .insert({
            owner_id: ownerId,
            entity_type: operation.entityType,
            entity_id: operation.entityId,
            field,
            local_value: patch[field],
            remote_value: current[field],
          });
        conflicts.push(field);
        delete patch[field];
      }
    }
  }
  const { data, error } = await client
    .from(table)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
      version: Number(current.version) + 1,
    })
    .eq("owner_id", ownerId)
    .eq("id", operation.entityId)
    .select()
    .single();
  return error
    ? { ...base, ok: false, error: error.message }
    : { ...base, ok: true, entity: data, conflicts };
}

function normalizeFields(
  entityType: EntityType,
  value: Record<string, unknown>,
) {
  const fields = Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
      item,
    ]),
  );
  if (entityType === "task_event" && "type" in fields) {
    fields.event_type = fields.type;
    delete fields.type;
  }
  return fields;
}

function longTextFields(entityType: EntityType) {
  return entityType === "task"
    ? ["description_markdown"]
    : entityType === "project"
      ? ["purpose", "definition_of_done"]
      : entityType === "note"
        ? ["markdown_content"]
        : entityType === "direction"
          ? ["description"]
          : [];
}

function tableName(type: EntityType) {
  return (
    {
      task: "tasks",
      project: "projects",
      task_event: "task_events",
      area: "areas",
      direction: "directions",
      goal: "goals",
      milestone: "milestones",
      note: "notes",
      attachment: "attachments",
      planning_session: "planning_sessions",
      planning_profile: "planning_profiles",
      calendar_event: "calendar_event_cache",
      agent_run: "agent_runs",
    } as Record<EntityType, string>
  )[type];
}
