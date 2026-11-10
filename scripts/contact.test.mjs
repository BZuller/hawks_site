import test from 'node:test';
import assert from 'node:assert/strict';
import { handleContact } from '../functions/api/contact.ts';
import { handleVistoDemo } from '../functions/api/visto-demo.ts';
const env = { RESEND_API_KEY: 'test-key', CONTACT_FROM: 'Hawks BI <site@contato.hawksbi.com.br>', TURNSTILE_SITE_KEY: 'test-site', TURNSTILE_SECRET_KEY: 'test-secret' };
const fields = { name: 'Teste Hawks', email: 'teste@example.com', topic: 'Software sob medida', message: 'Mensagem de teste do formulário.', website: '', submissionId: '12345678-1234-4234-8234-123456789abc', token: 'challenge-token' };
const req = (body = fields, headers = {}) => new Request('https://hawksbi.com.br/api/contact', { method: 'POST', headers: { origin: 'https://hawksbi.com.br', 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
const never = () => { throw new Error('External request must not happen'); };
const challenge = (values = {}) => Response.json({ success: true, hostname: 'hawksbi.com.br', action: 'contact', ...values });
test('only the public site key is exposed', async () => { const r = await handleContact({ request: new Request('https://hawksbi.com.br/api/contact'), env }, never); assert.deepEqual(await r.json(), { siteKey: 'test-site' }); assert.equal(r.headers.get('Cache-Control'), 'no-store'); });
test('valid form sends to fixed recipient with reply-to and idempotency', async () => {
  const calls = [];
  const response = await handleContact({ request: req({ ...fields, to: 'attacker@example.com', from: 'attacker@example.com' }), env }, async (url, options) => { calls.push({ url, ...options }); return calls.length === 1 ? challenge() : Response.json({ id: 'email-receipt' }); });
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), { ok: true });
  assert.equal(calls.length, 2); const mail = JSON.parse(calls[1].body);
  assert.deepEqual(mail.to, ['comercial@hawksbi.com.br']); assert.equal(mail.reply_to, fields.email); assert.equal(mail.from, env.CONTACT_FROM); assert.match(mail.text, /Mensagem de teste/); assert.equal(mail.html, undefined);
  assert.equal(calls[1].headers['Idempotency-Key'], `hawks-contact/${fields.submissionId}`);
});
test('foreign origin and unsupported content type cannot send', async () => { assert.equal((await handleContact({ request: req(fields, { origin: 'https://evil.test' }), env }, never)).status, 403); assert.equal((await handleContact({ request: req(fields, { 'Content-Type': 'text/plain' }), env }, never)).status, 415); });
test('invalid values and honeypot cannot send', async () => {
  for (const invalid of [{ name: 'x' }, { name: 'x\nBcc: hi' }, { email: 'bad' }, { email: 'x@y.com\r\nBcc:x@y.com' }, { topic: 'injected' }, { message: 'short' }, { message: 'x'.repeat(4001) }, { website: 'spam' }, { submissionId: 'bad' }, { token: '' }, { name: [] }]) assert.equal((await handleContact({ request: req({ ...fields, ...invalid }), env }, never)).status, 400);
});
test('oversize request is bounded', async () => { assert.equal((await handleContact({ request: req({ ...fields, message: 'x'.repeat(21000) }), env }, never)).status, 413); });
test('missing configuration fails closed', async () => { assert.equal((await handleContact({ request: req(), env: {} }, never)).status, 503); });
test('rejected, wrong-host and wrong-action tokens cannot send', async () => {
  for (const override of [{ success: false }, { hostname: 'evil.test' }, { action: 'other' }]) { let calls = 0; const r = await handleContact({ request: req(), env }, async () => { calls++; return challenge(override); }); assert.equal(r.status, 403); assert.equal(calls, 1); }
});
test('provider failure never returns success or leaks details', async () => {
  for (const status of [401, 429, 500]) { let calls = 0; const r = await handleContact({ request: req(), env }, async () => ++calls === 1 ? challenge() : Response.json({ message: 'private-provider-details' }, { status })); assert.equal(r.status, status === 429 ? 429 : 502); assert.deepEqual(await r.json(), { ok: false, code: 'delivery_unavailable' }); }
});
test('network failure and missing receipt never return success', async () => { const r = await handleContact({ request: req(), env }, async () => { throw new Error('network'); }); assert.equal(r.status, 503); let calls = 0; const missing = await handleContact({ request: req(), env }, async () => ++calls === 1 ? challenge() : Response.json({})); assert.equal(missing.status, 502); });

const vistoOrigin = 'https://visto.hawksbi.com.br';
const cockpit = 'https://cockpit.hawksbi.com.br/api/integrations/visto/demo/v1';
const vistoEnv = { ...env, VISTO_DEMO_API_TOKEN: 'synthetic-server-token' };
const timeZone = 'America/Sao_Paulo';
const slot = { id: 'opaque-slot', startsAt: '2030-11-20T14:00:00-03:00', endsAt: '2030-11-20T15:00:00-03:00' };
const booking = { ...slot, id: 'booking-opaque', timeZone };
const lead = {
  firstName: 'Bruna', lastName: 'Teste', email: 'bruna@example.test', phone: '+5511999999999',
  employeeCount: 12, biggestPain: 'Conferir as rotinas dos turnos.', businessName: 'Padaria de Teste',
};
const demoFields = { lead, slotId: slot.id, website: '', submissionId: fields.submissionId, token: fields.token };
const demoRequest = (method, body, origin = vistoOrigin) => new Request('https://hawksbi.com.br/api/visto-demo', {
  method,
  headers: { origin, 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});
const demoChallenge = (values = {}) => challenge({ hostname: 'visto.hawksbi.com.br', action: 'visto-demo', ...values });

test('Visto permits browser requests only from its public origin and fails closed without config', async () => {
  for (const method of ['GET', 'OPTIONS', 'POST']) {
    for (const origin of ['https://hawksbi.com.br', 'https://app.visto.hawksbi.com.br', 'https://visto.hawksbi.com.br.evil.test']) {
      const rejected = await handleVistoDemo({ request: demoRequest(method, undefined, origin), env: vistoEnv }, never);
      assert.equal(rejected.status, 403);
      assert.equal(rejected.headers.has('Access-Control-Allow-Origin'), false);
    }
  }
  const preflight = await handleVistoDemo({ request: demoRequest('OPTIONS'), env: vistoEnv }, never);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Headers'), 'Content-Type');
  for (const config of [
    { ...vistoEnv, VISTO_DEMO_API_TOKEN: undefined },
    { ...vistoEnv, VISTO_DEMO_API_TOKEN: ' ' },
    { ...vistoEnv, TURNSTILE_SECRET_KEY: undefined },
  ]) {
    const unavailable = await handleVistoDemo({ request: demoRequest('GET'), env: config }, never);
    assert.equal(unavailable.status, 503);
  }
});

test('Visto exposes only future one-hour slots, with the Cockpit token kept server-side', async () => {
  const response = await handleVistoDemo({ request: demoRequest('GET'), env: vistoEnv }, async (url, options) => {
    const target = new URL(url);
    assert.equal(target.origin + target.pathname, cockpit + '/availability');
    const from = target.searchParams.get('from');
    const to = target.searchParams.get('to');
    assert.match(from, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(Date.parse(to) - Date.parse(from), 30 * 86400000);
    assert.equal(options.headers.Authorization, 'Bearer synthetic-server-token');
    assert.equal(options.redirect, 'error');
    return Response.json({ timeZone, slots: [
      { ...slot, ownerEmail: 'private@example.test' },
      { id: 'old', startsAt: '2020-01-01T10:00:00-03:00', endsAt: '2020-01-01T11:00:00-03:00' },
    ] });
  });
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), vistoOrigin);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await response.json(), { siteKey: 'test-site', timeZone, slots: [slot] });
  const bad = await handleVistoDemo({ request: demoRequest('GET'), env: vistoEnv }, async () =>
    Response.json({ timeZone, slots: [{ ...slot, endsAt: '2030-11-20T14:30:00-03:00' }] }));
  assert.equal(bad.status, 502);
});

