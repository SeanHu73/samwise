import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  Compass,
  FileText,
  Map,
  Mountain,
  ScrollText,
  Sparkles,
  Upload,
} from "lucide-react";
import { db } from "../lib/db";
import {
  createAgentRun,
  createAttachment,
  captureTask,
  createDirection,
  createGoal,
  createMilestone,
  createNote,
  createProject,
  getPlanningProfile,
  planTask,
  recordReview,
  saveEntity,
  updateDirection,
  updateMilestone,
  updateNote,
  updateProject,
} from "../lib/repository";
import { supabase } from "../lib/supabase";
import { fromServerEntity } from "../lib/sync";
import { durationProfile } from "../lib/duration";
import { id, todayKey } from "../lib/ids";
import {
  useCalendarEvents,
  useDirections,
  useGoals,
  useProjects,
  useTaskEvents,
  useTasks,
} from "../hooks/useData";
import type {
  Attachment,
  Direction,
  Goal,
  Note,
  PlanningProfile,
} from "../types";

interface PlannerDraft {
  title: string;
  nextAction: string;
  estimatedMinutes: number;
  energy: "low" | "medium" | "high";
}
interface ScheduleDraft {
  taskId: string;
  proposedDate: string | null;
  commitment: boolean;
  estimatedMinutes: number;
  rationale: string;
  alternatives: string[];
}
interface PlannerResult {
  summary: string;
  clarifyingQuestion?: string | null;
  taskDrafts: PlannerDraft[];
  scheduleDrafts: ScheduleDraft[];
  capacityWarnings: string[];
  promptVersion: string;
  model: string;
}

const Field = ({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="grid gap-1 text-sm font-semibold">
    {label}
    <input {...props} className="field" />
  </label>
);
const Panel = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="journey-card">
    <h2 className="font-serif text-xl font-bold">{title}</h2>
    <div className="mt-4">{children}</div>
  </section>
);

export function Plan() {
  const tasks = useTasks(),
    events = useCalendarEvents(),
    [message, setMessage] = useState("");
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  return (
    <>
      <PageTitle
        icon={<Map />}
        title="Seven-day path"
        subtitle="Intentions with breathing room—not a packed calendar."
      />
      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        {days.map((date) => {
          const key = date.toISOString().slice(0, 10),
            planned = tasks.filter(
              (t) => t.plannedForDate === key && t.status !== "done",
            ),
            busy = events
              .filter((e) => e.startAt.slice(0, 10) === key)
              .reduce(
                (n, e) =>
                  n +
                  (new Date(e.endAt).getTime() -
                    new Date(e.startAt).getTime()) /
                    60000,
                0,
              );
          return (
            <section key={key} className="journey-card min-h-44">
              <div className="flex justify-between">
                <h2 className="font-serif text-lg font-bold">
                  {new Intl.DateTimeFormat(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  }).format(date)}
                </h2>
                <span className="quiet-label">
                  {Math.round(busy / 60)}h busy
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {planned.map((t) => (
                  <div key={t.id} className="trail-row">
                    <span>{t.title}</span>
                    <span>
                      {t.estimatedMinutes ? `${t.estimatedMinutes}m` : ""}
                    </span>
                  </div>
                ))}
                {!planned.length && (
                  <p className="text-sm text-slate-500">Room for reality.</p>
                )}
              </div>
              <select
                aria-label={`Add task to ${key}`}
                className="field mt-3"
                defaultValue=""
                onChange={async (e) => {
                  const task = tasks.find((t) => t.id === e.target.value);
                  if (task)
                    try {
                      await planTask(task, key, false);
                      setMessage("Path updated.");
                    } catch (error) {
                      setMessage((error as Error).message);
                    }
                  e.target.value = "";
                }}
              >
                <option value="">Add an available task…</option>
                {tasks
                  .filter(
                    (t) =>
                      !t.plannedForDate &&
                      ["next", "inbox", "deferred"].includes(t.status),
                  )
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
              </select>
            </section>
          );
        })}
      </div>
      {message && <p className="mt-4 text-sm text-moss">{message}</p>}
    </>
  );
}

