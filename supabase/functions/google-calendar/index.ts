import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};
const enc = new TextEncoder(),
  dec = new TextDecoder();
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const url = new URL(req.url);
  if (url.searchParams.get("action") === "callback") return callback(url);
  if (req.method !== "POST")
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: cors },
    );
  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    req.headers.get("apikey") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization") ?? "" },
      },
    },
  );
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);
  const body = await req.json();
  if (body.action === "authorize") {
    assertConfigured();
    return json({ url: await authorizationUrl(user.id) });
  }
  const { data: connection } = await client
    .from("calendar_connections")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!connection?.encrypted_token_reference)
    return json({ error: "Calendar not connected" }, 409);
  const token = await activeToken(
    JSON.parse(await decrypt(connection.encrypted_token_reference)),
  );
  if (body.action === "sync") {
    const events = await readEvents(token.access_token);
    const rows = events.map((event: any) =>
      normalizeEvent(user.id, event, connection.privacy),
    );
    let stored = rows;
    if (rows.length) {
      const { data } = await client
        .from("calendar_event_cache")
        .upsert(rows, { onConflict: "owner_id,calendar_id,external_id" })
        .select();
      stored = data ?? rows;
    }
    return json({ events: stored });
  }
  if (body.action === "create_event") {
    if (body.approved !== true)
      return json({ error: "Explicit approval is required" }, 400);
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${token.access_token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body.event),
      },
    );
    if (!response.ok) return json({ error: await response.text() }, 502);
    return json({ event: await response.json() });
  }
  return json({ error: "Unknown action" }, 400);
});
async function callback(url: URL) {
  try {
    assertConfigured();
    const state = await verifyState(url.searchParams.get("state") ?? "");
    const code = url.searchParams.get("code");
    if (!code) throw new Error("Google did not return an authorization code");
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
        client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
        redirect_uri: redirectUri(),
        grant_type: "authorization_code",
      }),
    });
    if (!response.ok) throw new Error(await response.text());
    const tokens = await response.json();
    tokens.expires_at =
      Math.floor(Date.now() / 1000) + (tokens.expires_in ?? 3600);
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    await admin.from("calendar_connections").upsert(
      {
        owner_id: state.userId,
        encrypted_token_reference: await encrypt(JSON.stringify(tokens)),
        selected_calendars: ["primary"],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "owner_id" },
    );
    return Response.redirect(
      `${Deno.env.get("APP_URL") ?? "https://samwise-task-management.vercel.app"}/calendar?connected=1`,
      302,
    );
  } catch (error) {
    return Response.redirect(
      `${Deno.env.get("APP_URL") ?? "https://samwise-task-management.vercel.app"}/calendar?error=${encodeURIComponent((error as Error).message)}`,
      302,
    );
  }
}
async function authorizationUrl(userId: string) {
  const state = await signState({ userId, expires: Date.now() + 10 * 60_000 });
  const params = new URLSearchParams({
    client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope:
      "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}
async function readEvents(accessToken: string) {
  const start = new Date(),
    end = new Date();
  end.setDate(end.getDate() + 35);
  const params = new URLSearchParams({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "2500",
  });
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { authorization: `Bearer ${accessToken}` } },
  );
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()).items ?? [];
}
function normalizeEvent(ownerId: string, event: any, privacy: string) {
  const allDay = Boolean(event.start?.date),
    start = event.start?.dateTime ?? `${event.start?.date}T00:00:00Z`,
    end = event.end?.dateTime ?? `${event.end?.date}T00:00:00Z`,
    stamp = new Date().toISOString();
  return {
    owner_id: ownerId,
    external_id: event.id,
    calendar_id: "primary",
    title: privacy === "busy_only" ? "Busy" : (event.summary ?? "Busy"),
    start_at: start,
    end_at: end,
    all_day: allDay,
    travel: /flight|travel|airport|train/i.test(event.summary ?? ""),
    privacy,
    created_at: stamp,
    updated_at: stamp,
    version: 1,
  };
}
async function activeToken(token: any) {
  if (token.expires_at && token.expires_at > Date.now() / 1000 + 60)
    return token;
  if (!token.refresh_token) return token;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: token.refresh_token,
      client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
      grant_type: "refresh_token",
    }),
  });
  return { ...token, ...(await response.json()) };
}
function assertConfigured() {
  for (const key of [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_STATE_SECRET",
    "GOOGLE_TOKEN_ENCRYPTION_KEY",
  ])
    if (!Deno.env.get(key)) throw new Error(`${key} is not configured`);
}
const redirectUri = () =>
  Deno.env.get("GOOGLE_REDIRECT_URI") ??
  `${Deno.env.get("SUPABASE_URL")}/functions/v1/google-calendar?action=callback`;
async function signState(value: unknown) {
  const payload = btoa(JSON.stringify(value))
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replaceAll("=", ""),
    key = await crypto.subtle.importKey(
      "raw",
      enc.encode(Deno.env.get("GOOGLE_STATE_SECRET")!),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return `${payload}.${bytes(new Uint8Array(sig))}`;
}
async function verifyState(value: string) {
  const [payload, sig] = value.split("."),
    expected = await signState(
      JSON.parse(atob(payload.replaceAll("-", "+").replaceAll("_", "/"))),
    );
  if (expected.split(".")[1] !== sig) throw new Error("Invalid OAuth state");
  const data = JSON.parse(
    atob(payload.replaceAll("-", "+").replaceAll("_", "/")),
  );
  if (data.expires < Date.now()) throw new Error("OAuth state expired");
  return data;
}
async function cipherKey() {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(Deno.env.get("GOOGLE_TOKEN_ENCRYPTION_KEY")!).slice(0, 32),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}
async function encrypt(value: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12)),
    data = new Uint8Array(
      await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        await cipherKey(),
        enc.encode(value),
      ),
    );
  return `${bytes(iv)}.${bytes(data)}`;
}
async function decrypt(value: string) {
  const [iv, data] = value.split(".");
  return dec.decode(
    await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: unbytes(iv) },
      await cipherKey(),
      unbytes(data),
    ),
  );
}
function bytes(value: Uint8Array) {
  return btoa(String.fromCharCode(...value))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}
function unbytes(value: string) {
  return Uint8Array.from(
    atob(value.replaceAll("-", "+").replaceAll("_", "/")),
    (c) => c.charCodeAt(0),
  );
}
function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
