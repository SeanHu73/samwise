import { useEffect, useRef, useState } from "react";

/**
 * Text field that keeps typing local and saves once, shortly after the user
 * stops typing (and on blur/unmount). Prevents a database write and a queued
 * sync operation per keystroke. External updates to `value` are ignored while
 * mounted — remount with a `key` to reset.
 */
export function AutoSaveText({
  value,
  onSave,
  multiline = false,
  delay = 700,
  ...rest
}: {
  value: string;
  onSave: (next: string) => void;
  multiline?: boolean;
  delay?: number;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement> &
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
>) {
  const [draft, setDraft] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latest = useRef({ onSave, draft, saved: value });
  latest.current.onSave = onSave;
  latest.current.draft = draft;

  const flush = () => {
    clearTimeout(timer.current);
    if (latest.current.draft !== latest.current.saved) {
      latest.current.saved = latest.current.draft;
      latest.current.onSave(latest.current.draft);
    }
  };
  useEffect(() => flush, []);

  const change = (next: string) => {
    setDraft(next);
    latest.current.draft = next;
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, delay);
  };
  const shared = {
    ...rest,
    value: draft,
    onBlur: flush,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => change(e.target.value),
  };
  return multiline ? <textarea {...shared} /> : <input {...shared} />;
}
