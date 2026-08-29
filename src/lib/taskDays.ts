import type { Task } from "../types";

/** Every day this task is planned for, sorted ascending. */
export function taskDays(task: Task): string[] {
  const days = new Set(task.plannedForDates ?? []);
  if (task.plannedForDate) days.add(task.plannedForDate);
  return [...days].sort();
}
export const taskOnDay = (task: Task, day: string) =>
  task.plannedForDate === day || !!task.plannedForDates?.includes(day);
/** True when every planned day is behind us and the task is still open. */
export function isOverflow(task: Task, today: string) {
  const days = taskDays(task);
  return days.length > 0 && days[days.length - 1] < today;
}
