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
    [message, setMessage] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    const { error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setMessage(error.message);
  }
  async function signUp() {
    const { error } = await supabase!.auth.signUp({ email, password });
    setMessage(
      error ? error.message : "Check your email to confirm your account.",
    );
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
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 min-h-12 w-full rounded-xl border border-sand px-3"
        />
        <label className="mt-4 block text-sm font-semibold">Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 min-h-12 w-full rounded-xl border border-sand px-3"
        />
        {message && <p className="mt-3 text-sm text-clay">{message}</p>}
        <button className="mt-6 min-h-12 w-full rounded-xl bg-sage font-semibold text-white">
          Sign in
        </button>
        <button
          type="button"
          onClick={signUp}
          className="mt-2 min-h-12 w-full rounded-xl border border-sand"
        >
          Create account
        </button>
      </form>
    </main>
  );
}
