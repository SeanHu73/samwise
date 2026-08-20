import { useState } from "react";
import { Capture } from "../components/Capture";
import { useInbox } from "../hooks/useData";
import { deleteTask, updateTask } from "../lib/repository";
import type { Task } from "../types";

export function InboxPage() {
  const tasks = useInbox();
  const [selected, setSelected] = useState<Task>();
  return (
    <>
      <header>
        <p className="quiet-label">Quick capture</p>
        <h1 className="mt-2 font-serif text-3xl font-bold">
          Put it down before it disappears.
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Type the thought, choose its priority, and continue with your day.
          Samwise quietly checks whether it needs a clearer first action.
        </p>
      </header>
      <div className="mt-6">
        <Capture />
      </div>
      {!!tasks.length && (
        <section className="mt-8 space-y-3">
          <h2 className="font-serif text-lg font-bold">Older Inbox items</h2>
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => setSelected(task)}
              className="journey-card flex min-h-14 w-full items-center justify-between text-left"
            >
              <span className="font-semibold">{task.title}</span>
              <span className="quiet-label">Priority {task.priority}</span>
            </button>
          ))}
        </section>
      )}
      {selected && (
        <QuickEdit
          key={`${selected.id}-${selected.version}`}
          task={selected}
          close={() => setSelected(undefined)}
        />
      )}
    </>
  );
}

function QuickEdit({ task, close }: { task: Task; close: () => void }) {
  const [title, setTitle] = useState(task.title),
    [priority, setPriority] = useState(task.priority);
  async function save() {
    if (!title.trim()) return;
    await updateTask(task, {
      title: title.trim(),
      priority,
      status: "next",
      nextActionText: task.nextActionText || title.trim(),
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
      <div className="w-full max-w-lg rounded-t-3xl bg-cream p-6 sm:rounded-3xl">
        <h2 className="font-serif text-xl font-bold">Quick edit</h2>
        <label className="mt-5 block text-sm font-semibold">Thought</label>
        <input
          autoFocus
          className="field mt-1"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <fieldset className="mt-4">
          <legend className="mb-2 text-sm font-semibold">Priority</legend>
          <div className="grid grid-cols-4 gap-2">
            {([1, 2, 3, 4] as const).map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => setPriority(value)}
                className={
                  priority === value ? "primary px-2" : "secondary px-2"
                }
              >
                P{value}
              </button>
            ))}
          </div>
        </fieldset>
        {task.descriptionMarkdown && (
          <p className="mt-4 rounded-xl bg-parchment-deep/60 p-3 text-sm text-slate-600">
            {task.descriptionMarkdown}
          </p>
        )}
        <div className="mt-6 flex justify-between gap-2">
          <button
            type="button"
            onClick={() => void remove()}
            className="min-h-11 rounded-xl px-4 text-clay hover:bg-clay/10"
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={close} className="secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void save()}
              className="primary"
            >
              Save as task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
