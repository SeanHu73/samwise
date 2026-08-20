import { useEffect } from "react";
import {
  BarChart3,
  CalendarDays,
  Compass,
  FolderKanban,
  Inbox,
  Map,
  MoreHorizontal,
  Plus,
  ScrollText,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Capture } from "./Capture";
import { useInbox, useOutboxCount } from "../hooks/useData";
import { syncNow } from "../lib/sync";
const nav = [
  ["/today", "Today", Sun],
  ["/inbox", "Inbox", Inbox],
  ["/plan", "Plan", CalendarDays],
  ["/projects", "Projects", FolderKanban],
  ["/map", "Long-term map", Map],
  ["/reviews", "Reviews", ScrollText],
  ["/insights", "Insights", BarChart3],
  ["/assistant", "Plan with Samwise", Sparkles],
  ["/calendar", "Calendar", Compass],
  ["/settings", "Settings", Settings],
] as const;
export function Layout() {
  const inbox = useInbox(),
    pending = useOutboxCount();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const run = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void syncNow(), 250);
    };
    run();
    window.addEventListener("online", run);
    window.addEventListener("samwise:outbox", run);
    const interval = setInterval(run, 30000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener("online", run);
      window.removeEventListener("samwise:outbox", run);
    };
  }, []);
  return (
    <div className="min-h-dvh bg-parchment text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-parchment-deep bg-forest p-5 text-moon md:flex">
        <div className="mb-7 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full border border-brass text-brass">
            <Compass />
          </span>
          <div>
            <div className="font-serif text-2xl font-bold">Samwise</div>
            <div className="text-xs text-moon/60">A steady companion</div>
          </div>
        </div>
        <nav className="scrollbar-none space-y-1 overflow-y-auto">
          {nav.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm ${isActive ? "bg-moss text-white shadow-soft" : "text-moon/75 hover:bg-white/10"}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "Inbox" && !!inbox.length && (
                <span className="ml-auto rounded-full bg-ember px-2 text-xs text-white">
                  {inbox.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-4">
          <button
            onClick={() => void syncNow()}
            className="text-left text-xs text-moon/65"
          >
            {navigator.onLine
              ? pending
                ? `${pending} changes travelling`
                : "All changes safely kept"
              : "Saved offline"}
          </button>
          <div className="mt-4">
            <Capture compact />
          </div>
        </div>
      </aside>
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:ml-72 md:px-8 md:pb-12">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-parchment-deep bg-parchment/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <MobileLink to="/today" label="Today" Icon={Sun} />
        <MobileLink to="/plan" label="Plan" Icon={CalendarDays} />
        <NavLink
          to="/inbox"
          aria-label="Capture"
          className="grid place-items-center"
        >
          <span className="grid size-14 -translate-y-3 place-items-center rounded-full bg-moss text-white shadow-soft">
            <Plus />
          </span>
        </NavLink>
        <MobileLink to="/projects" label="Projects" Icon={FolderKanban} />
        <MobileLink to="/reviews" label="More" Icon={MoreHorizontal} />
      </nav>
    </div>
  );
}
function MobileLink({
  to,
  label,
  Icon,
}: {
  to: string;
  label: string;
  Icon: typeof Sun;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${isActive ? "text-moss" : "text-slate-500"}`
      }
    >
      <Icon size={21} />
      {label}
    </NavLink>
  );
}