test('Visto sends qualification to Cockpit and notifies commercial after a confirmed booking', async () => {
  const calls = [];
  const tasks = [];
  const deliver = async (url, options) => {
    calls.push({ url, ...options });
    if (url.includes('siteverify')) return demoChallenge();
    if (url === cockpit + '/bookings') return Response.json({ booking: { ...booking, owner: 'private' } });
    return Response.json({ id: 'mail-receipt' });
  };
  for (const token of ['first-token', 'second-token']) {
    const result = await handleVistoDemo({
      request: demoRequest('POST', { ...demoFields, token }),
      env: vistoEnv,
      waitUntil: (promise) => tasks.push(promise),
    }, deliver);
    assert.equal(result.status, 201);
    assert.deepEqual(await result.json(), { booking });
  }
  await Promise.all(tasks);
  const reservations = calls.filter((call) => call.url === cockpit + '/bookings');
  assert.equal(reservations.length, 2);
  for (const reservation of reservations) {
    assert.deepEqual(JSON.parse(reservation.body), {
      slotId: slot.id, submissionId: demoFields.submissionId, lead: { ...lead, employeeCount: '12' },
    });
    assert.equal(reservation.headers.Authorization, 'Bearer synthetic-server-token');
  }
  const notices = calls.filter((call) => call.url === 'https://api.resend.com/emails');
  assert.equal(notices.length, 2);
  for (const delivery of notices) {
    const mail = JSON.parse(delivery.body);
    assert.deepEqual(mail.to, ['comercial@hawksbi.com.br']);
    assert.equal(mail.reply_to, lead.email);
    assert.equal(mail.subject, 'Visto | Demonstração agendada');
    assert.match(mail.text, /Negócio: Padaria de Teste/);
    assert.equal(delivery.headers['Idempotency-Key'], `visto-booking/${demoFields.submissionId}`);
  }
});

