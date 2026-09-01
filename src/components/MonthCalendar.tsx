import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { dateKey, todayKey } from "../lib/ids";

// Monday-first, like the Big Picture timeline.
const weekdayLabels = Array.from({ length: 7 }, (_, i) =>
  new Intl.DateTimeFormat(undefined, { weekday: "narrow" }).format(
    new Date(2024, 0, 1 + i),
  ),
);
function monthWeeks(month: Date) {
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const cursor = new Date(month);
  cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7));
  const weeks: Date[][] = [];
  while (cursor <= last) {
    weeks.push(
      Array.from({ length: 7 }, (_, i) => {
        const day = new Date(cursor);
        day.setDate(cursor.getDate() + i);
        return day;
      }),
    );
    cursor.setDate(cursor.getDate() + 7);
  }
  return weeks;
}

/** A tappable month grid: every click toggles that day via onToggle. */
export function MonthCalendar({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (day: string) => void;
}) {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const shift = (delta: number) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  return (
    <div className="rounded-xl border border-sand bg-white p-2">
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => shift(-1)}
          className="grid size-8 place-items-center rounded-full hover:bg-mist"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold">
          {month.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => shift(1)}
          className="grid size-8 place-items-center rounded-full hover:bg-mist"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="mt-1 grid grid-cols-7 text-center text-xs text-slate-500">
        {weekdayLabels.map((label, i) => (
          <span key={i} className="py-1">
            {label}
          </span>
        ))}
      </div>
      {monthWeeks(month).map((week) => (
        <div key={dateKey(week[0])} className="grid grid-cols-7">
          {week.map((day) => {
            const key = dateKey(day),
              isSelected = selected.includes(key),
              inMonth = day.getMonth() === month.getMonth();
            return (
              <button
                key={key}
                type="button"
                aria-label={key}
                aria-pressed={isSelected}
                onClick={() => onToggle(key)}
                className={`mx-auto my-0.5 grid size-9 place-items-center rounded-full text-sm ${
                  isSelected
                    ? "bg-moss font-semibold text-white"
                    : key === todayKey()
                      ? "font-semibold text-moss ring-1 ring-moss"
                      : inMonth
                        ? "text-ink hover:bg-mist"
                        : "text-slate-300 hover:bg-mist"
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
