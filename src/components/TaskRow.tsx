import { Check, ChevronDown, ChevronUp, Clock3, Play } from "lucide-react";
import { Link } from "react-router-dom";
import type { Task } from "../types";
import { completeTask, planToday } from "../lib/repository";
import { todayKey } from "../lib/ids";
import { taskOnDay } from "../lib/taskDays";
import { useAreas, useProjects } from "../hooks/useData";
import { PriorityBadge } from "./PriorityBadge";
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
  onOpen,
  onMoveUp,
  onMoveDown,
}: {
  task: Task;
  onOpen: (task: Task) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
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
          <button
            type="button"
            onClick={() => onOpen(task)}
            className="block w-full text-left"
          >
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-ink group-hover:underline">
                {task.title}
              </span>
              <PriorityBadge priority={task.priority} />
            </span>
            {area && (
              <span className="quiet-label mt-1 inline-block">{area.name}</span>
            )}
            {task.descriptionMarkdown && (
              <span className="mt-1 line-clamp-1 block text-sm text-slate-600">
                {task.descriptionMarkdown}
              </span>
            )}
          </button>
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
            {!taskOnDay(task, todayKey()) && (
              <button
                onClick={() => void planToday(task)}
                className="min-h-11 rounded-lg px-3 text-sage hover:bg-sand/50"
              >
                Do today
              </button>
            )}
            <button
              onClick={() => onOpen(task)}
              className="min-h-11 rounded-lg px-3 text-slate-600 hover:bg-sand/50"
            >
              Details
            </button>
          </div>
        </div>
        {(onMoveUp || onMoveDown) && (
          <div className="flex shrink-0 flex-col gap-1">
            <button
              type="button"
              aria-label={`Move ${task.title} up`}
              disabled={!onMoveUp}
              onClick={onMoveUp}
              className="grid size-9 place-items-center rounded-lg border border-sand text-slate-500 hover:bg-sand/50 disabled:opacity-30"
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              aria-label={`Move ${task.title} down`}
              disabled={!onMoveDown}
              onClick={onMoveDown}
              className="grid size-9 place-items-center rounded-lg border border-sand text-slate-500 hover:bg-sand/50 disabled:opacity-30"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
