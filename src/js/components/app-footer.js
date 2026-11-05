import { el } from '../dom.js';
import { pluralize } from '../utils/format.js';

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

  function update(tasks = []) {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const active = total - completed;

    if (total === 0) {
      statusText.textContent = '0 задач · данные сохраняются в браузере';
      return;
    }

    if (active === 0) {
      statusText.textContent = `${total} ${pluralize(total, ['задача', 'задачи', 'задач'])} · всё выполнено`;
      return;
    }

    statusText.textContent = `${total} ${pluralize(total, ['задача', 'задачи', 'задач'])} · ${active} ${pluralize(active, ['активная', 'активные', 'активных'])}`;
  }

  return { element, statusText, update };
}
