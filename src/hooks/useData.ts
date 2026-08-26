import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { todayKey } from "../lib/ids";
import { getPlanningProfile } from "../lib/repository";
import type { Task } from "../types";

const active = (task: Task) =>
  !task.deletedAt && task.status !== "done" && task.status !== "dropped";

export const useToday = () =>
  useLiveQuery(
    () =>
      db.tasks
        .where("plannedForDate")
        .equals(todayKey())
        .filter(active)
        .sortBy("sortOrder"),
    [],
    [],
  );
/** Tasks planned for an earlier day that never got finished. */
export const useOverflow = () =>
  useLiveQuery(
    () =>
      db.tasks
        .filter(
          (task) =>
            active(task) &&
            !!task.plannedForDate &&
            task.plannedForDate < todayKey(),
        )
        .sortBy("plannedForDate"),
    [],
    [],
  );
/** Quick-added tasks that have not been placed on a day yet. */
export const useQuickAdd = () =>
  useLiveQuery(
    () =>
      db.tasks
        .filter(
          (task) => active(task) && !task.plannedForDate && !task.projectId,
        )
        .sortBy("sortOrder"),
    [],
    [],
  );
export const useProjects = () =>
  useLiveQuery(
    () => db.projects.filter((x) => !x.deletedAt).sortBy("updatedAt"),
    [],
    [],
  );
export const useOutboxCount = () =>
  useLiveQuery(() => db.outbox.count(), [], 0);
export const useDirections = () =>
  useLiveQuery(
    () => db.directions.filter((x) => !x.deletedAt).sortBy("updatedAt"),
    [],
    [],
  );
export const useGoals = () =>
  useLiveQuery(
    () => db.goals.filter((x) => !x.deletedAt).sortBy("updatedAt"),
    [],
    [],
  );
export const useAreas = () =>
  useLiveQuery(
    () => db.areas.filter((area) => !area.deletedAt).sortBy("name"),
    [],
    [],
  );
export const useActiveAreas = () =>
  useLiveQuery(
    () =>
      db.areas.filter((area) => !area.deletedAt && area.active).sortBy("name"),
    [],
    [],
  );
export const useTasks = () =>
  useLiveQuery(() => db.tasks.filter((x) => !x.deletedAt).toArray(), [], []);
export const useTaskEvents = () =>
  useLiveQuery(() => db.taskEvents.orderBy("occurredAt").toArray(), [], []);
export const useCalendarEvents = () =>
  useLiveQuery(() => db.calendarEvents.orderBy("startAt").toArray(), [], []);
export function usePlanningProfile() {
  useEffect(() => {
    void getPlanningProfile();
  }, []);
  return useLiveQuery(
    () => db.planningProfiles.toCollection().first(),
    [],
    undefined,
  );
}
