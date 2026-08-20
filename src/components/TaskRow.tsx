import { Check, Clock3, Play } from "lucide-react";
import type { Task } from "../types";
import { completeTask, planToday } from "../lib/repository";
import { Link } from "react-router-dom";
import { useAreas, useProjects } from "../hooks/useData";
const palette = [
  "#315C4C",
  "#A75436",
  "#365A7A",
  "#765489",
  "#9A7438",
  "#44705D",
];
export function TaskRow({
  task,
  onDefer,
  showPlan = false,
}: {
  task: Task;
  onDefer: (task: Task) => void;
  showPlan?: boolean;
}) {
  const areas = useAreas(),
    area = areas.find((item) => item.id === task.areaId),
    project = useProjects().find((item) => item.id === task.projectId),
    projectArea = areas.find((item) => item.id === project?.areaId),
    color = project
      ? projectArea?.color ||
        palette[
          [...project.id].reduce(
            (total, letter) => total + letter.charCodeAt(0),
            0,
          ) % palette.length
        ]
      : undefined;
  return (
    <article
      className={`group rounded-2xl border border-sand bg-white p-4 shadow-sm ${color ? "border-l-4" : ""}`}
      style={
        color
          ? {
              borderLeftColor: color,
              background: `color-mix(in srgb, ${color} ${8 + (4 - task.priority) * 4}%, white)`,
            }
          : undefined
      }
    >
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
          {area && (
            <span className="quiet-label mt-1 inline-block">{area.name}</span>
          )}
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
