import { useState, type FormEvent } from "react";
import { captureTask } from "../lib/repository";
export function Capture({ compact = false }: { compact?: boolean }) {
  const [title, setTitle] = useState("");
  const [saved, setSaved] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await captureTask(title);
    setTitle("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
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
      <input
        id="capture"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs your attention?"
        className="min-h-12 flex-1 rounded-xl border border-sand bg-cream/40 px-4 text-base outline-none focus:ring-2 focus:ring-sage"
      />
      <button className="min-h-12 rounded-xl bg-sage px-5 font-semibold text-white hover:bg-ink">
        {saved ? "Saved" : "Capture"}
      </button>
    </form>
  );
}
