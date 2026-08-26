import { useState } from "react";
import { Link } from "react-router-dom";
import type { Task } from "../types";
import { useOverflow, useQuickAdd, useToday } from "../hooks/useData";
import { swapTaskOrder } from "../lib/repository";
import { TaskRow } from "../components/TaskRow";
import { TaskDetail } from "../components/TaskDetail";
import { Capture } from "../components/Capture";
export function Today() {
  const tasks = useToday(),
    overflow = useOverflow(),
    quickAdd = useQuickAdd();
  const [openId, setOpenId] = useState<string>();
  const open = (task: Task) => setOpenId(task.id);
  return (
    <>
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-sage">
          Today ·{" "}
          {new Intl.DateTimeFormat(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          }).format(new Date())}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold">Daily Mission</h1>
        <p className="mt-2 text-slate-600">
          {tasks.length} task{tasks.length === 1 ? "" : "s"} for today
        </p>
      </header>
      <div className="mt-5 md:hidden">
        <Capture inputId="capture-today" />
      </div>
      <List title="Tasks" empty="Nothing planned yet. Add tasks here or on the Plan tab.">
        {tasks.map((t, i) => (
          <TaskRow
            key={t.id}
            task={t}
            onOpen={open}
            onMoveUp={
              i > 0 ? () => void swapTaskOrder(t, tasks[i - 1]) : undefined
            }
            onMoveDown={
              i < tasks.length - 1
                ? () => void swapTaskOrder(t, tasks[i + 1])
                : undefined
            }
          />
        ))}
      </List>
      {!!overflow.length && (
        <List
          title="From earlier days"
          hint="These didn’t happen. Give each one a new day, or let it go."
          empty=""
        >
          {overflow.map((t) => (
            <TaskRow key={t.id} task={t} onOpen={open} />
          ))}
        </List>
      )}
      {!!quickAdd.length && (
        <List
          title="Quick Add"
          hint={
            <>
              Captured, but not on a day yet.{" "}
              <Link to="/plan" className="font-semibold text-moss underline">
                Organise them in Plan
              </Link>
              , or open one to pick its day.
            </>
          }
          empty=""
        >
          {quickAdd.map((t) => (
            <TaskRow key={t.id} task={t} onOpen={open} />
          ))}
        </List>
      )}
      {openId && (
        <TaskDetail taskId={openId} onClose={() => setOpenId(undefined)} />
      )}
    </>
  );
}
function List({
  title,
  empty,
  hint,
  children,
}: {
  title: string;
  empty: string;
  hint?: React.ReactNode;
  children: React.ReactNode[];
}) {
  return (
    <section className="mt-9 space-y-3">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {hint && <p className="mt-1 text-sm text-slate-600">{hint}</p>}
      </div>
      {children.length
        ? children
        : !!empty && (
            <div className="rounded-2xl border border-dashed border-sand p-6 text-sm text-slate-500">
              {empty}
            </div>
          )}
    </section>
  );
}
