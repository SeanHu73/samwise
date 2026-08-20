import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { CalendarRange, ChevronRight, Mountain, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAreas, useProjects, useTasks } from "../hooks/useData";
import { db } from "../lib/db";
import {
  captureTask,
  createAgentRun,
  createMilestone,
  createProject,
  updateMilestone,
  updateProject,
} from "../lib/repository";
import { supabase } from "../lib/supabase";
import type { Project, Task } from "../types";

const palette = [
  "#315C4C",
  "#A75436",
  "#365A7A",
  "#765489",
  "#9A7438",
  "#44705D",
];
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const projectColor = (project: Project, areas: ReturnType<typeof useAreas>) => {
  const areaColor = areas.find((area) => area.id === project.areaId)?.color;
  if (areaColor) return areaColor;
  const score = [...project.id].reduce(
    (total, letter) => total + letter.charCodeAt(0),
    0,
  );
  return palette[score % palette.length];
};
const nextMonths = () =>
  Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + index);
    return date;
  });
const weeksForMonth = (month: Date) => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const cursor = new Date(first);
  cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7));
  const weeks: Date[][] = [];
  while (cursor <= last) {
    const week = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(cursor);
      day.setDate(cursor.getDate() + index);
      return day;
    });
    weeks.push(week);
    cursor.setDate(cursor.getDate() + 7);
  }
  return weeks;
};
const taskDate = (task: Task) => task.plannedForDate || task.dueDate;

interface Advice {
  summary?: string;
  taskDrafts?: { title: string; nextAction: string }[];
  risksOrUnknowns?: string[];
  promptVersion?: string;
  model?: string;
}

