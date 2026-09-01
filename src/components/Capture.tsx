import { useId, useState, type FormEvent } from "react";
import { captureTask, setPlannedDays } from "../lib/repository";
import { todayKey } from "../lib/ids";
import { MonthCalendar } from "./MonthCalendar";

type Stage = "input" | "schedule" | "calendar";

export function Capture({
  compact = false,
  inputId,
}: {
  compact?: boolean;
  inputId?: string;
}) {
  const autoId = useId();
  const fieldId = inputId ?? autoId;
  const [title, setTitle] = useState("");
  const [stage, setStage] = useState<Stage>("input");
  const [saved, setSaved] = useState(false);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setStage("schedule");
  }
  async function save(days: string[]) {
    const task = await captureTask(title);
    if (days.length) await setPlannedDays(task, days);
    setTitle("");
    setStage("input");
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }
  return (
    <form
      onSubmit={submit}
      className={
        compact ? "flex flex-wrap gap-2" : "rounded-3xl bg-white p-4 shadow-soft"
      }
    >
      <label className="sr-only" htmlFor={fieldId}>
        Capture an item
      </label>
      {stage === "input" && (
        <>
          <input
            id={fieldId}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What just came to mind?"
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-sand bg-cream/40 px-4 text-base outline-none focus:ring-2 focus:ring-sage"
          />
          <button className="min-h-12 rounded-xl bg-sage px-5 font-semibold text-white hover:bg-ink">
            {saved ? "Saved" : "Capture"}
          </button>
        </>
      )}
      {stage === "schedule" && (
        <fieldset className="w-full">
          <legend className="mb-2 text-sm font-semibold">
            When will you do “{title.trim()}”?
          </legend>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => void save([todayKey()])}
              className="primary px-2"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setStage("calendar")}
              className="secondary px-2"
            >
              Pick a date
            </button>
            <button
              type="button"
              onClick={() => void save([])}
              className="secondary px-2"
            >
              Set aside
            </button>
          </div>
        </fieldset>
      )}
      {stage === "calendar" && (
        <div className="w-full">
          <MonthCalendar selected={[]} onToggle={(day) => void save([day])} />
          <button
            type="button"
            onClick={() => setStage("schedule")}
            className="mt-2 text-sm font-semibold text-slate-500 hover:text-ink"
          >
            ‹ Back
          </button>
        </div>
      )}
    </form>
  );
}
