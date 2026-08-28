import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useCompleted } from "../hooks/useData";
import { deleteTask } from "../lib/repository";
import { dateKey, todayKey } from "../lib/ids";
import { PriorityBadge } from "../components/PriorityBadge";
import { TaskDetail } from "../components/TaskDetail";
import type { Task } from "../types";

const completedDay = (task: Task) =>
  dateKey(new Date(task.completedAt ?? task.updatedAt));
function dayLabel(key: string) {
  if (key === todayKey()) return "Today";
  if (key === dateKey(new Date(Date.now() - 86_400_000))) return "Yesterday";
  const date = new Date(`${key}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    ...(key.slice(0, 4) !== todayKey().slice(0, 4) ? { year: "numeric" } : {}),
  }).format(date);
}

export function Completed() {
  const tasks = useCompleted();
  const [openId, setOpenId] = useState<string>();
  const [clearing, setClearing] = useState(false);
  const groups = useMemo(() => {
    const byDay = new Map<string, Task[]>();
    for (const task of tasks) {
      const key = completedDay(task);
      const list = byDay.get(key);
      if (list) list.push(task);
      else byDay.set(key, [task]);
    }
    return [...byDay.entries()];
  }, [tasks]);
  const clear = async () => {
    if (
      !window.confirm(
        `Clear ${tasks.length} completed task${tasks.length === 1 ? "" : "s"}? ` +
          "They will be removed from the app. Focus-session history stays in Insights.",
      )
    )
      return;
    setClearing(true);
    for (const task of tasks) await deleteTask(task);
    setClearing(false);
  };
  return (
    <>
      <header className="page-title">
        <span className="compass-mark">
          <CheckCircle2 />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-3xl font-bold">Completed</h1>
          <p className="mt-1 text-slate-600">
            The road already behind you, day by day.
          </p>
        </div>
        {!!tasks.length && (
          <button
            type="button"
            className="secondary shrink-0"
            disabled={clearing}
            onClick={() => void clear()}
          >
            {clearing ? "Clearing…" : "Clear all"}
          </button>
        )}
      </header>
      {!tasks.length && (
        <div className="mt-8 rounded-2xl border border-dashed border-sand p-6 text-sm text-slate-500">
          Nothing completed yet. Finish one small thing and it will appear
          here.
        </div>
      )}
      <div className="mt-6 space-y-7">
        {groups.map(([day, dayTasks]) => (
          <section key={day}>
            <h2 className="text-lg font-bold">
              {dayLabel(day)}
              <span className="ml-2 text-sm font-normal text-slate-500">
                {dayTasks.length} task{dayTasks.length === 1 ? "" : "s"}
              </span>
            </h2>
            <div className="mt-2 space-y-1.5">
              {dayTasks.map((task) => (
                <div key={task.id} className="trail-row">
                  <button
                    type="button"
                    onClick={() => setOpenId(task.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className="truncate line-through decoration-moss/50">
                      {task.title}
                    </span>
                    <PriorityBadge priority={task.priority} short />
                  </button>
                  <span className="shrink-0 text-xs text-slate-500">
                    {task.completedAt
                      ? new Date(task.completedAt).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      {openId && (
        <TaskDetail taskId={openId} onClose={() => setOpenId(undefined)} />
      )}
    </>
  );
}
