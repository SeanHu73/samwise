import { useState } from "react";
import { Capture } from "../components/Capture";
import { useInbox } from "../hooks/useData";
import { updateTask } from "../lib/repository";
import type { Task } from "../types";
export function InboxPage() {
  const tasks = useInbox();
  const [selected, setSelected] = useState<Task>();
  return (
    <>
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-sage">
          Inbox
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          Capture first. Clarify later.
        </h1>
      </header>
      <div className="mt-6">
        <Capture />
      </div>
      <section className="mt-8 space-y-3">
        {tasks.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t)}
            className="min-h-14 w-full rounded-2xl border border-sand bg-white p-4 text-left font-semibold shadow-sm"
          >
            {t.title}
          </button>
        ))}
        {!tasks.length && (
          <p className="rounded-2xl border border-dashed border-sand p-6 text-slate-500">
            Nothing waiting for clarification.
          </p>
        )}
      </section>
      {selected && (
        <Clarify task={selected} close={() => setSelected(undefined)} />
      )}
    </>
  );
}
function Clarify({ task, close }: { task: Task; close: () => void }) {
  const [action, setAction] = useState(task.nextActionText),
    [estimate, setEstimate] = useState(30);
  async function save() {
    if (!action.trim()) return;
    await updateTask(task, {
      status: "next",
      nextActionText: action.trim(),
      estimatedMinutes: estimate,
      estimateLowMinutes: Math.round(estimate * 0.7),
      estimateHighMinutes: Math.round(estimate * 1.5),
      estimateConfidence: "low",
    });
    close();
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-ink/35 sm:place-items-center">
      <div className="w-full max-w-lg rounded-t-3xl bg-cream p-6 sm:rounded-3xl">
        <h2 className="text-xl font-bold">What does starting look like?</h2>
        <p className="mt-2 font-semibold">{task.title}</p>
        <label className="mt-5 block text-sm font-semibold">
          First physical action
        </label>
        <input
          autoFocus
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Open the document…"
          className="mt-1 min-h-12 w-full rounded-xl border border-sand bg-white px-3"
        />
        <label className="mt-4 block text-sm font-semibold">
          Rough estimate
        </label>
        <select
          value={estimate}
          onChange={(e) => setEstimate(Number(e.target.value))}
          className="mt-1 min-h-12 w-full rounded-xl border border-sand bg-white px-3"
        >
          {[5, 15, 30, 60, 90].map((x) => (
            <option key={x} value={x}>
              {x} minutes
            </option>
          ))}
        </select>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={close} className="min-h-12 px-4">
            Later
          </button>
          <button
            onClick={save}
            disabled={!action.trim()}
            className="min-h-12 rounded-xl bg-sage px-5 font-semibold text-white disabled:opacity-40"
          >
            Make available
          </button>
        </div>
      </div>
    </div>
  );
}
