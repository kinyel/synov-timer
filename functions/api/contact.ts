/**
 * POST /api/contact: the contact form, as a Cloudflare Pages Function.
 *
 * 1. Validates the fields (the browser checks them too, but never trust it).
 * 2. Verifies the Cloudflare Turnstile token.
 * 3. Sends the message through the email provider named in EMAIL_PROVIDER.
 *
 * Replies with JSON when the page sent it with JavaScript, or a small HTML
 * page when the form was posted without it. Configuration is environment
 * variables only: see README › "Contact form".
 */

interface Env {
  /** Turnstile secret key. Required unless EMAIL_PROVIDER is "log". */
  TURNSTILE_SECRET_KEY?: string;
  /** "resend", "postmark", "sendgrid", or "log" (local development: print, don't send). */
  EMAIL_PROVIDER?: string;
  EMAIL_API_KEY?: string;
  /** Where enquiries go, e.g. info@ralestonconsulting.com. */
  CONTACT_TO?: string;
  /** A sender on a domain verified with the provider, e.g. "Raleston website <web@ralestonconsulting.com>". */
  CONTACT_FROM?: string;
}

interface Context {
  request: Request;
  env: Env;
}

interface Enquiry {
  name: string;
  email: string;
  company: string;
  topic: string;
  message: string;
}

const FALLBACK = 'info@ralestonconsulting.com';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const onRequestPost = async ({ request, env }: Context): Promise<Response> => {
  const wantsJson = (request.headers.get('Accept') ?? '').includes('application/json');
  const reply = (status: number, body: { ok: boolean; error?: string; fields?: Record<string, string> }) =>
    wantsJson
      ? Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
      : new Response(page(body.ok, body.error), { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(400, { ok: false, error: 'We could not read the form. Please try again.' });
  }
  const text = (name: string, max: number) => String(form.get(name) ?? '').trim().slice(0, max);

  // A bot filled the hidden field: pretend it worked, send nothing.
  if (text('website', 200)) return reply(200, { ok: true });

  const data: Enquiry = {
    name: oneLine(text('name', 100)),
    email: oneLine(text('email', 200)),
    company: oneLine(text('company', 120)),
    topic: oneLine(text('topic', 120)),
    message: text('message', 5000),
  };
  const fields: Record<string, string> = {};
  if (!data.name) fields.name = 'Please tell us your name.';
  if (!EMAIL.test(data.email)) fields.email = 'Please check your email address: it should look like name@company.com.';
  if (!data.topic) fields.topic = 'Please choose what you need help with.';
  if (data.message.length < 10) fields.message = 'Please add a little more detail (at least 10 characters).';
  if (Object.keys(fields).length) return reply(422, { ok: false, error: 'Some fields need attention.', fields });

  const provider = (env.EMAIL_PROVIDER ?? '').toLowerCase();
  if (provider !== 'log') {
    if (!env.TURNSTILE_SECRET_KEY) {
      console.error('contact: TURNSTILE_SECRET_KEY is not set');
      return reply(503, { ok: false, error: `The form is not set up yet. Please email ${env.CONTACT_TO ?? FALLBACK}.` });
    }
    const passed = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, text('cf-turnstile-response', 2048), request.headers.get('CF-Connecting-IP'));
    if (!passed) return reply(403, { ok: false, error: 'The security check did not pass. Please try it again.' });
  }

  try {
    await send(env, provider, data, request.headers.get('Referer'));
  } catch (err) {
    console.error('contact: sending failed', err);
    return reply(502, { ok: false, error: `We could not send your message just now. Please try again, or email ${env.CONTACT_TO ?? FALLBACK}.` });
  }
  return reply(200, { ok: true });
};

/** Header-bound values never carry line breaks. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ');

async function verifyTurnstile(secret: string, token: string, ip: string | null): Promise<boolean> {
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const result = (await res.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

async function send(env: Env, provider: string, d: Enquiry, referer: string | null): Promise<void> {
  const subject = `Website enquiry: ${d.topic} (${d.name})`;
  const body = [
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    `Company: ${d.company || 'Not given'}`,
    `Topic: ${d.topic}`,
    '',
    d.message,
    '',
    '---',
    `Sent from the contact form${referer ? ` on ${referer}` : ''}. Reply to this email to answer ${d.name}.`,
  ].join('\n');

  if (provider === 'log') {
    console.log(`contact (EMAIL_PROVIDER=log, not sent)\nSubject: ${subject}\n\n${body}`);
    return;
  }
  const { EMAIL_API_KEY: key, CONTACT_TO: to, CONTACT_FROM: from } = env;
  if (!key || !to || !from) throw new Error('EMAIL_API_KEY, CONTACT_TO and CONTACT_FROM must all be set');

  let res: Response;
  switch (provider) {
    case 'resend':
      res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [to], reply_to: d.email, subject, text: body }),
      });
      break;
    case 'postmark':
      res = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: { 'X-Postmark-Server-Token': key, Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ From: from, To: to, ReplyTo: d.email, Subject: subject, TextBody: body, MessageStream: 'outbound' }),
      });
      break;
    case 'sendgrid':
      res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: parseAddress(from),
          reply_to: { email: d.email, name: d.name },
          subject,
          content: [{ type: 'text/plain', value: body }],
        }),
      });
      break;
    default:
      throw new Error(`Unknown EMAIL_PROVIDER "${provider}"`);
  }
  if (!res.ok) throw new Error(`${provider} answered ${res.status}: ${await res.text()}`);
}

/** "Name <a@b.com>" → { name, email } for SendGrid. */
function parseAddress(s: string): { email: string; name?: string } {
  const m = s.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1] || undefined, email: m[2]! } : { email: s.trim() };
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The reply when the form was posted without JavaScript. */
function page(ok: boolean, error?: string): string {
  const title = ok ? 'Thank you. Your message is on its way.' : 'Your message was not sent';
  const lead = ok ? 'An architect will read it and reply to the email address you gave.' : escape(error ?? 'Something went wrong.');
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${ok ? 'Message sent' : 'Message not sent'} | Raleston Consulting</title>
<style>
  body { margin: 0; min-height: 100svh; display: grid; place-items: center; padding: 1.5rem; font: 1.1rem/1.6 system-ui, sans-serif; color: #fff; background: #040a16; }
  main { max-width: 34rem; }
  h1 { font-size: 2rem; line-height: 1.15; margin: 0 0 1rem; }
  p { color: #d3d7e2; margin: 0 0 1.5rem; }
  a { display: inline-block; padding: 0.8rem 1.4rem; border-radius: 999px; color: #fff; text-decoration: none; background: linear-gradient(100deg, #4247af 10%, #0a69c2 100%); }
</style>
</head>
<body>
<main>
  <h1>${title}</h1>
  <p>${lead}</p>
  <a href="${ok ? '/' : '/contact/'}">${ok ? 'Back to the site' : 'Back to the contact page'}</a>
</main>
</body>
</html>`;
}
