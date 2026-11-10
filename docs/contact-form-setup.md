# Contact form deployment

The UI sends JSON to `/api/contact`. `functions/api/contact.ts` is a Cloudflare Pages Function; `_routes.json` limits invocations to that path. Static pages remain prerendered.

Production activation requires these Cloudflare Pages production variables (do not commit their values):

- `RESEND_API_KEY`: secret, restricted to sending from the verified Hawks domain.
- `CONTACT_FROM`: verified sender, for example `Hawks BI <site@contato.hawksbi.com.br>`.
- `TURNSTILE_SITE_KEY`: public widget site key for `hawksbi.com.br` (and any explicitly supported hostname).
- `TURNSTILE_SECRET_KEY`: secret for the same widget.

Keep Titan root MX records intact. Prefer a dedicated sending subdomain; configure only the exact DKIM/SPF records provided by the mail service. The dedicated `contato.hawksbi.com.br` sending subdomain is verified in Resend. Its DKIM TXT and two DNS-only CNAME records are configured in Cloudflare; the root Titan MX records remain intact.

Recipient is fixed server-side to `comercial@hawksbi.com.br`. The visitor's email is `reply_to`. No attachments, contact database, tracking or automatic reply to the visitor is added. Input is bounded and validated on the server, with same-origin enforcement, honeypot and Turnstile action/hostname verification. A per-submission idempotency key protects provider retries. Production never uses a fake delivery response and fails closed when secrets are missing.

Run `npm run check:contact`, `npm run build`, `npm run check:seo` and a Cloudflare Pages Functions build before deployment. After configuring the service, send one clearly labeled test through the real modal to the commercial mailbox, confirm provider delivery and receipt, and check mobile/desktop success states. The automated tests use an injected fake transport; they are not evidence of mailbox delivery.

Current configuration (2026-10-09): Resend selected and authorized by the owner. The key has Sending access restricted to `contato.hawksbi.com.br`. All four production variables are stored in Cloudflare Pages project `hawks-bi`; the API key and Turnstile secret are not in source control. The managed Turnstile widget allows `hawksbi.com.br`. Tracking and receiving through Resend are disabled. Deployment and real form delivery must be confirmed separately; successful automated tests do not demonstrate inbox receipt.

## Visto demonstration booking

`/api/visto-demo` uses the same four bindings and the same commercial recipient. It also requires the dedicated secret `VISTO_DEMO_API_TOKEN` shared with the Cockpit integration, stored separately on both servers. CORS permits only `https://visto.hawksbi.com.br`. The widget must return the Visto hostname and action `visto-demo`.

The route requests a 30-day range of available one-hour slots from the Cockpit and forwards the confirmed slot and qualified lead. The browser gets slot times and an opaque ID. Cockpit owns reservation, deduplication, availability, and the linked lead. A slot taken by another visitor returns a conflict. Preserve the submission ID and payload after an uncertain response. After a confirmed booking, the route schedules an idempotent notification to the commercial inbox. Delivery errors are logged without personal details and do not undo the Cockpit reservation.

Deploy the Cockpit contract first (INF-568), provision the shared secret, then verify the Hawks route and the Visto preview with isolated data. Confirm the responsible field starts empty, the confirmed event lasts an hour, the lead is linked and the labeled test notice arrives before enabling the public flow. No configured slots means the modal reports unavailable availability. If reverting, restore the landing first.
