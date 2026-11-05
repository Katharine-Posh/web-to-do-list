import { el } from '../dom.js';
import { createIcon } from '../icons.js';
import { getHeaderDate, toIsoDate } from '../utils/date.js';

export function createAppHeader() {
  const now = new Date();

  return el(
    'header',
    { className: 'app-header' },
    el(
      'a',
      {
        className: 'brand',
        href: './',
        attrs: { 'aria-label': 'To-Do — на главную' },
      },
      el(
        'span',
        { className: 'brand__mark', attrs: { 'aria-hidden': 'true' } },
        createIcon('check', { size: 21, strokeWidth: 2.7 }),
      ),
      el('span', { className: 'brand__name', text: 'To-Do' }),
    ),
    el(
      'div',
      { className: 'app-header__meta' },
      el(
        'p',
        { className: 'app-header__date' },
        createIcon('calendar', { size: 16 }),
        el('time', { dateTime: toIsoDate(now), text: getHeaderDate(now) }),
      ),
      el(
        'span',
        {
          className: 'storage-badge',
          attrs: { title: 'Задачи сохраняются в localStorage' },
        },
        createIcon('database', { size: 15 }),
        el('span', { text: 'Локально' }),
      ),
    ),
  );
}
