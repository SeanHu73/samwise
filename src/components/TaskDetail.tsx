import { useLiveQuery } from "dexie-react-hooks";
import { X } from "lucide-react";
import { db } from "../lib/db";
import {
  completeTask,
  deleteTask,
  dropTask,
  planTask,
  unplanTask,
  updateTask,
} from "../lib/repository";
import { useActiveAreas, useProjects } from "../hooks/useData";
import { AutoSaveText } from "./AutoSaveText";
import { priorityLabels } from "../lib/priority";

export function TaskDetail({
  taskId,
  onClose,
}: {
  taskId: string;
  onClose: () => void;
}) {
  // Always read the freshest copy so edits never build on a stale version.
  const task = useLiveQuery(() => db.tasks.get(taskId), [taskId]);
  const areas = useActiveAreas();
  const project = useProjects().find((item) => item.id === task?.projectId);
  if (!task || task.deletedAt) return null;
  const setDay = (date: string) =>
    date ? planTask(task, date) : unplanTask(task);
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-ink/35 sm:place-items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
    >
      <button
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close task details"
        type="button"
      />
      <div className="relative max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-cream p-6 shadow-soft sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3">
          <h2 id="task-detail-title" className="font-serif text-xl font-bold">
            Task details
          </h2>
          <button
            className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-sand"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <X size={19} />
          </button>
        </div>
        {project && (
          <p className="quiet-label mt-1">Part of “{project.title}”</p>
        )}
        <label className="mt-4 block text-sm font-semibold">Task</label>
        <AutoSaveText
          key={`title-${task.id}`}
          className="field mt-1"
          value={task.title}
          onSave={(title) =>
            title.trim() && void updateTask(task, { title: title.trim() })
          }
        />
        <fieldset className="mt-4">
          <legend className="mb-2 text-sm font-semibold">Priority</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {([1, 2, 3, 4] as const).map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => void updateTask(task, { priority: value })}
                className={
                  task.priority === value ? "primary px-2" : "secondary px-2"
                }
              >
                {priorityLabels[value]}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold">
            Planned day
            <input
              className="field"
              type="date"
              value={task.plannedForDate ?? ""}
              onChange={(event) => void setDay(event.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Due date
            <input
              className="field"
              type="date"
              value={task.dueDate ?? ""}
              onChange={(event) =>
                void updateTask(task, {
                  dueDate: (event.target.value || null) as unknown as undefined,
                })
              }
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Estimate (minutes)
            <AutoSaveText
              key={`estimate-${task.id}`}
              className="field"
              type="number"
              min={0}
              value={task.estimatedMinutes ? String(task.estimatedMinutes) : ""}
              onSave={(raw) =>
                void updateTask(task, {
                  estimatedMinutes: (Number(raw) > 0
                    ? Math.round(Number(raw))
                    : null) as unknown as undefined,
                })
              }
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Category
            <select
              className="field"
              value={task.areaId ?? ""}
              onChange={(event) =>
                void updateTask(task, {
                  areaId: (event.target.value || null) as unknown as undefined,
                })
              }
            >
              <option value="">No category</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-4 block text-sm font-semibold">Notes</label>
        <AutoSaveText
          key={`notes-${task.id}`}
          multiline
          className="field mt-1 min-h-28"
          placeholder="Anything worth remembering about this task."
          value={task.descriptionMarkdown}
          onSave={(descriptionMarkdown) =>
            void updateTask(task, { descriptionMarkdown })
          }
        />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              className="min-h-11 rounded-xl px-4 text-clay hover:bg-clay/10"
              onClick={() => {
                if (window.confirm(`Delete “${task.title}”?`)) {
                  void deleteTask(task);
                  onClose();
                }
              }}
            >
              Delete
            </button>
            <button
              type="button"
              className="min-h-11 rounded-xl px-4 text-slate-600 hover:bg-sand/60"
              onClick={() => {
                void dropTask(task);
                onClose();
              }}
            >
              Drop it
            </button>
          </div>
          <button
            type="button"
            className="primary"
            onClick={() => {
              void completeTask(task);
              onClose();
            }}
          >
            Mark done
          </button>
        </div>
      </div>
    </div>
  );
}