export function Projects() {
  const projects = useProjects(),
    [title, setTitle] = useState("");
  return (
    <>
      <PageTitle
        icon={<Compass />}
        title="Projects"
        subtitle="Purpose → milestone → next action."
      />
      <form
        className="mt-6 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (title.trim()) {
            await createProject(title);
            setTitle("");
          }
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A concrete project outcome"
          className="field flex-1"
        />
        <button className="primary">Add project</button>
      </form>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            className="journey-card group"
          >
            <span className="quiet-label">
              {p.type === "explore" ? "Exploration" : "Journey"}
            </span>
            <h2 className="mt-2 font-serif text-xl font-bold group-hover:text-moss">
              {p.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {p.purpose || "Add why this journey matters."}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}

export function ProjectDetail() {
  const { id: projectId } = useParams(),
    project = useLiveQuery(
      () => (projectId ? db.projects.get(projectId) : undefined),
      [projectId],
    ),
    milestones = useLiveQuery(
      () =>
        projectId
          ? db.milestones.where("projectId").equals(projectId).toArray()
          : [],
      [projectId],
      [],
    ),
    notes = useLiveQuery(
      () =>
        projectId
          ? db.notes.where("projectId").equals(projectId).toArray()
          : [],
      [projectId],
      [],
    ),
    attachments = useLiveQuery(
      () =>
        projectId
          ? db.attachments
              .where("projectId")
              .equals(projectId)
              .filter((x) => !x.deletedAt)
              .toArray()
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
              .filter((x) => !x.deletedAt)
              .toArray()
          : [],
      [projectId],
      [],
    ),
    [milestone, setMilestone] = useState("");
  if (!project) return <p>Project not found.</p>;
  return (
    <>
      <PageTitle
        icon={<Mountain />}
        title={project.title}
        subtitle={
          project.type === "explore"
            ? "Explore uncertainty before committing to execution."
            : "Keep only the next meaningful stretch visible."
        }
      />
      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <Panel title="Purpose and finish line">
          <textarea
            className="field min-h-24"
            value={project.purpose}
            placeholder="Why does this matter?"
            onChange={(e) =>
              void updateProject(project, { purpose: e.target.value })
            }
          />
          <textarea
            className="field mt-3 min-h-24"
            value={project.definitionOfDone}
            placeholder="What observable result means done?"
            onChange={(e) =>
              void updateProject(project, { definitionOfDone: e.target.value })
            }
          />
          <label className="mt-3 flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={project.type === "explore"}
              onChange={(e) =>
                void updateProject(project, {
                  type: e.target.checked ? "explore" : "execute",
                })
              }
            />{" "}
            Exploration project
          </label>
        </Panel>
        <Panel title="Trail markers">
          <form
            className="flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (milestone.trim()) {
                await createMilestone(project.id, milestone);
                setMilestone("");
              }
            }}
          >
            <input
              className="field flex-1"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
              placeholder="Observable milestone"
            />
            <button className="secondary">Add</button>
          </form>
          <div className="mt-3 space-y-2">
            {milestones.map((m) => (
              <button
                key={m.id}
                className="trail-row w-full text-left"
                onClick={() =>
                  void updateMilestone(m, {
                    status: m.status === "done" ? "pending" : "done",
                  })
                }
              >
                <span
                  className={
                    m.status === "done" ? "line-through opacity-60" : ""
                  }
                >
                  {m.title}
                </span>
                <span>{m.status === "done" ? "Done" : "Next"}</span>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Next actions">
          {tasks.map((t) => (
            <div key={t.id} className="trail-row">
              <span>{t.title}</span>
              <span>{t.nextActionText}</span>
            </div>
          ))}
          {!tasks.length && (
            <p className="text-sm text-slate-500">
              No actions yet. Ask Samwise to draft a path.
            </p>
          )}
          <Link
            className="secondary mt-3 inline-block"
            to={`/assistant?project=${project.id}`}
          >
            Plan with Samwise
          </Link>
        </Panel>
        <Panel title="Field notes and files">
          <button
            className="secondary"
            onClick={() => void createNote(project.id)}
          >
            New note
          </button>
          {notes.map((n) => (
            <NoteEditor key={n.id} note={n} />
          ))}
          <AttachmentUpload projectId={project.id} />
          <div className="mt-3 space-y-2">
            {attachments.map((file) => (
              <AttachmentLink key={file.id} file={file} />
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function AttachmentLink({ file }: { file: Attachment }) {
  const open = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.storage
      .from("attachments")
      .createSignedUrl(file.storagePath, 60);
    if (!error) window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };
  return (
    <button className="trail-row w-full text-left" onClick={() => void open()}>
      <span>{file.filename}</span>
      <span>{Math.ceil(file.sizeBytes / 1024)} KB</span>
    </button>
  );
}

function NoteEditor({ note }: { note: Note }) {
  return (
    <article className="mt-3">
      <input
        className="field"
        value={note.title}
        onChange={(e) => void updateNote(note, { title: e.target.value })}
      />
      <textarea
        className="field mt-2 min-h-28"
        value={note.markdownContent}
        onChange={(e) =>
          void updateNote(note, { markdownContent: e.target.value })
        }
      />
    </article>
  );
}
function AttachmentUpload({ projectId }: { projectId: string }) {
  const [message, setMessage] = useState("");
  return (
    <label className="secondary mt-3 inline-flex cursor-pointer items-center gap-2">
      <Upload size={16} />
      Attach file
      <input
        className="sr-only"
        type="file"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !supabase) return;
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;
          const attachmentId = id(),
            path = `${user.id}/${attachmentId}/${file.name}`;
          const { error } = await supabase.storage
            .from("attachments")
            .upload(path, file);
          if (error) {
            setMessage(error.message);
            return;
          }
          await createAttachment({
            projectId,
            storagePath: path,
            filename: file.name,
            mimeType: file.type || "application/octet-stream",
            sizeBytes: file.size,
          });
          setMessage("File attached privately.");
        }}
      />
      {message && <span className="text-xs">{message}</span>}
    </label>
  );
}

export function LongTerm() {
  const directions = useDirections(),
    goals = useGoals(),
    [title, setTitle] = useState("");
  return (
    <>
      <PageTitle
        icon={<Mountain />}
        title="Long-term map"
        subtitle="Direction → outcome → next milestone. Everything else may wait."
      />
      <form
        className="mt-6 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (title.trim()) {
            await createDirection(title);
            setTitle("");
          }
        }}
      >
        <input
          className="field flex-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A direction for this season"
        />
        <button className="primary">Add direction</button>
      </form>
      <div className="journey-line mt-8 space-y-5">
        {directions.map((d) => (
          <DirectionCard
            key={d.id}
            direction={d}
            goals={goals.filter((g) => g.directionId === d.id)}
          />
        ))}
      </div>
    </>
  );
}
function DirectionCard({
  direction,
  goals,
}: {
  direction: Direction;
  goals: Goal[];
}) {
  const [goal, setGoal] = useState("");
  return (
    <section className="journey-card">
      <div className="flex justify-between">
        <h2 className="font-serif text-xl font-bold">{direction.title}</h2>
        <button
          className="quiet-label"
          onClick={() =>
            void updateDirection(direction, {
              status: direction.status === "active" ? "parked" : "active",
            })
          }
        >
          {direction.status}
        </button>
      </div>
      <textarea
        className="field mt-3"
        value={direction.description}
        placeholder="What would make this meaningfully better?"
        onChange={(e) =>
          void updateDirection(direction, { description: e.target.value })
        }
      />
      {goals.map((g) => (
        <div key={g.id} className="trail-row mt-2">
          <span>{g.title}</span>
          <span>{g.targetDate || "No false deadline"}</span>
        </div>
      ))}
      <form
        className="mt-3 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (goal.trim()) {
            await createGoal(direction.id, goal);
            setGoal("");
          }
        }}
      >
        <input
          className="field flex-1"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="One observable outcome"
        />
        <button className="secondary">Add</button>
      </form>
    </section>
  );
}

