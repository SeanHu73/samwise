import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { todayKey } from "../lib/ids";
import {
  getIdeasNote,
  getPlanningProfile,
  IDEAS_NOTE_ID,
} from "../lib/repository";
import { isOverflow, taskDays, taskOnDay } from "../lib/taskDays";
import type { Task } from "../types";

const active = (task: Task) =>
  !task.deletedAt && task.status !== "done" && task.status !== "dropped";

export const useToday = () =>
  useLiveQuery(
    () =>
      db.tasks
        .filter((task) => active(task) && taskOnDay(task, todayKey()))
        .sortBy("sortOrder"),
    [],
    [],
  );
/** Tasks whose every planned day is behind us, still unfinished. */
export const useOverflow = () =>
  useLiveQuery(
    () =>
      db.tasks
        .filter((task) => active(task) && isOverflow(task, todayKey()))
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
          (task) =>
            active(task) && !taskDays(task).length && !task.projectId,
        )
        .sortBy("sortOrder"),
    [],
    [],
  );
/** Finished tasks, newest completion first. */
export const useCompleted = () =>
  useLiveQuery(
    () =>
      db.tasks
        .where("status")
        .equals("done")
        .filter((x) => !x.deletedAt)
        .toArray()
        .then((list) =>
          list.sort((a, b) =>
            (b.completedAt ?? b.updatedAt).localeCompare(
              a.completedAt ?? a.updatedAt,
            ),
          ),
        ),
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
export function useIdeasNote() {
  useEffect(() => {
    void getIdeasNote();
  }, []);
  return useLiveQuery(() => db.notes.get(IDEAS_NOTE_ID), [], undefined);
}
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