test('Visto rejects malformed qualification and tokens from the institutional form', async () => {
  for (const partial of [{ lastName: ' ' }, { phone: '11999999999' }, { employeeCount: -1 }, { employeeCount: 2.5 },
    { biggestPain: '\n ' }, { businessName: ' ' }, { firstName: 'Nome\nTeste' }, { firstName: 'a'.repeat(71) }, { lastName: 'a'.repeat(90) }]) {
    const result = await handleVistoDemo({ request: demoRequest('POST', { ...demoFields, lead: { ...lead, ...partial } }), env: vistoEnv }, never);
    assert.equal(result.status, 400);
  }
  for (const fields of [{ hostname: 'hawksbi.com.br' }, { action: 'contact' }]) {
    let calls = 0;
    const result = await handleVistoDemo({ request: demoRequest('POST', demoFields), env: vistoEnv }, async () => {
      calls++;
      return demoChallenge(fields);
    });
    assert.equal(result.status, 403);
    assert.equal(calls, 1);
  }
});

test('Visto does not confirm or notify on contention or an uncertain Cockpit result', async () => {
  for (const [upstream, status, code] of [
    [() => Response.json({ error: { code: 'slot_unavailable' } }, { status: 409 }), 409, 'slot_unavailable'],
    [() => Response.json({ error: { code: 'submission_conflict' } }, { status: 409 }), 409, 'submission_conflict'],
    [() => Response.json({ private: true }, { status: 500 }), 502, 'booking_unavailable'],
    [() => Response.json({ booking: null }), 502, 'booking_unavailable'],
    [() => { throw new Error('connection reset'); }, 503, 'temporarily_unavailable'],
  ]) {
    let calls = 0;
    const tasks = [];
    const result = await handleVistoDemo({
      request: demoRequest('POST', demoFields), env: vistoEnv, waitUntil: (promise) => tasks.push(promise),
    }, async () => ++calls === 1 ? demoChallenge() : upstream());
    assert.equal(result.status, status);
    assert.deepEqual(await result.json(), { ok: false, code });
    assert.equal(tasks.length, 0);
    assert.equal(calls, 2);
  }
});