export function Reviews() {
  const tasks = useTasks(),
    [note, setNote] = useState(""),
    [done, setDone] = useState("");
  const unfinishedToday = tasks.filter(
    (t) => t.plannedForDate === todayKey() && t.status !== "done",
  );
  return (
    <>
      <PageTitle
        icon={<ScrollText />}
        title="Reviews"
        subtitle="A gentle reset—not a scorecard."
      />
      <div className="mt-7 grid gap-5 md:grid-cols-3">
        <Panel title="Daily close">
          <p className="text-sm">
            {unfinishedToday.length} item
            {unfinishedToday.length === 1 ? "" : "s"} need a conscious choice.
          </p>
          <textarea
            className="field mt-3"
            placeholder="What helped or got in the way?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            className="primary mt-3"
            onClick={async () => {
              await recordReview("daily_close", {
                reflection: note,
                unfinished: unfinishedToday.map((t) => t.id),
              });
              setDone("Daily close saved.");
            }}
          >
            Close gently
          </button>
        </Panel>
        <Panel title="Weekly reset">
          <p className="text-sm">
            Process the Inbox, review stalled work, then choose 1–3 outcomes.
          </p>
          <button
            className="secondary mt-3"
            onClick={async () => {
              await recordReview("weekly_reset", {
                activeTasks: tasks.filter(
                  (t) => !["done", "dropped"].includes(t.status),
                ).length,
              });
              setDone("Weekly reset recorded.");
            }}
          >
            Record reset
          </button>
        </Panel>
        <Panel title="Quarterly compass">
          <p className="text-sm">
            Continue, change, pause, or explore. Create only the next milestone.
          </p>
          <Link to="/map" className="secondary mt-3 inline-block">
            Open long-term map
          </Link>
        </Panel>
      </div>
      {done && <p className="mt-4 text-moss">{done}</p>}
    </>
  );
}

