import { readBody, type ContactEnv } from "./contact.ts";

const origin = "https://visto.hawksbi.com.br";
const cockpit = "https://cockpit.hawksbi.com.br/api/integrations/visto/demo/v1";
const timeZone = "America/Sao_Paulo";
const oneHour = 60 * 60 * 1000;
const calendarDate = new Intl.DateTimeFormat("en-CA", {
  timeZone, year: "numeric", month: "2-digit", day: "2-digit",
});
const uuid = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
const timestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/;

type Env = ContactEnv & {
  VISTO_DEMO_API_TOKEN?: string;
};
type Context = { request: Request; env: Env; waitUntil?: (promise: Promise<unknown>) => void };
type Slot = { id: string; startsAt: string; endsAt: string };
type Lead = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employeeCount: number;
  biggestPain: string;
  businessName: string;
};

function availabilityUrl() {
  const parts = new Map(calendarDate.formatToParts(new Date()).map(({ type, value }) => [type, value]));
  const from = `${parts.get("year")}-${parts.get("month")}-${parts.get("day")}`;
  const end = new Date(`${from}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 30);
  return `${cockpit}/availability?${new URLSearchParams({ from, to: end.toISOString().slice(0, 10) })}`;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function readSlot(value: unknown): Slot | null {
  const fields = record(value);
  if (!fields) return null;
  const { id, startsAt, endsAt } = fields;
  if (typeof id !== "string" || !id.trim() || id.length > 256 ||
    typeof startsAt !== "string" || !timestamp.test(startsAt) ||
    typeof endsAt !== "string" || !timestamp.test(endsAt) ||
    Date.parse(endsAt) - Date.parse(startsAt) !== oneHour) return null;
  return { id, startsAt, endsAt };
}

function cleanLine(value: unknown, maximum: number) {
  if (typeof value !== "string" || value.length > maximum || /[\u0000-\u001f\u007f]/.test(value)) return "";
  return value.trim();
}

function readLead(value: unknown): Lead | null {
  const fields = record(value);
  if (!fields) return null;
  const firstName = cleanLine(fields.firstName, 70);
  const lastName = cleanLine(fields.lastName, 89);
  const email = cleanLine(fields.email, 254);
  const businessName = cleanLine(fields.businessName, 150);
  const { phone, employeeCount, biggestPain } = fields;
  if (!firstName || !lastName || !businessName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof phone !== "string" || !/^\+55[1-9]\d(?:[2-5]\d{7}|9\d{8})$/.test(phone) ||
    typeof employeeCount !== "number" || !Number.isInteger(employeeCount) || employeeCount < 0 || employeeCount > 999999 ||
    typeof biggestPain !== "string" || biggestPain.length > 500 || !biggestPain.trim() || /\0/.test(biggestPain)) return null;
  return { firstName, lastName, email, phone, employeeCount, biggestPain: biggestPain.trim(), businessName };
}

async function notifyCommercial(requestFetch: typeof fetch, env: Env, booking: Slot, lead: Lead, submissionId: string) {
  try {
    const when = new Intl.DateTimeFormat("pt-BR", {
      timeZone, dateStyle: "full", timeStyle: "short",
    }).format(new Date(booking.startsAt));
    const response = await requestFetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `visto-booking/${submissionId}`,
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: ["comercial@hawksbi.com.br"],
        reply_to: lead.email,
        subject: "Visto | Demonstração agendada",
        text: [
          "Uma demonstração de 1 hora foi agendada no Cockpit.",
          `Horário de Brasília: ${when}`,
          `Nome: ${lead.firstName} ${lead.lastName}`,
          `E-mail: ${lead.email}`,
          `Telefone: ${lead.phone}`,
          `Negócio: ${lead.businessName}`,
          `Funcionários: ${lead.employeeCount}`,
          `Maior dificuldade: ${lead.biggestPain}`,
        ].join("\n"),
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) console.warn("Visto booking notice rejected", response.status);
  } catch {
    console.warn("Visto booking notice unavailable");
  }
}

export async function handleVistoDemo(context: Context, requestFetch: typeof fetch = fetch) {
  const { request, env } = context;
  const headers = new Headers({ "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", Vary: "Origin" });
  if (request.headers.get("Origin") !== origin) return new Response(null, { status: 403, headers });
  headers.set("Access-Control-Allow-Origin", origin);
  if (request.method === "OPTIONS") {
    headers.set("Access-Control-Allow-Methods", "GET, POST");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    return new Response(null, { status: 204, headers });
  }
  const json = (data: unknown, status = 200) => Response.json(data, { status, headers });
  const fail = (status: number, code: string) => json({ ok: false, code }, status);
  if (request.method !== "GET" && request.method !== "POST") {
    headers.set("Allow", "GET, POST, OPTIONS");
    return fail(405, "method");
  }

  if (!env.VISTO_DEMO_API_TOKEN?.trim() || !env.TURNSTILE_SITE_KEY ||
    !env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY || !env.CONTACT_FROM) return fail(503, "not_configured");
  const authorization = `Bearer ${env.VISTO_DEMO_API_TOKEN}`;

  if (request.method === "GET") {
    try {
      const response = await requestFetch(availabilityUrl(), {
        headers: { Authorization: authorization, Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
        redirect: "error",
      });
      if (!response.ok) return fail(503, "availability_unavailable");
      const result = record(await response.json());
      if (result?.timeZone !== timeZone || !Array.isArray(result.slots)) return fail(502, "availability_unavailable");
      const slots: Slot[] = [];
      for (const value of result.slots) {
        const slot = readSlot(value);
        if (!slot) return fail(502, "availability_unavailable");
        if (Date.parse(slot.startsAt) > Date.now()) slots.push(slot);
      }
      return json({ siteKey: env.TURNSTILE_SITE_KEY, timeZone, slots });
    } catch {
      return fail(503, "availability_unavailable");
    }
  }

  if (!/^application\/json(?:;|$)/i.test(request.headers.get("Content-Type") ?? "")) return fail(415, "content_type");
  let input;
  try {
    input = record(await readBody(request));
  } catch (error) {
    return fail(error instanceof Error && error.message === "large" ? 413 : 400, "invalid_body");
  }
  if (!input) return fail(400, "invalid_body");
  const { slotId, submissionId, website, token } = input;
  const lead = readLead(input.lead);
  if (!lead || typeof slotId !== "string" || !slotId.trim() || slotId.length > 256 ||
    typeof submissionId !== "string" || !uuid.test(submissionId) || website !== "" ||
    typeof token !== "string" || !token || token.length > 2048) return fail(400, "invalid_fields");

  try {
    const verification = await requestFetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: request.headers.get("CF-Connecting-IP") ?? undefined }),
      signal: AbortSignal.timeout(8000),
    });
    if (!verification.ok) return fail(503, "verification_unavailable");
    const challenge = record(await verification.json());
    if (challenge?.success !== true || challenge.hostname !== new URL(origin).hostname ||
      challenge.action !== "visto-demo") return fail(403, "verification");

    const response = await requestFetch(`${cockpit}/bookings`, {
      method: "POST",
      headers: { Authorization: authorization, "Content-Type": "application/json" },
      body: JSON.stringify({ slotId, submissionId, lead: { ...lead, employeeCount: String(lead.employeeCount) } }),
      signal: AbortSignal.timeout(12000),
      redirect: "error",
    });
    const result = record(await response.json());
    const code = record(result?.error)?.code;
    if (response.status === 409 && (code === "slot_unavailable" || code === "submission_conflict")) {
      return fail(409, code);
    }
    if (!response.ok) return fail(502, "booking_unavailable");
    const booking = readSlot(result?.booking);
    if (!booking || record(result?.booking)?.timeZone !== timeZone) return fail(502, "booking_unavailable");

    context.waitUntil?.(notifyCommercial(requestFetch, env, booking, lead, submissionId));
    return json({ booking: { ...booking, timeZone } }, 201);
  } catch {
    return fail(503, "temporarily_unavailable");
  }
}

export const onRequest = (context: Context) => handleVistoDemo(context);