export function BigPicture() {
  const projects = useProjects(),
    tasks = useTasks(),
    areas = useAreas(),
    milestones = useLiveQuery(
      () => db.milestones.filter((item) => !item.deletedAt).toArray(),
      [],
      [],
    ),
    months = useMemo(nextMonths, []),
    [title, setTitle] = useState(""),
    [targetDate, setTargetDate] = useState(""),
    [areaId, setAreaId] = useState(""),
    [selectedMonth, setSelectedMonth] = useState(months[0]),
    [selectedWeek, setSelectedWeek] = useState<Date[]>(),
    [advice, setAdvice] = useState<Advice>(),
    [adviceStatus, setAdviceStatus] = useState("");

  async function addPlan() {
    if (!title.trim()) return;
    const plan = await createProject(title, {
      targetDate: targetDate || undefined,
      areaId: areaId || undefined,
    });
    const request = `I just added this Big Picture plan: “${title.trim()}”${targetDate ? `, desired by ${targetDate}` : ""}. Recommend a realistic reverse-planned set of medium-term milestones and only the necessary short-term first tasks. Flag anything important I may have missed.`;
    setTitle("");
    setTargetDate("");
    setAreaId("");
    if (!supabase || !navigator.onLine) {
      setAdviceStatus(
        "Plan saved. AI recommendations will be available when online.",
      );
      return;
    }
    setAdviceStatus("Samwise is reverse-planning the path…");
    const { data, error } = await supabase.functions.invoke("planner", {
      body: { kind: "breakdown", request },
    });
    if (error) {
      setAdviceStatus(
        `Plan saved. Recommendations were unavailable: ${error.message}`,
      );
      return;
    }
    setAdvice(data);
    setAdviceStatus(
      "Recommendations ready. Nothing extra was added automatically.",
    );
    await createAgentRun({
      kind: "breakdown",
      promptVersion: data.promptVersion || "big-picture-v1",
      model: data.model || "unknown",
      input: { projectId: plan.id, request },
      result: data,
      status: "draft",
    });
  }

  const monthKey = dateKey(selectedMonth).slice(0, 7),
    weeks = weeksForMonth(selectedMonth);
  return (
    <>
      <header className="page-title">
        <span className="compass-mark">
          <Mountain />
        </span>
        <div>
          <p className="quiet-label">Big Picture</p>
          <h1 className="font-serif text-3xl font-bold">
            Plans worth building toward
          </h1>
          <p className="mt-1 text-slate-600">
            Start with the outcome, then work backward into milestones and
            tasks.
          </p>
        </div>
      </header>

      <form
        className="journey-card mt-7 grid gap-3 md:grid-cols-[1fr_11rem_12rem_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          void addPlan();
        }}
      >
        <input
          className="field"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="A meaningful outcome"
        />
        <input
          className="field"
          type="date"
          aria-label="Desired completion date"
          value={targetDate}
          onChange={(event) => setTargetDate(event.target.value)}
        />
        <select
          className="field"
          aria-label="Work category"
          value={areaId}
          onChange={(event) => setAreaId(event.target.value)}
        >
          <option value="">No category</option>
          {areas
            .filter((area) => area.active)
            .map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
        </select>
        <button className="primary">Add plan</button>
      </form>

      {adviceStatus && <p className="mt-3 text-sm text-moss">{adviceStatus}</p>}
      {advice && (
        <section className="journey-card mt-4 border-brass/50">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-brass" />
            <h2 className="font-serif text-lg font-bold">Samwise recommends</h2>
          </div>
          <p className="mt-2 text-sm text-slate-700">{advice.summary}</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {advice.taskDrafts?.map((draft, index) => (
              <div className="trail-row" key={`${draft.title}-${index}`}>
                <div>
                  <strong>{draft.title}</strong>
                  <p className="text-xs text-slate-600">{draft.nextAction}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="quiet-label">Active plans</p>
            <h2 className="font-serif text-2xl font-bold">Your horizons</h2>
          </div>
          <a href="#six-month-path" className="secondary">
            Six-month path
          </a>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const color = projectColor(project, areas);
            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group min-h-40 rounded-3xl p-5 text-white shadow-soft"
                style={{
                  background: `linear-gradient(145deg, ${color}, color-mix(in srgb, ${color} 65%, #17251d))`,
                }}
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  {project.targetDate
                    ? new Date(
                        `${project.targetDate}T12:00:00`,
                      ).toLocaleDateString(undefined, {
                        month: "short",
                        year: "numeric",
                      })
                    : "Open horizon"}
                </span>
                <h3 className="mt-4 font-serif text-2xl font-bold">
                  {project.title}
                </h3>
                <div className="mt-4 flex items-center text-sm text-white/80">
                  Reverse plan <ChevronRight size={17} />
                </div>
              </Link>
            );
          })}
          {!projects.length && (
            <p className="journey-card text-sm text-slate-500">
              Add the first outcome you want to build toward.
            </p>
          )}
        </div>
      </section>

      <section id="six-month-path" className="scroll-mt-6 pt-12">
        <div className="flex items-center gap-3">
          <CalendarRange className="text-brass" />
          <div>
            <p className="quiet-label">Six-month path</p>
            <h2 className="font-serif text-2xl font-bold">
              What should be done, and when
            </h2>
          </div>
        </div>
        <div className="scrollbar-none mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
          {months.map((month) => {
            const key = dateKey(month).slice(0, 7),
              monthProjects = projects.filter((item) =>
                item.targetDate?.startsWith(key),
              ),
              monthMilestones = milestones.filter((item) =>
                item.targetDate?.startsWith(key),
              );
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedMonth(month);
                  setSelectedWeek(undefined);
                }}
                className={`journey-card min-w-[78vw] snap-start text-left sm:min-w-72 ${monthKey === key ? "ring-2 ring-moss" : ""}`}
              >
                <span className="quiet-label">
                  {month.toLocaleDateString(undefined, { year: "numeric" })}
                </span>
                <h3 className="mt-1 font-serif text-xl font-bold">
                  {month.toLocaleDateString(undefined, { month: "long" })}
                </h3>
                <div className="mt-4 space-y-2 text-sm">
                  {monthProjects.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ background: projectColor(item, areas) }}
                      />
                      {item.title}
                    </div>
                  ))}
                  {monthMilestones.map((item) => (
                    <div key={item.id} className="text-slate-600">
                      Milestone · {item.title}
                    </div>
                  ))}
                  {!monthProjects.length && !monthMilestones.length && (
                    <span className="text-slate-500">Open for planning</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="journey-card mt-4">
          <h3 className="font-serif text-xl font-bold">
            {selectedMonth.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}{" "}
            by week
          </h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {weeks.map((week, index) => {
              const start = dateKey(week[0]),
                end = dateKey(week[6]),
                weekTasks = tasks.filter((task) => {
                  const date = taskDate(task);
                  return date && date >= start && date <= end;
                });
              return (
                <button
                  key={start}
                  onClick={() => setSelectedWeek(week)}
                  className={`trail-row min-h-16 text-left ${selectedWeek?.[0] && dateKey(selectedWeek[0]) === start ? "ring-2 ring-moss" : ""}`}
                >
                  <div>
                    <strong>Week {index + 1}</strong>
                    <p className="text-xs text-slate-500">
                      {week[0].toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                      –
                      {week[6].toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span>{weekTasks.length} tasks</span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedWeek && (
          <WeekDays
            week={selectedWeek}
            tasks={tasks}
            projects={projects}
            areas={areas}
          />
        )}
      </section>
    </>
  );
}

function WeekDays({
  week,
  tasks,
  projects,
  areas,
}: {
  week: Date[];
  tasks: Task[];
  projects: Project[];
  areas: ReturnType<typeof useAreas>;
}) {
  return (
    <div className="mt-4 grid gap-3 lg:grid-cols-7">
      {week.map((day) => {
        const key = dateKey(day),
          dayTasks = tasks.filter((task) => taskDate(task) === key);
        return (
          <section className="journey-card min-h-36 p-3" key={key}>
            <p className="quiet-label">
              {day.toLocaleDateString(undefined, { weekday: "short" })}
            </p>
            <h4 className="font-serif text-lg font-bold">{day.getDate()}</h4>
            <div className="mt-3 space-y-2">
              {dayTasks.map((task) => {
                const project = projects.find(
                    (item) => item.id === task.projectId,
                  ),
                  color = project ? projectColor(project, areas) : "#64748b";
                return (
                  <div
                    key={task.id}
                    className="rounded-lg border-l-4 p-2 text-xs"
                    style={{
                      borderColor: color,
                      background: `color-mix(in srgb, ${color} ${18 + (4 - task.priority) * 8}%, white)`,
                    }}
                  >
                    {task.title}
                  </div>
                );
              })}
              {!dayTasks.length && (
                <span className="text-xs text-slate-400">Open</span>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function BigPictureDetail() {
  const { id: projectId } = useParams(),
    project = useLiveQuery(
      () => (projectId ? db.projects.get(projectId) : undefined),
      [projectId],
    ),
    milestones = useLiveQuery(
      () =>
        projectId
          ? db.milestones
              .where("projectId")
              .equals(projectId)
              .filter((item) => !item.deletedAt)
              .sortBy("sortOrder")
          : [],
      [projectId],
      [],
    ),
    tasks = useLiveQuery(
      () =>
        projectId
          ? db.tasks
              .where("projectId")
              .equals(projectId)
              .filter((item) => !item.deletedAt)
              .toArray()
          : [],
      [projectId],
      [],
    ),
    areas = useAreas(),
    [milestoneTitle, setMilestoneTitle] = useState(""),
    [milestoneDate, setMilestoneDate] = useState(""),
    [taskTitle, setTaskTitle] = useState(""),
    [taskDateValue, setTaskDateValue] = useState(""),
    [taskMilestone, setTaskMilestone] = useState(""),
    [priority, setPriority] = useState<1 | 2 | 3 | 4>(3);
  if (!project) return <p>Big Picture plan not found.</p>;
  const color = projectColor(project, areas);
  return (
    <>
      <header
        className="rounded-3xl p-6 text-white shadow-soft"
        style={{
          background: `linear-gradient(145deg, ${color}, color-mix(in srgb, ${color} 65%, #17251d))`,
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
          Big Picture plan
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold">{project.title}</h1>
        <p className="mt-2 text-white/80">
          Work backward from the finish line.
        </p>
      </header>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="journey-card">
          <h2 className="font-serif text-xl font-bold">
            Outcome and finish line
          </h2>
          <textarea
            className="field mt-4 min-h-24"
            value={project.purpose}
            placeholder="Why does this matter?"
            onChange={(event) =>
              void updateProject(project, { purpose: event.target.value })
            }
          />
          <textarea
            className="field mt-3 min-h-24"
            value={project.definitionOfDone}
            placeholder="What will visibly be true when this is done?"
            onChange={(event) =>
              void updateProject(project, {
                definitionOfDone: event.target.value,
              })
            }
          />
          <label className="mt-3 grid gap-1 text-sm font-semibold">
            Desired completion date
            <input
              className="field"
              type="date"
              value={project.targetDate || ""}
              onChange={(event) =>
                void updateProject(project, {
                  targetDate: event.target.value || undefined,
                })
              }
            />
          </label>
          <Link
            to={`/assistant?project=${project.id}`}
            className="secondary mt-4 inline-flex items-center gap-2"
          >
            <Sparkles size={16} />
            Ask Samwise to revise the path
          </Link>
        </section>
        <section className="journey-card">
          <h2 className="font-serif text-xl font-bold">
            Medium-term milestones
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Add the checkpoints in reverse from the finish line.
          </p>
          <form
            className="mt-4 grid gap-2 sm:grid-cols-[1fr_10rem_auto]"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!milestoneTitle.trim()) return;
              await createMilestone(project.id, milestoneTitle, {
                targetDate: milestoneDate || undefined,
              });
              setMilestoneTitle("");
              setMilestoneDate("");
            }}
          >
            <input
              className="field"
              value={milestoneTitle}
              onChange={(event) => setMilestoneTitle(event.target.value)}
              placeholder="Milestone outcome"
            />
            <input
              className="field"
              type="date"
              aria-label="Milestone date"
              value={milestoneDate}
              onChange={(event) => setMilestoneDate(event.target.value)}
            />
            <button className="secondary">Add</button>
          </form>
          <div className="mt-3 space-y-2">
            {milestones.map((item) => (
              <button
                key={item.id}
                className="trail-row w-full text-left"
                onClick={() =>
                  void updateMilestone(item, {
                    status: item.status === "done" ? "pending" : "done",
                  })
                }
              >
                <span
                  className={
                    item.status === "done" ? "line-through opacity-60" : ""
                  }
                >
                  {item.title}
                </span>
                <span>{item.targetDate || "No date"}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="journey-card lg:col-span-2">
          <h2 className="font-serif text-xl font-bold">Short-term tasks</h2>
          <p className="mt-1 text-sm text-slate-600">
            Each task inherits this plan’s primary colour; priority changes its
            shade.
          </p>
          <form
            className="mt-4 grid gap-2 md:grid-cols-[1fr_11rem_10rem_8rem_auto]"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!taskTitle.trim()) return;
              await captureTask(taskTitle, {
                projectId: project.id,
                milestoneId: taskMilestone || undefined,
                dueDate: taskDateValue || undefined,
                status: "next",
                nextActionText: taskTitle.trim(),
                priority,
              });
              setTaskTitle("");
              setTaskDateValue("");
            }}
          >
            <input
              className="field"
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="Concrete next task"
            />
            <select
              className="field"
              value={taskMilestone}
              onChange={(event) => setTaskMilestone(event.target.value)}
            >
              <option value="">No milestone</option>
              {milestones.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <input
              className="field"
              type="date"
              aria-label="Task due date"
              value={taskDateValue}
              onChange={(event) => setTaskDateValue(event.target.value)}
            />
            <select
              className="field"
              aria-label="Task priority"
              value={priority}
              onChange={(event) =>
                setPriority(Number(event.target.value) as 1 | 2 | 3 | 4)
              }
            >
              {[1, 2, 3, 4].map((item) => (
                <option key={item} value={item}>
                  Priority {item}
                </option>
              ))}
            </select>
            <button className="primary">Add task</button>
          </form>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border-l-4 p-3 text-sm"
                style={{
                  borderColor: color,
                  background: `color-mix(in srgb, ${color} ${18 + (4 - task.priority) * 8}%, white)`,
                }}
              >
                <strong>{task.title}</strong>
                <p className="mt-1 text-xs text-slate-600">
                  {task.dueDate || "Available next"} · Priority {task.priority}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
