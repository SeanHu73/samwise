import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};
const promptVersion = "samwise-planner-v1";
const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    clarifyingQuestion: { type: ["string", "null"] },
    assumptions: { type: "array", items: { type: "string" } },
    taskDrafts: {
      type: "array",
      minItems: 0,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          parentTitle: { type: ["string", "null"] },
          nextAction: { type: "string" },
          estimatedMinutes: { type: "integer", minimum: 5, maximum: 480 },
          energy: { enum: ["low", "medium", "high"] },
          dependencyTitles: { type: "array", items: { type: "string" } },
          type: { enum: ["explore", "execute"] },
          rationale: { type: "string" },
        },
        required: [
          "title",
          "parentTitle",
          "nextAction",
          "estimatedMinutes",
          "energy",
          "dependencyTitles",
          "type",
          "rationale",
        ],
      },
    },
    risksOrUnknowns: { type: "array", items: { type: "string" } },
    planNotes: { type: "array", items: { type: "string" } },
    scheduleDrafts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          taskId: { type: "string" },
          proposedDate: { type: ["string", "null"] },
          commitment: { type: "boolean" },
          estimatedMinutes: { type: "integer" },
          rationale: { type: "string" },
          alternatives: { type: "array", items: { type: "string" } },
        },
        required: [
          "taskId",
          "proposedDate",
          "commitment",
          "estimatedMinutes",
          "rationale",
          "alternatives",
        ],
      },
    },
    capacityWarnings: { type: "array", items: { type: "string" } },
  },
  required: [
    "summary",
    "clarifyingQuestion",
    "assumptions",
    "taskDrafts",
    "risksOrUnknowns",
    "planNotes",
    "scheduleDrafts",
    "capacityWarnings",
  ],
};
const policy = `You are Samwise, a calm executive-function planning companion. Propose drafts; never claim to decide the user's priorities. Ask at most one question. Convert vague work into an observable definition of done and a verb-led first physical action. For broad uncertainty, create exploration steps (research, examples, conversations, criteria, decision) before execution. Produce 3–7 meaningful steps without trivial fragmentation. Use provided observed estimates before intuition and describe estimates as ranges in rationale. Keep daily commitments to 1–3, protect reserve and transition buffers, respect dependencies and real deadlines, leave overflow unscheduled, and never silently roll tasks forward. Calendar entries are constraints; ordinary tasks remain app intentions. Use supportive direct language without guilt, diagnosis, invented urgency, scoring, or hidden assumptions. Nothing you return is persisted until the user accepts it.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: cors },
    );
  const apiKey = req.headers.get("apikey") ?? "",
    auth = req.headers.get("Authorization") ?? "";
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
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey)
    return Response.json(
      {
        error:
          "OpenAI is not configured yet. Add OPENAI_API_KEY to Supabase Edge Function secrets.",
      },
      { status: 503, headers: cors },
    );
  const body = await req.json();
  const [{ data: profile }, { data: tasks }, { data: projects }] =
    await Promise.all([
      client
        .from("planning_profiles")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle(),
      client
        .from("tasks")
        .select(
          "id,title,next_action_text,status,priority,energy,estimated_minutes,estimate_low_minutes,estimate_high_minutes,due_date,planned_for_date,project_id",
        )
        .eq("owner_id", user.id)
        .is("deleted_at", null)
        .limit(100),
      client
        .from("projects")
        .select("id,title,purpose,definition_of_done,type,status")
        .eq("owner_id", user.id)
        .is("deleted_at", null)
        .limit(50),
    ]);
  const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-5.4";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${openaiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      instructions: policy,
      input: JSON.stringify({
        request: body.request,
        kind: body.kind ?? "breakdown",
        planningProfile: profile,
        tasks,
        projects,
      }),
      text: {
        format: {
          type: "json_schema",
          name: "samwise_plan",
          strict: true,
          schema,
        },
      },
    }),
  });
  if (!response.ok)
    return Response.json(
      {
        error: `Planner request failed (${response.status})`,
        detail: await response.text(),
      },
      { status: 502, headers: cors },
    );
  const raw = await response.json();
  const outputText = raw.output
    ?.flatMap((item: any) => item.content ?? [])
    .find((item: any) => item.type === "output_text")?.text;
  if (!outputText)
    return Response.json(
      { error: "Planner returned no structured result" },
      { status: 502, headers: cors },
    );
  return Response.json(
    { ...JSON.parse(outputText), promptVersion, model },
    { headers: { ...cors, "Content-Type": "application/json" } },
  );
});
