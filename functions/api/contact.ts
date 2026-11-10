export interface ContactEnv {
  RESEND_API_KEY?: string;
  CONTACT_FROM?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
}
type Context = { request: Request; env: ContactEnv };
const recipient = "comercial@hawksbi.com.br";
const topics = new Set(["", "Software sob medida", "Automação", "Visto", "Agendo", "Outro assunto"]);
const limit = 20000;
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
const fail = (status: number, code: string) => json({ ok: false, code }, status);

async function readBody(request: Request) {
  if (Number(request.headers.get("content-length")) > limit) throw new Error("large");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("invalid");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > limit) { await reader.cancel(); throw new Error("large"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function handleContact(
  { request, env }: Context,
  requestFetch: typeof fetch = fetch,
  vistoOrigin?: string,
): Promise<Response> {
  if (request.method === "GET") return env.TURNSTILE_SITE_KEY ? json({ siteKey: env.TURNSTILE_SITE_KEY }) : fail(503, "not_configured");
  if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "GET, POST", "Cache-Control": "no-store" } });
  const url = new URL(request.url);
  const origin = vistoOrigin ?? url.origin;
  if (request.headers.get("origin") !== origin) return fail(403, "origin");
  if (!/^application\/json(?:;|$)/i.test(request.headers.get("content-type") ?? "")) return fail(415, "content_type");
  let input;
  try { input = await readBody(request); } catch (error) { return fail(error instanceof Error && error.message === "large" ? 413 : 400, "invalid_body"); }
  if (!input || typeof input !== "object" || Array.isArray(input)) return fail(400, "invalid_body");
  const { name, email, topic, message, phone, website, submissionId, token } = input;
  if ([name, email, website, submissionId, token].some(value => typeof value !== "string")) return fail(400, "invalid_fields");
  if (name.trim().length < 2 || name.length > 100 || /[\r\n\x00]/.test(name)
    || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    || /[\r\n\x00]/.test(email) || website || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(submissionId)
    || !token || token.length > 2048) return fail(400, "invalid_fields");
  if (vistoOrigin) {
    if (typeof phone !== "string" || !/^\+55[1-9]\d(?:[2-5]\d{7}|9\d{8})$/.test(phone)) return fail(400, "invalid_fields");
  } else if (typeof topic !== "string" || !topics.has(topic) || typeof message !== "string"
    || message.trim().length < 10 || message.length > 4000) return fail(400, "invalid_fields");
  if (!env.RESEND_API_KEY || !env.CONTACT_FROM || !env.TURNSTILE_SECRET_KEY) return fail(503, "not_configured");
  try {
    const verification = await requestFetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: request.headers.get("CF-Connecting-IP") ?? undefined }),
      signal: AbortSignal.timeout(8000),
    });
    if (!verification.ok) return fail(503, "verification_unavailable");
    const challenge = await verification.json() as { success?: boolean; hostname?: string; action?: string };
    const action = vistoOrigin ? "visto-demo" : "contact";
    if (!challenge.success || challenge.hostname !== new URL(origin).hostname || challenge.action !== action) return fail(403, "verification");
    // Destination and sender are server-owned. User input never chooses recipients or headers.
    const delivery = await requestFetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `${vistoOrigin ? "visto-demo" : "hawks-contact"}/${submissionId}` },
      body: JSON.stringify({
        from: env.CONTACT_FROM, to: [recipient], reply_to: email.trim(),
        subject: vistoOrigin ? "Visto | Pedido de demonstração" : `Novo contato pelo site Hawks: ${topic || "Projeto"}`,
        text: vistoOrigin
          ? `Pedido de demonstração pelo site do Visto\n\nNome: ${name.trim()}\nE-mail: ${email.trim()}\nWhatsApp: ${phone}`
          : `Nova mensagem pelo site Hawks BI\n\nNome: ${name.trim()}\nE-mail: ${email.trim()}\nAssunto: ${topic || "Ainda estou definindo"}\n\n${message.trim()}`,
      }), signal: AbortSignal.timeout(12000),
    });
    if (!delivery.ok) return fail(delivery.status === 429 ? 429 : 502, "delivery_unavailable");
    const result = await delivery.json() as { id?: string };
    return typeof result.id === "string" && result.id ? json({ ok: true }) : fail(502, "delivery_unavailable");
  } catch { return fail(503, "temporarily_unavailable"); }
}
export const onRequest = (context: Context) => handleContact(context);