export function Insights() {
  const tasks = useTasks(),
    events = useTaskEvents();
  const rows = useMemo(
    () =>
      tasks
        .map((task) => {
          const actual = events
            .filter(
              (e) => e.taskId === task.id && e.type === "actual_time_logged",
            )
            .reduce((n, e) => n + (e.minutes || 0), 0);
          return { ...task, actual };
        })
        .filter((t) => t.actual || t.estimatedMinutes),
    [tasks, events],
  );
  const completed = tasks.filter((t) => t.status === "done").length,
    deferred = events.filter((e) => e.type === "task_deferred").length;
  const groups = rows
    .filter((row) => row.actual)
    .reduce<Record<string, number[]>>((all, row) => {
      const group = row.projectId || row.context || "Uncategorised";
      (all[group] ??= []).push(row.actual);
      return all;
    }, {});
  const profiles = Object.entries(groups)
    .map(([group, values]) => ({ group, profile: durationProfile(values) }))
    .filter((item) => item.profile && item.profile.samples >= 5);
  return (
    <>
      <PageTitle
        icon={<FileText />}
        title="Insights"
        subtitle="Calibration, never judgment."
      />
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <Stat label="Completed" value={completed} />
        <Stat label="Deferral decisions" value={deferred} />
        <Stat
          label="Timed samples"
          value={rows.filter((r) => r.actual).length}
        />
      </div>
      <Panel title="Estimated and observed time">
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.id}>
              <div className="flex justify-between text-sm">
                <span>{row.title}</span>
                <span>
                  {row.estimatedMinutes || "?"}m estimate · {row.actual || 0}m
                  observed
                </span>
              </div>
              <div className="mt-1 h-2 rounded bg-mist">
                <div
                  className="h-2 rounded bg-moss"
                  style={{
                    width: `${Math.min(100, (row.actual / Math.max(row.estimatedMinutes || row.actual, 1)) * 70)}%`,
                  }}
                />
              </div>
            </div>
          ))}
          {!rows.length && (
            <p className="text-sm text-slate-500">
              After a few focus sessions, useful ranges will appear here.
            </p>
          )}
        </div>
      </Panel>
      {profiles.length > 0 && (
        <Panel title="Learned ranges">
          {profiles.map(({ group, profile }) => (
            <div className="trail-row" key={group}>
              <span>{group}</span>
              <span>
                {profile!.low}–{profile!.high}m · {profile!.samples} samples ·{" "}
                {profile!.confidence} confidence
              </span>
            </div>
          ))}
        </Panel>
      )}
    </>
  );
}
const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="journey-card">
    <div className="font-serif text-3xl font-bold">{value}</div>
    <div className="quiet-label mt-1">{label}</div>
  </div>
);

