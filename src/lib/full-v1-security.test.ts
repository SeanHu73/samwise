import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");
describe("full v1 security boundaries", () => {
  it("enables owner RLS on every new user table", () => {
    const sql = read("supabase/migrations/202608200003_full_v1_schema.sql");
    for (const table of [
      "areas",
      "directions",
      "goals",
      "milestones",
      "notes",
      "attachments",
      "planning_sessions",
      "planning_profiles",
      "calendar_connections",
      "calendar_event_cache",
      "agent_runs",
    ]) {
      expect(sql).toContain(
        `alter table public.${table} enable row level security`,
      );
      expect(sql).toContain(
        `on public.${table} for all using(owner_id=auth.uid()) with check(owner_id=auth.uid())`,
      );
    }
  });
  it("requires authentication and structured planner output", () => {
    const source = read("supabase/functions/planner/index.ts");
    expect(source).toContain("if (!user)");
    expect(source).toContain('type: "json_schema"');
    expect(source).toContain("strict: true");
    expect(source).toContain("OPENAI_API_KEY");
  });
  it("approval-gates calendar writes and encrypts tokens", () => {
    const source = read("supabase/functions/google-calendar/index.ts");
    expect(source).toContain("body.approved !== true");
    expect(source).toContain("AES-GCM");
    expect(source).toContain("GOOGLE_STATE_SECRET");
    expect(source).not.toContain("service_role");
  });
});
