import type { Task } from "../types";

export const priorityLabels: Record<Task["priority"], string> = {
  1: "P1 · Urgent",
  2: "P2 · High",
  3: "P3 · Normal",
  4: "P4 · Low",
};
