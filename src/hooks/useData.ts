import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { todayKey } from "../lib/ids";
import { getPlanningProfile } from "../lib/repository";
export const useInbox = () =>
  useLiveQuery(
    () =>
      db.tasks
        .where("status")
        .equals("inbox")
        .filter((x) => !x.deletedAt)
        .sortBy("sortOrder"),
    [],
    [],
  );
export const useToday = () =>
  useLiveQuery(
    () =>
      db.tasks
        .where("plannedForDate")
        .equals(todayKey())
        .filter(
          (x) =>
            !x.deletedAt &&
            x.status !== "done" &&
            x.status !== "dropped" &&
            x.isCommitment !== false,
        )
        .sortBy("sortOrder"),
    [],
    [],
  );
export const useAvailable = () =>
  useLiveQuery(
    () =>
      db.tasks
        .filter(
          (x) =>
            !x.deletedAt &&
            (x.status === "next" ||
              (x.status === "planned" &&
                x.plannedForDate === todayKey() &&
                x.isCommitment === false)),
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
