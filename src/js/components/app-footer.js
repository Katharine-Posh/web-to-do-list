import { el } from '../dom.js';

export function createAppFooter() {
  const statusText = el('span', {
    id: 'footer-status',
    text: '0 задач · данные сохраняются в браузере',
  });

  const element = el(
    'footer',
    { className: 'app-footer' },
    el(
      'p',
      { className: 'app-footer__status' },
      el('span', { className: 'status-dot', attrs: { 'aria-hidden': 'true' } }),
      statusText,
    ),
  );

  return { element, statusText };
}
