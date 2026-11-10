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

## Visto demonstration requests

`/api/visto-demo` uses the same four bindings and the same commercial recipient. CORS permits only `https://visto.hawksbi.com.br`. The widget must return the Visto hostname and action `visto-demo`. The email contains the visitor's name, email and Brazilian WhatsApp number, with the subject “Visto | Pedido de demonstração”. Its idempotency namespace is separate from the institutional form.

Deploy the Hawks Pages route first and check GET and OPTIONS with the Visto origin. Confirm an authorized test submission before activating the landing's buttons. If reverting both sites, revert the landing first so its buttons can still reach a working destination.
