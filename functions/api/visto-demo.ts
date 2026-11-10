import { handleContact, type ContactEnv } from "./contact.ts";

const origin = "https://visto.hawksbi.com.br";
type Context = { request: Request; env: ContactEnv };

export async function handleVistoDemo(context: Context, requestFetch: typeof fetch = fetch) {
  const { request, env } = context;
  const headers = new Headers({ "Cache-Control": "no-store", Vary: "Origin" });
  if (request.headers.get("Origin") !== origin) return new Response(null, { status: 403, headers });

  headers.set("Access-Control-Allow-Origin", origin);
  if (request.method === "OPTIONS") {
    headers.set("Access-Control-Allow-Methods", "GET, POST");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    return new Response(null, { status: 204, headers });
  }

  const response = request.method === "GET" && (!env.RESEND_API_KEY || !env.CONTACT_FROM || !env.TURNSTILE_SECRET_KEY)
    ? Response.json({ ok: false, code: "not_configured" }, { status: 503 })
    : await handleContact(context, requestFetch, origin);
  for (const [name, value] of headers) response.headers.set(name, value);
  return response;
}

export const onRequest = (context: Context) => handleVistoDemo(context);
