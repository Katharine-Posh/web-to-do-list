import { append, clear, el } from '../dom.js';
import { createIcon } from '../icons.js';
import { createTaskItem } from './task-item.js';
import { createToolbar } from './toolbar.js';

export function createTaskList({ onToggle, onEdit, onDelete, onMove } = {}) {
  const toolbar = createToolbar();

  const countBadge = el('span', {
    className: 'tasks__count',
    id: 'tasks-count',
    text: '0',
  });

  const clearButton = el(
    'button',
    {
      className: 'button button--ghost tasks__clear',
      type: 'button',
      hidden: true,
    },
    createIcon('trash', { size: 15 }),
    el('span', { className: 'button__label', text: 'Очистить выполненные' }),
  );

  const list = el('ul', {
    className: 'task-list',
    id: 'task-list',
    attrs: { 'aria-label': 'Список задач' },
  });

  const emptyTitle = el('h3', {
    className: 'empty-state__title',
    id: 'empty-state-title',
    text: 'Пока пусто',
  });

  const emptyAction = el(
    'button',
    {
      className: 'button button--secondary empty-state__action',
      type: 'button',
    },
    createIcon('plus', { size: 17, strokeWidth: 2.1 }),
    el('span', { text: 'Создать задачу' }),
  );

  const emptyState = el(
    'div',
    {
      className: 'empty-state',
      id: 'empty-state',
      attrs: { 'aria-labelledby': 'empty-state-title' },
    },
    el(
      'span',
      { className: 'empty-state__icon', attrs: { 'aria-hidden': 'true' } },
      createIcon('sparkles', { size: 30 }),
    ),
    emptyTitle,
    emptyAction,
  );

  const body = el('div', { className: 'tasks__body' }, list, emptyState);

  const element = el(
    'section',
    {
      className: 'tasks panel',
      attrs: { 'aria-labelledby': 'tasks-title' },
    },
    el(
      'div',
      { className: 'tasks__head' },
      el(
        'div',
        { className: 'tasks__heading' },
        el('h2', { className: 'tasks__title', id: 'tasks-title', text: 'Задачи' }),
        countBadge,
      ),
      clearButton,
    ),
    toolbar.element,
    body,
  );

  function render(visibleTasks, allTasks = visibleTasks, { reorderable = false } = {}) {
    clear(list);
    append(
      list,
      visibleTasks.map((task) =>
        createTaskItem(task, { onToggle, onEdit, onDelete, onMove, reorderable }),
      ),
    );

    const completed = allTasks.filter((task) => task.completed).length;
    const hasTasks = allTasks.length > 0;

    emptyState.hidden = visibleTasks.length > 0;
    emptyTitle.textContent = hasTasks ? 'Ничего не найдено' : 'Пока пусто';
    emptyAction.hidden = hasTasks;
    clearButton.hidden = completed === 0;
    countBadge.textContent = String(allTasks.length);
    toolbar.updateCounts({
      all: allTasks.length,
      active: allTasks.length - completed,
      completed,
    });
  }

  return {
    element,
    toolbar,
    list,
    emptyState,
    emptyTitle,
    emptyAction,
    countBadge,
    clearButton,
    render,
  };
}
