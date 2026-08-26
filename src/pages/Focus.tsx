import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../lib/db";
import { completeTask, logTimer } from "../lib/repository";
export function Focus() {
  const { id } = useParams();
  const task = useLiveQuery(() => (id ? db.tasks.get(id) : undefined), [id]);
  const [seconds, setSeconds] = useState(0),
    [running, setRunning] = useState(true);
  // Time from finished run segments; the interval adds the live segment on top,
  // so pausing genuinely stops the clock.
  const banked = useRef(0),
    nav = useNavigate();
  useEffect(() => {
    if (!running) return;
    const startedAt = Date.now();
    const tick = () =>
      setSeconds(banked.current + Math.floor((Date.now() - startedAt) / 1000));
    const timer = setInterval(tick, 1000);
    return () => {
      clearInterval(timer);
      banked.current += Math.floor((Date.now() - startedAt) / 1000);
    };
  }, [running]);
  if (!task) return <p>Loading focus…</p>;
  const focusTask = task;
  async function finish(done: boolean) {
    await logTimer(focusTask, Math.round(seconds / 60));
    if (done) await completeTask(focusTask);
    nav("/today");
  }
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink px-6 text-center text-white">
      <p className="text-sm uppercase tracking-[.25em] text-sand">Focus</p>
      <h1 className="mt-5 max-w-2xl text-3xl font-bold sm:text-5xl">
        {task.title}
      </h1>
      <p className="mt-5 max-w-xl text-lg text-sand">
        {task.nextActionText || "Choose the smallest visible first move."}
      </p>
      <div className="my-12 font-mono text-7xl tabular-nums">
        {String(Math.floor(seconds / 60)).padStart(2, "0")}:
        {String(seconds % 60).padStart(2, "0")}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setRunning((x) => !x)}
          className="min-h-14 rounded-xl border border-sand px-6"
        >
          {running ? "Pause" : "Continue"}
        </button>
        <button
          onClick={() => finish(true)}
          className="min-h-14 rounded-xl bg-white px-6 font-bold text-ink"
        >
          Finish
        </button>
        <button
          onClick={() => finish(false)}
          className="min-h-14 rounded-xl border border-sand px-6"
        >
          I’m stuck
        </button>
      </div>
    </div>
  );
}
