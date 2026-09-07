import { useState } from "react";
import { Copy, Lightbulb } from "lucide-react";
import { useIdeasNote } from "../hooks/useData";
import { updateNote } from "../lib/repository";
import { AutoSaveText } from "../components/AutoSaveText";

export function Ideas() {
  const note = useIdeasNote();
  const [copied, setCopied] = useState("");
  if (!note) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(note.markdownContent);
      setCopied("Copied — paste it to Claude in your next session.");
    } catch {
      setCopied("Couldn’t reach the clipboard — select and copy by hand.");
    }
    setTimeout(() => setCopied(""), 3000);
  };
  return (
    <>
      <header className="page-title">
        <span className="compass-mark">
          <Lightbulb />
        </span>
        <div>
          <h1 className="font-serif text-3xl font-bold">Workshop</h1>
          <p className="mt-1 text-slate-600">
            Changes you want for Samwise itself. Jot them as they occur to
            you — nothing here becomes a task.
          </p>
        </div>
      </header>
      <AutoSaveText
        key={note.id}
        multiline
        className="field mt-6 min-h-[55vh]"
        placeholder={"- The Plan tab should…\n- What if capture could…"}
        value={note.markdownContent}
        onSave={(markdownContent) => void updateNote(note, { markdownContent })}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="secondary inline-flex items-center gap-2"
          onClick={() => void copy()}
        >
          <Copy size={15} />
          Copy for Claude
        </button>
        <p className="text-sm text-slate-500">
          {copied ||
            "Next time you work on the app with Claude, paste this list — it will be discussed and planned with you."}
        </p>
      </div>
    </>
  );
}