export function Settings() {
  const profile = useLiveQuery(() => getPlanningProfile(), [], undefined),
    [saved, setSaved] = useState("");
  if (!profile) return null;
  const set = async (fields: Partial<PlanningProfile>) => {
    await saveEntity("planning_profile", db.planningProfiles, profile, fields);
    setSaved("Saved locally and queued for sync.");
  };
  return (
    <>
      <PageTitle
        icon={<Compass />}
        title="Planning style"
        subtitle="Defaults are a starting point. You remain the planner."
      />
      <div className="journey-card mt-7 grid gap-4 md:grid-cols-2">
        <Field
          label="Daily focus minutes"
          type="number"
          value={profile.dailyFocusMinutes}
          onChange={(e) =>
            void set({ dailyFocusMinutes: Number(e.target.value) })
          }
        />
        <Field
          label="Capacity reserve (%)"
          type="number"
          value={profile.reservePercent}
          onChange={(e) => void set({ reservePercent: Number(e.target.value) })}
        />
        <Field
          label="Maximum Today commitments"
          type="number"
          min={1}
          max={3}
          value={profile.maximumTodayCommitments}
          onChange={(e) =>
            void set({ maximumTodayCommitments: Number(e.target.value) })
          }
        />
        <Field
          label="Preferred focus session"
          type="number"
          value={profile.preferredFocusSessionMinutes}
          onChange={(e) =>
            void set({ preferredFocusSessionMinutes: Number(e.target.value) })
          }
        />
        <label className="grid gap-1 text-sm font-semibold">
          Planning detail
          <select
            className="field"
            value={profile.planningDetail}
            onChange={(e) =>
              void set({
                planningDetail: e.target
                  .value as PlanningProfile["planningDetail"],
              })
            }
          >
            <option>compact</option>
            <option>balanced</option>
            <option>detailed</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Prompt tone
          <select
            className="field"
            value={profile.promptTone}
            onChange={(e) =>
              void set({
                promptTone: e.target.value as PlanningProfile["promptTone"],
              })
            }
          >
            <option>direct</option>
            <option>gentle</option>
            <option>coaching</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={profile.reduceDecoration}
            onChange={(e) => void set({ reduceDecoration: e.target.checked })}
          />
          Reduce decorative scenery
        </label>
      </div>
      {saved && <p className="mt-3 text-sm text-moss">{saved}</p>}
    </>
  );
}

