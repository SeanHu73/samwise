import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(
    supabase ? undefined : null,
  );
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) =>
      setSession(next),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  if (!supabase) return children;
  if (session === undefined)
    return (
      <main className="grid min-h-dvh place-items-center bg-cream">
        Opening Samwise…
      </main>
    );
  if (!session) return <SignIn />;
  return children;
}
function SignIn() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  function validCredentials() {
    if (!email.trim()) {
      setMessage("Enter your email address first.");
      return false;
    }
    if (password.length < 6) {
      setMessage("Use a password with at least six characters.");
      return false;
    }
    return true;
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!validCredentials() || busy) return;
    setBusy(true);
    setMessage("");
    const { error } = await supabase!.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) setMessage(error.message);
    setBusy(false);
  }
  async function signUp() {
    if (!validCredentials() || busy) return;
    setBusy(true);
    setMessage("");
    const { data, error } = await supabase!.auth.signUp({
      email: email.trim(),
      password,
    });
    setMessage(
      error
        ? error.message
        : data.session
          ? "Account created. Opening Samwise…"
          : "Account created. Check your email to confirm it.",
    );
    setBusy(false);
  }
  return (
    <main className="grid min-h-dvh place-items-center bg-cream p-5">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-soft"
      >
        <h1 className="text-3xl font-bold">Welcome to Samwise</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your planner stays local-first and syncs after sign-in.
        </p>
        <label className="mt-6 block text-sm font-semibold">Email</label>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 min-h-12 w-full rounded-xl border border-sand px-3"
        />
        <label className="mt-4 block text-sm font-semibold">Password</label>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 min-h-12 w-full rounded-xl border border-sand px-3"
        />
        {message && <p className="mt-3 text-sm text-clay">{message}</p>}
        <button disabled={busy} className="mt-6 min-h-12 w-full rounded-xl bg-sage font-semibold text-white disabled:opacity-50">
          {busy ? "Please wait…" : "Sign in"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void signUp()}
          className="mt-2 min-h-12 w-full rounded-xl border border-sand disabled:opacity-50"
        >
          Create account
        </button>
      </form>
    </main>
  );
}
