/**
 * Contact form: inline validation, the Cloudflare Turnstile check (loaded on
 * first use), and sending without leaving the page. Without JavaScript the
 * form still posts to /api/contact.
 */

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
    __onTurnstile?: () => void;
  }
}

const form = document.querySelector<HTMLFormElement>('[data-contact]');
if (form) init(form);

function init(form: HTMLFormElement) {
  form.noValidate = true;
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]')!;
  const done = document.querySelector<HTMLElement>('[data-done]')!;
  const slot = form.querySelector<HTMLElement>('[data-turnstile]')!;
  const siteKey = form.dataset.sitekey ?? '';

  /* ?topic=itsm preselects "What do you need?" */
  const topic = new URLSearchParams(location.search).get('topic');
  if (topic) {
    const option = [...form.querySelectorAll<HTMLOptionElement>('option[data-slugs]')].find((o) => o.dataset.slugs!.split(' ').includes(topic));
    if (option) option.selected = true;
  }

  /* ── Validation ─────────────────────────────────────────────────────── */
  const MESSAGES: Record<string, (el: HTMLInputElement) => string> = {
    name: () => 'Please tell us your name.',
    email: (el) => (el.value.trim() ? 'Please check your email address: it should look like name@company.com.' : 'Please enter your work email.'),
    topic: () => 'Please choose what you need help with.',
    message: (el) => (el.value.trim() ? 'Please add a little more detail (at least 10 characters).' : 'Please tell us a little about what you need.'),
  };
  const fields = Object.keys(MESSAGES).map((name) => form.elements.namedItem(name) as HTMLInputElement);

  const show = (el: HTMLInputElement, message: string) => {
    const error = document.getElementById(`${el.id}-error`);
    if (!error) return;
    error.textContent = message;
    error.hidden = !message;
    el.setAttribute('aria-invalid', String(Boolean(message)));
    const hint = el.id === 'f-message' ? 'f-message-hint ' : '';
    if (message) el.setAttribute('aria-describedby', `${hint}${error.id}`.trim());
    else if (hint) el.setAttribute('aria-describedby', hint.trim());
    else el.removeAttribute('aria-describedby');
  };
  const check = (el: HTMLInputElement) => {
    const value = el.value.trim();
    const ok = el.checkValidity() && value.length > 0 && (el.name !== 'message' || value.length >= 10);
    show(el, ok ? '' : MESSAGES[el.name]!(el));
    return ok;
  };
  for (const el of fields) {
    // Validate once a field has been left, then live while it is corrected.
    el.addEventListener('blur', () => el.value && check(el));
    el.addEventListener('input', () => el.getAttribute('aria-invalid') === 'true' && check(el));
    el.addEventListener('change', () => el.tagName === 'SELECT' && check(el));
  }

  /* ── Turnstile ──────────────────────────────────────────────────────── */
  let token = '';
  let widget: string | undefined;
  let waiting: ((t: string) => void) | undefined;
  let loading: Promise<void> | undefined;
  const loadTurnstile = () =>
    (loading ??= new Promise<void>((resolve, reject) => {
      window.__onTurnstile = resolve;
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__onTurnstile';
      s.async = true;
      s.onerror = () => reject(new Error('turnstile'));
      document.head.append(s);
    }).then(() => {
      widget = window.turnstile!.render(slot, {
        sitekey: siteKey,
        theme: 'dark',
        size: slot.clientWidth < 300 ? 'compact' : 'flexible',
        callback: (t: string) => {
          token = t;
          waiting?.(t);
        },
        'expired-callback': () => (token = ''),
        'error-callback': () => (token = ''),
      });
    }));
  const getToken = (ms: number) =>
    token
      ? Promise.resolve(token)
      : new Promise<string>((resolve) => {
          waiting = resolve;
          setTimeout(() => resolve(''), ms);
        });
  if (siteKey) {
    form.addEventListener('focusin', () => void loadTurnstile().catch(() => {}), { once: true });
  }

  /* ── Send ───────────────────────────────────────────────────────────── */
  const say = (message: string, tone: 'info' | 'error' = 'info') => {
    status.textContent = message;
    status.dataset.tone = tone;
  };
  const busy = (on: boolean) => {
    submit.disabled = on;
    submit.setAttribute('aria-busy', String(on));
    submitLabel.textContent = on ? 'Sending…' : 'Send message';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const invalid = fields.filter((el) => !check(el));
    if (invalid.length) {
      say(invalid.length === 1 ? 'One field needs attention.' : `${invalid.length} fields need attention.`, 'error');
      invalid[0]!.focus();
      return;
    }
    busy(true);
    say('Sending your message…');
    try {
      if (siteKey) {
        await loadTurnstile();
        if (!(await getToken(8000))) {
          say('Please complete the security check above, then press Send message again.', 'error');
          busy(false);
          return;
        }
      }
      const data = new FormData(form);
      if (token) data.set('cf-turnstile-response', token);
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: Record<string, string> };
      if (res.ok && body.ok) {
        form.hidden = true;
        done.hidden = false;
        done.focus();
        return;
      }
      for (const [name, message] of Object.entries(body.fields ?? {})) {
        const el = form.elements.namedItem(name) as HTMLInputElement | null;
        if (el) show(el, message);
      }
      say(body.error ?? 'Something went wrong on our side. Please try again, or email us directly.', 'error');
    } catch {
      say('We could not reach the server. Check your connection and try again, or email us directly.', 'error');
    }
    token = '';
    if (widget) window.turnstile?.reset(widget);
    busy(false);
  });
}

export {};