export function Assistant() {
  const [request, setRequest] = useState(""),
    [kind, setKind] = useState<"breakdown" | "schedule">("breakdown"),
    [result, setResult] = useState<PlannerResult>(),
    [status, setStatus] = useState("");
  const tasks = useTasks();
  const navigate = useNavigate();
  const run = async () => {
    if (!supabase || !request.trim()) return;
    setStatus("Samwise is studying the path…");
    const { data, error } = await supabase.functions.invoke("planner", {
      body: { kind, request },
    });
    if (error) {
      setStatus(error.message);
      return;
    }
    setResult(data);
    setStatus("Draft ready. Nothing has been saved yet.");
    await createAgentRun({
      kind,
      promptVersion: data.promptVersion || "v1",
      model: data.model || "unknown",
      input: { request },
      result: data,
      status: "draft",
    });
  };
  const accept = async () => {
    for (const draft of result?.taskDrafts || [])
      await captureTask(draft.title, {
        status: "next",
        nextActionText: draft.nextAction,
        estimatedMinutes: draft.estimatedMinutes,
        energy: draft.energy || "medium",
      });
    for (const draft of result?.scheduleDrafts || []) {
      const task = tasks.find((item) => item.id === draft.taskId);
      if (task && draft.proposedDate)
        await planTask(task, draft.proposedDate, draft.commitment);
    }
    setStatus("Accepted tasks saved.");
    navigate("/today");
  };
  return (
    <>
      <PageTitle
        icon={<Sparkles />}
        title="Plan with Samwise"
        subtitle="Drafts first. You decide what becomes part of the journey."
      />
      <div className="journey-card mt-7">
        <div className="mb-3 flex gap-2">
          <button
            className={kind === "breakdown" ? "primary" : "secondary"}
            onClick={() => setKind("breakdown")}
          >
            Break down work
          </button>
          <button
            className={kind === "schedule" ? "primary" : "secondary"}
            onClick={() => setKind("schedule")}
          >
            Propose a week
          </button>
        </div>
        <textarea
          className="field min-h-32"
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="What outcome are you trying to reach, and what feels unclear?"
        />
        <button className="primary mt-3" onClick={() => void run()}>
          Draft a path
        </button>
        <p className="mt-3 text-sm text-slate-600">{status}</p>
        {result && (
          <div className="mt-5 space-y-3">
            <p>{result.summary}</p>
            {result.clarifyingQuestion && (
              <p className="rounded-xl bg-parchment-deep p-3">
                <strong>One question:</strong> {result.clarifyingQuestion}
              </p>
            )}
            {result.taskDrafts?.map((t, i) => (
              <div className="trail-row" key={i}>
                <div>
                  <strong>{t.title}</strong>
                  <p className="text-sm">{t.nextAction}</p>
                </div>
                <span>{t.estimatedMinutes}m</span>
              </div>
            ))}
            {result.capacityWarnings?.map((warning, i) => (
              <p className="rounded-xl bg-parchment-deep p-3 text-sm" key={i}>
                {warning}
              </p>
            ))}
            {result.scheduleDrafts?.map((draft) => (
              <div className="trail-row" key={draft.taskId}>
                <div>
                  <strong>
                    {tasks.find((t) => t.id === draft.taskId)?.title || "Task"}
                  </strong>
                  <p className="text-sm">{draft.rationale}</p>
                </div>
                <span>{draft.proposedDate || "Available next"}</span>
              </div>
            ))}
            <button className="primary" onClick={() => void accept()}>
              Accept these drafts
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export function Calendar() {
  const events = useCalendarEvents();
  const [message, setMessage] = useState("");
  const call = async (action: "authorize" | "sync") => {
    if (!supabase) return;
    setMessage(
      action === "sync"
        ? "Reading calendar constraints…"
        : "Preparing Google authorization…",
    );
    const { data, error } = await supabase.functions.invoke("google-calendar", {
      body: { action },
    });
    if (error) return setMessage(error.message);
    if (action === "authorize") window.location.href = data.url;
    else {
      await db.calendarEvents.bulkPut(
        (data.events ?? []).map((event: Record<string, unknown>) =>
          fromServerEntity("calendar_event", event),
        ),
      );
      setMessage("Calendar constraints updated.");
    }
  };
  return (
    <>
      <PageTitle
        icon={<CalendarDays />}
        title="Calendar constraints"
        subtitle="Meetings shape capacity. Ordinary tasks stay in Samwise."
      />
      <div className="journey-card mt-7">
        <button className="primary" onClick={() => void call("authorize")}>
          Connect Google Calendar
        </button>
        <button className="secondary ml-2" onClick={() => void call("sync")}>
          Refresh constraints
        </button>
        <p className="mt-3 text-sm text-slate-600">
          Connection becomes available after Google credentials are configured.
        </p>
        {message && <p className="mt-2 text-sm text-moss">{message}</p>}
      </div>
      <div className="mt-5 space-y-3">
        {events.map((e) => (
          <div className="journey-card" key={e.id}>
            <strong>{e.privacy === "busy_only" ? "Busy" : e.title}</strong>
            <p className="text-sm">
              {new Date(e.startAt).toLocaleString()} –{" "}
              {new Date(e.endAt).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

function PageTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <header className="page-title">
      <span className="compass-mark">{icon}</span>
      <div>
        <h1 className="font-serif text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-slate-600">{subtitle}</p>
      </div>
    </header>
  );
}
