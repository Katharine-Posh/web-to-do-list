import { el } from '../dom.js';
import { pluralize } from '../utils/format.js';

export function createHero() {
  const progressValue = el('span', {
    className: 'progress-card__value',
    id: 'progress-value',
    text: '0%',
  });
  const progressHint = el('p', {
    className: 'progress-card__hint',
    id: 'progress-hint',
    text: 'Пока нет задач',
  });
  const progressBar = el('span', { className: 'progress__bar', id: 'progress-bar' });
  const progress = el(
    'div',
    {
      className: 'progress',
      attrs: {
        role: 'progressbar',
        'aria-label': 'Выполнено задач',
        'aria-valuemin': '0',
        'aria-valuemax': '100',
        'aria-valuenow': '0',
        'aria-valuetext': '0 из 0 задач выполнено',
      },
    },
    progressBar,
  );

  const element = el(
    'section',
    { className: 'hero', attrs: { 'aria-labelledby': 'page-title' } },
    el(
      'div',
      { className: 'hero__copy' },
      el(
        'h1',
        { className: 'hero__title', id: 'page-title' },
        'Мои задачи',
        el('span', { className: 'hero__title-mark', text: '.' }),
      ),
    ),
    el(
      'div',
      { className: 'progress-card' },
      el(
        'div',
        { className: 'progress-card__top' },
        el('span', { className: 'progress-card__label', text: 'Прогресс' }),
        progressValue,
      ),
      progress,
      progressHint,
    ),
  );

  function update({ total = 0, completed = 0 } = {}) {
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    const isComplete = total > 0 && completed === total;

    progressValue.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;
    progress.setAttribute('aria-valuenow', String(percent));
    progress.setAttribute(
      'aria-valuetext',
      `${completed} из ${total} ${pluralize(total, ['задачи', 'задач', 'задач'])} выполнено`,
    );
    element.classList.toggle('hero--complete', isComplete);

    if (total === 0) {
      progressHint.textContent = 'Пока нет задач';
      return;
    }

    if (isComplete) {
      progressHint.textContent = 'Можно выдохнуть';
      return;
    }

    progressHint.textContent = `${completed} из ${total} ${pluralize(total, ['задачи', 'задач', 'задач'])}`;
  }

  update();

  return { element, update };
}
