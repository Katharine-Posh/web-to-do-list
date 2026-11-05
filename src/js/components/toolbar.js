import { el } from '../dom.js';
import { createIcon } from '../icons.js';

const FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' },
];

const SORT_OPTIONS = [
  { value: 'manual', label: 'Мой порядок' },
  { value: 'date-asc', label: 'Дата: сначала ранние' },
  { value: 'date-desc', label: 'Дата: сначала поздние' },
];

export function createToolbar() {
  const filterButtons = new Map();
  const filterCounts = new Map();

  const filters = el(
    'nav',
    {
      className: 'filters',
      attrs: { 'aria-label': 'Фильтр задач по статусу' },
    },
    FILTERS.map(({ value, label }) => {
      const count = el('span', {
        className: 'filter__count',
        dataset: { count: value },
        text: '0',
      });
      const button = el(
        'button',
        {
          className: value === 'all' ? 'filter is-active' : 'filter',
          type: 'button',
          dataset: { filter: value },
          attrs: { 'aria-pressed': String(value === 'all') },
        },
        el('span', { text: label }),
        count,
      );

      filterButtons.set(value, button);
      filterCounts.set(value, count);
      return button;
    }),
  );

  const searchInput = el('input', {
    className: 'search__input',
    id: 'task-search',
    type: 'search',
    placeholder: 'Поиск по названию',
    autocomplete: 'off',
    maxLength: 140,
    attrs: { 'aria-keyshortcuts': '/' },
  });

  const searchClear = el(
    'button',
    {
      className: 'search__clear',
      type: 'button',
      hidden: true,
      attrs: { 'aria-label': 'Очистить поиск' },
    },
    createIcon('close', { size: 16 }),
  );

  const search = el(
    'div',
    { className: 'search', attrs: { role: 'search' } },
    el('label', { className: 'visually-hidden', htmlFor: 'task-search', text: 'Поиск задач по названию' }),
    el('span', { className: 'search__icon', attrs: { 'aria-hidden': 'true' } }, createIcon('search', { size: 17 })),
    searchInput,
    searchClear,
  );

  const sortSelect = el(
    'select',
    { className: 'sort__select', id: 'task-sort' },
    SORT_OPTIONS.map(({ value, label }) =>
      el('option', { value, text: label, selected: value === 'manual' }),
    ),
  );

  const sort = el(
    'div',
    { className: 'sort' },
    el('label', { className: 'visually-hidden', htmlFor: 'task-sort', text: 'Сортировка задач' }),
    el('span', { className: 'sort__icon', attrs: { 'aria-hidden': 'true' } }, createIcon('sort', { size: 17 })),
    sortSelect,
    el('span', { className: 'sort__chevron', attrs: { 'aria-hidden': 'true' } }, createIcon('chevron', { size: 15 })),
  );

  const element = el(
    'div',
    { className: 'toolbar' },
    filters,
    el('div', { className: 'toolbar__controls' }, search, sort),
  );

  function updateCounts({ all = 0, active = 0, completed = 0 }) {
    filterCounts.get('all').textContent = String(all);
    filterCounts.get('active').textContent = String(active);
    filterCounts.get('completed').textContent = String(completed);
  }

  return {
    element,
    filterButtons,
    filterCounts,
    searchInput,
    searchClear,
    sortSelect,
    updateCounts,
  };
}
