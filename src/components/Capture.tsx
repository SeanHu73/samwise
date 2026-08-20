import { useState, type FormEvent } from "react";
import { captureTask } from "../lib/repository";
import { assessCapturedTask } from "../lib/captureAssessment";
export function Capture({ compact = false }: { compact?: boolean }) {
  const [title, setTitle] = useState("");
  const [choosingPriority, setChoosingPriority] = useState(false);
  const [saved, setSaved] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setChoosingPriority(true);
  }
  async function save(priority: 1 | 2 | 3 | 4) {
    const task = await captureTask(title, {
      priority,
      status: "next",
      nextActionText: title.trim(),
    });
    setTitle("");
    setChoosingPriority(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    void assessCapturedTask(task);
  }
  return (
    <form
      onSubmit={submit}
      className={
        compact ? "flex gap-2" : "rounded-3xl bg-white p-4 shadow-soft"
      }
    >
      <label className="sr-only" htmlFor="capture">
        Capture an item
      </label>
      {!choosingPriority ? (
        <>
          <input
            id="capture"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What just came to mind?"
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-sand bg-cream/40 px-4 text-base outline-none focus:ring-2 focus:ring-sage"
          />
          <button className="min-h-12 rounded-xl bg-sage px-5 font-semibold text-white hover:bg-ink">
            {saved ? "Saved" : "Capture"}
          </button>
        </>
      ) : (
        <fieldset className="w-full">
          <legend className="mb-2 text-sm font-semibold">
            Priority for “{title.trim()}”
          </legend>
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                [1, "Urgent"],
                [2, "High"],
                [3, "Normal"],
                [4, "Low"],
              ] as const
            ).map(([priority, label]) => (
              <button
                type="button"
                key={priority}
                onClick={() => void save(priority)}
                className={priority === 3 ? "primary px-2" : "secondary px-2"}
              >
                {compact ? `P${priority}` : label}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </form>
  );
}
