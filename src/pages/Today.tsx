import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Task } from "../types";
import { useAvailable, useCalendarEvents, useToday } from "../hooks/useData";
import { TaskRow } from "../components/TaskRow";
import { DeferDialog } from "../components/DeferDialog";
import { capacityState, constrainedCapacity } from "../lib/capacity";
import { getPlanningProfile } from "../lib/repository";
import { todayKey } from "../lib/ids";
export function Today() {
  const tasks = useToday(),
    available = useAvailable(),events=useCalendarEvents(),profile=useLiveQuery(()=>getPlanningProfile(),[],undefined);
  const [defer, setDefer] = useState<Task>();
  const todayEvents=events.filter(event=>event.startAt.slice(0,10)===todayKey()),busy=todayEvents.reduce((minutes,event)=>minutes+Math.max(0,(new Date(event.endAt).getTime()-new Date(event.startAt).getTime())/60000),0);
  const usable = constrainedCapacity(profile?.dailyFocusMinutes??240,profile?.reservePercent??20,busy,todayEvents.length*(profile?.transitionBufferMinutes??10)),
    planned = tasks.reduce((n, t) => n + (t.estimatedMinutes ?? 30), 0);
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
        <h1 className="mt-2 text-3xl font-bold">A small plan is enough.</h1>
        <p className="mt-2 text-slate-600">
          {tasks.length} of {profile?.maximumTodayCommitments??3} commitments · {Math.max(0, usable - planned)}{" "}
          minutes available ·{" "}
          <span className="capitalize">{capacityState(planned, usable)}</span>
        </p>
      </header>
      <List
        title="Commitments"
        empty="Choose up to three actions you genuinely intend to do."
      >
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} onDefer={setDefer} />
        ))}
      </List>
      <List
        title="Available next"
        empty="Process an Inbox item into a concrete next action."
      >
        {available.map((t) => (
          <TaskRow key={t.id} task={t} onDefer={setDefer} showPlan />
        ))}
      </List>
      {defer && (
        <DeferDialog task={defer} onClose={() => setDefer(undefined)} />
      )}
    </>
  );
}
function List({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode[];
}) {
  return (
    <section className="mt-9 space-y-3">
      <h2 className="text-lg font-bold">{title}</h2>
      {children.length ? (
        children
      ) : (
        <div className="rounded-2xl border border-dashed border-sand p-6 text-sm text-slate-500">
          {empty}
        </div>
      )}
    </section>
  );
}
