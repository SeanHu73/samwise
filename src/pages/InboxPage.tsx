import { useState } from "react";
import { Capture } from "../components/Capture";
import { useAreas, useInbox } from "../hooks/useData";
import { createArea, deleteTask, updateTask } from "../lib/repository";
import type { Task } from "../types";
export function InboxPage() {
  const tasks = useInbox(),
    areas = useAreas();
  const [selected, setSelected] = useState<Task>();
  return (
    <>
      <header>
        <p className="quiet-label">Inbox</p>
        <h1 className="mt-2 font-serif text-3xl font-bold">
          Save it now. Organise it when ready.
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Capture is a quick holding place for thoughts and tasks. Open an item
          below to edit its title, classify the type of work, define the first
          action, or delete it.
        </p>
      </header>
      <div className="mt-6">
        <Capture />
      </div>
      <section className="mt-8 space-y-3">
        {tasks.map((task) => {
          const area = areas.find((item) => item.id === task.areaId);
          return (
            <button
              key={task.id}
              onClick={() => setSelected(task)}
              className="journey-card flex min-h-14 w-full items-center justify-between text-left"
            >
              <span className="font-semibold">{task.title}</span>
              {area && <span className="quiet-label">{area.name}</span>}
            </button>
          );
        })}
        {!tasks.length && (
          <p className="rounded-2xl border border-dashed border-sand p-6 text-slate-500">
            Nothing waiting to be organised.
          </p>
        )}
      </section>
      {selected && (
        <Clarify
          key={`${selected.id}-${selected.version}`}
          task={selected}
          close={() => setSelected(undefined)}
        />
      )}
    </>
  );
}
function Clarify({ task, close }: { task: Task; close: () => void }) {
  const areas = useAreas().filter(
      (area) => area.active || area.id === task.areaId,
    ),
    [title, setTitle] = useState(task.title),
    [action, setAction] = useState(task.nextActionText),
    [areaId, setAreaId] = useState(task.areaId ?? ""),
    [newArea, setNewArea] = useState(""),
    [estimate, setEstimate] = useState(task.estimatedMinutes ?? 30),
    [error, setError] = useState("");
  async function addArea() {
    if (!newArea.trim()) return;
    const area = await createArea(newArea);
    setAreaId(area.id);
    setNewArea("");
  }
  async function save() {
    if (!title.trim() || !action.trim()) {
      setError("Add a title and a concrete first action.");
      return;
    }
    await updateTask(task, {
      title: title.trim(),
      areaId: areaId || null,
      status: "next",
      nextActionText: action.trim(),
      estimatedMinutes: estimate,
      estimateLowMinutes: Math.round(estimate * 0.7),
      estimateHighMinutes: Math.round(estimate * 1.5),
      estimateConfidence: "low",
    });
    close();
  }
  async function remove() {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    await deleteTask(task);
    close();
  }
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-ink/35 sm:place-items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-cream p-6 sm:rounded-3xl">
        <h2 className="font-serif text-xl font-bold">Organise this item</h2>
        <label className="mt-5 block text-sm font-semibold">Title</label>
        <input
          autoFocus
          className="field mt-1"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <label className="mt-4 block text-sm font-semibold">Type of work</label>
        <select
          className="field mt-1"
          value={areaId}
          onChange={(event) => setAreaId(event.target.value)}
        >
          <option value="">Unclassified</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
        <div className="mt-2 flex gap-2">
          <input
            className="field flex-1"
            value={newArea}
            onChange={(event) => setNewArea(event.target.value)}
            placeholder="New category, e.g. Job Search"
          />
          <button
            type="button"
            className="secondary"
            onClick={() => void addArea()}
          >
            Add
          </button>
        </div>
        <label className="mt-4 block text-sm font-semibold">
          First physical action
        </label>
        <input
          className="field mt-1"
          value={action}
          onChange={(event) => setAction(event.target.value)}
          placeholder="Open… / Email… / Write…"
        />
        <label className="mt-4 block text-sm font-semibold">
          Rough estimate
        </label>
        <select
          className="field mt-1"
          value={estimate}
          onChange={(event) => setEstimate(Number(event.target.value))}
        >
          {[5, 15, 30, 60, 90].map((value) => (
            <option key={value} value={value}>
              {value} minutes
            </option>
          ))}
        </select>
        {error && <p className="mt-3 text-sm text-clay">{error}</p>}
        <div className="mt-6 flex flex-wrap justify-between gap-2">
          <button
            type="button"
            onClick={() => void remove()}
            className="min-h-12 rounded-xl px-4 text-clay hover:bg-clay/10"
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={close} className="min-h-12 px-4">
              Keep in Inbox
            </button>
            <button
              type="button"
              onClick={() => void save()}
              className="primary"
            >
              Make available
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
