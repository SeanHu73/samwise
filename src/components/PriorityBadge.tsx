import type { Task } from "../types";
import { priorityLabels } from "../lib/priority";

const styles: Record<Task["priority"], string> = {
  1: "bg-ember text-white",
  2: "bg-brass text-white",
  3: "bg-moss/15 text-moss",
  4: "bg-mist text-slate-600",
};
export function PriorityBadge({
  priority,
  short = false,
}: {
  priority: Task["priority"];
  short?: boolean;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold ${styles[priority]}`}
    >
      {short ? `P${priority}` : priorityLabels[priority]}
    </span>
  );
}
