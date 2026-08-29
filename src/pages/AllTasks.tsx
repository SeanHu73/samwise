import { useMemo, useState } from "react";
import { ListTodo } from "lucide-react";
import { useProjects, useTasks } from "../hooks/useData";
import { taskDays } from "../lib/taskDays";
import { PriorityBadge } from "../components/PriorityBadge";
import { TaskDetail } from "../components/TaskDetail";
import type { Task } from "../types";

const dayLabel = (day: string) =>
  new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
    new Date(`${day}T12:00:00`),
  );

export function AllTasks() {
  const tasks = useTasks(),
    projects = useProjects();
  const [query, setQuery] = useState(""),
    [openId, setOpenId] = useState<string>();
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (t: Task) =>
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.descriptionMarkdown.toLowerCase().includes(q);
    const open = tasks.filter(
      (t) => t.status !== "done" && t.status !== "dropped" && matches(t),
    );
    return [
      {
        title: "Scheduled",
        tasks: open
          .filter((t) => taskDays(t).length)
          .sort((a, b) => taskDays(a)[0].localeCompare(taskDays(b)[0])),
      },
      {
        title: "No day yet",
        tasks: open
          .filter((t) => !taskDays(t).length)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      },
      {
        title: "Completed",
        tasks: tasks
          .filter((t) => t.status === "done" && matches(t))
          .sort((a, b) =>
            (b.completedAt ?? b.updatedAt).localeCompare(
              a.completedAt ?? a.updatedAt,
            ),
          ),
      },
      {
        title: "Dropped",
        tasks: tasks
          .filter((t) => t.status === "dropped" && matches(t))
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      },
    ];
  }, [tasks, query]);
  return (
    <>
      <header className="page-title">
        <span className="compass-mark">
          <ListTodo />
        </span>
        <div>
          <h1 className="font-serif text-3xl font-bold">All tasks</h1>
          <p className="mt-1 text-slate-600">
            Everything in one place, wherever it lives.
          </p>
        </div>
      </header>
      <input
        className="field mt-6"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search titles and notes…"
        aria-label="Search tasks"
      />
      <div className="mt-6 space-y-7">
        {groups.map(
          ({ title, tasks: sectionTasks }) =>
            !!sectionTasks.length && (
              <section key={title}>
                <h2 className="text-lg font-bold">
                  {title}
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    {sectionTasks.length}
                  </span>
                </h2>
                <div className="mt-2 space-y-1.5">
                  {sectionTasks.map((task) => {
                    const days = taskDays(task);
                    const project = projects.find(
                      (p) => p.id === task.projectId,
                    );
                    const muted =
                      task.status === "done" || task.status === "dropped";
                    return (
                      <div key={task.id} className="trail-row">
                        <button
                          type="button"
                          onClick={() => setOpenId(task.id)}
                          className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-left"
                        >
                          <span
                            className={`truncate ${muted ? "text-slate-500 line-through decoration-moss/50" : ""}`}
                          >
                            {task.title}
                          </span>
                          <PriorityBadge priority={task.priority} short />
                          {project && (
                            <span className="quiet-label">{project.title}</span>
                          )}
                        </button>
                        <span className="shrink-0 text-xs text-slate-500">
                          {days.length
                            ? days.map(dayLabel).join(" · ")
                            : task.dueDate
                              ? `due ${dayLabel(task.dueDate)}`
                              : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            ),
        )}
      </div>
      {!tasks.length && (
        <div className="mt-8 rounded-2xl border border-dashed border-sand p-6 text-sm text-slate-500">
          No tasks yet. Capture your first thought and it will appear here.
        </div>
      )}
      {openId && (
        <TaskDetail taskId={openId} onClose={() => setOpenId(undefined)} />
      )}
    </>
  );
}
