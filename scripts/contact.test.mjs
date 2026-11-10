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
const demoFields = {
  name: fields.name,
  email: fields.email,
  phone: '+5511999999999',
  website: '',
  submissionId: fields.submissionId,
  token: fields.token,
};
const demoRequest = (method, body, origin = vistoOrigin) => new Request('https://hawksbi.com.br/api/visto-demo', {
  method,
  headers: { origin, 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});

test('Visto permits browser requests only from its public origin', async () => {
  for (const method of ['GET', 'OPTIONS', 'POST']) {
    for (const origin of ['https://hawksbi.com.br', 'https://app.visto.hawksbi.com.br', 'https://visto.hawksbi.com.br.evil.test']) {
      const rejected = await handleVistoDemo({ request: demoRequest(method, undefined, origin), env }, never);
      assert.equal(rejected.status, 403);
      assert.equal(rejected.headers.has('Access-Control-Allow-Origin'), false);
    }
  }
  const config = await handleVistoDemo({ request: demoRequest('GET'), env }, never);
  assert.deepEqual(await config.json(), { siteKey: 'test-site' });
  assert.equal(config.headers.get('Access-Control-Allow-Origin'), vistoOrigin);
  const preflight = await handleVistoDemo({ request: demoRequest('OPTIONS'), env }, never);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Headers'), 'Content-Type');
  const unavailable = await handleVistoDemo({ request: demoRequest('GET'), env: { TURNSTILE_SITE_KEY: 'test-site' } }, never);
  assert.equal(unavailable.status, 503);
});

test('Visto sends a separate demonstration email and preserves idempotency on retries', async () => {
  const calls = [];
  const deliver = async (url, options) => {
    calls.push({ url, ...options });
    if (url.includes('siteverify')) return challenge({ hostname: 'visto.hawksbi.com.br', action: 'visto-demo' });
    return Response.json({ id: 'visto-receipt' });
  };
  for (const token of ['first-token', 'second-token']) {
    const result = await handleVistoDemo({ request: demoRequest('POST', { ...demoFields, token }), env }, deliver);
    assert.deepEqual(await result.json(), { ok: true });
    assert.equal(result.headers.get('Access-Control-Allow-Origin'), vistoOrigin);
  }
  for (const delivery of [calls[1], calls[3]]) {
    const mail = JSON.parse(delivery.body);
    assert.deepEqual(mail.to, ['comercial@hawksbi.com.br']);
    assert.equal(mail.reply_to, demoFields.email);
    assert.equal(mail.subject, 'Visto | Pedido de demonstração');
    assert.match(mail.text, /WhatsApp: \+5511999999999/);
    assert.equal(delivery.headers['Idempotency-Key'], `visto-demo/${demoFields.submissionId}`);
  }
});

test('Visto rejects malformed phones and tokens from the institutional form', async () => {
  for (const phone of ['11999999999', '+5500999999999', '+5511999999999\n', undefined]) {
    const result = await handleVistoDemo({ request: demoRequest('POST', { ...demoFields, phone }), env }, never);
    assert.equal(result.status, 400);
  }
  for (const values of [{ hostname: 'hawksbi.com.br', action: 'visto-demo' }, { hostname: 'visto.hawksbi.com.br', action: 'contact' }]) {
    let calls = 0;
    const result = await handleVistoDemo({ request: demoRequest('POST', demoFields), env }, async () => {
      calls++;
      return challenge(values);
    });
    assert.equal(result.status, 403);
    assert.equal(calls, 1);
  }
});
