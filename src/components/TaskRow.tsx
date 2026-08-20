import { Check, Clock3, Play } from "lucide-react";
import type { Task } from "../types";
import { completeTask, planToday } from "../lib/repository";
import { Link } from "react-router-dom";
export function TaskRow({
  task,
  onDefer,
  showPlan = false,
}: {
  task: Task;
  onDefer: (task: Task) => void;
  showPlan?: boolean;
}) {
  return (
    <article className="group rounded-2xl border border-sand bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <button
          aria-label={`Complete ${task.title}`}
          onClick={() => completeTask(task)}
          className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-full border-2 border-sage text-sage hover:bg-sage hover:text-white"
        >
          <Check size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-ink">{task.title}</h3>
          {task.nextActionText && (
            <p className="mt-1 text-sm text-slate-600">{task.nextActionText}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Clock3 size={15} />
              {task.estimateLowMinutes && task.estimateHighMinutes
                ? `${task.estimateLowMinutes}–${task.estimateHighMinutes} min`
                : task.estimatedMinutes
                  ? `about ${task.estimatedMinutes} min`
                  : "No estimate"}
            </span>
            <Link
              to={`/focus/${task.id}`}
              className="inline-flex min-h-11 items-center gap-1 rounded-lg px-3 font-semibold text-sage hover:bg-sand/50"
            >
              <Play size={15} />
              Focus
            </Link>
            <button
              onClick={() => onDefer(task)}
              className="min-h-11 rounded-lg px-3 text-slate-600 hover:bg-sand/50"
            >
              Replan
            </button>
            {showPlan && (
              <button
                onClick={() => planToday(task).catch((e) => alert(e.message))}
                className="min-h-11 rounded-lg px-3 text-sage hover:bg-sand/50"
              >
                Commit today
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
