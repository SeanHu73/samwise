import type { Task } from "../types";
import { db } from "./db";
import { createAgentRun, updateTask } from "./repository";
import { supabase } from "./supabase";

interface AssessmentResult {
  summary?: string;
  promptVersion?: string;
  model?: string;
  taskDrafts?: { nextAction?: string }[];
}

export async function assessCapturedTask(task: Task) {
  if (!supabase || !navigator.onLine) return;
  const { data, error } = await supabase.functions.invoke("planner", {
    body: {
      kind: "breakdown",
      request: `Briefly assess this newly captured item: “${task.title}”. Decide whether it already states a concrete action. If it needs one, suggest only the first useful physical action. Do not expand it into a full plan unless genuinely necessary.`,
    },
  });
  if (error || !data) return;
  const result = data as AssessmentResult;
  const current = await db.tasks.get(task.id);
  if (!current || current.deletedAt) return;
  const suggestion = result.taskDrafts?.[0]?.nextAction?.trim();
  await updateTask(current, {
    nextActionText: suggestion || current.nextActionText || current.title,
    descriptionMarkdown: result.summary
      ? `Samwise check: ${result.summary}`
      : current.descriptionMarkdown,
  });
  await createAgentRun({
    kind: "breakdown",
    promptVersion: result.promptVersion || "capture-v1",
    model: result.model || "unknown",
    input: { taskId: task.id, title: task.title },
    result: data,
    status: "accepted",
  });
}
