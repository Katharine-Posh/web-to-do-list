import { el } from '../dom.js';
import { createIcon } from '../icons.js';
import { formatFullDate, formatDueDate, isOverdue } from '../utils/date.js';

export function createTaskItem(task, { onToggle }) {
  const checkbox = el('input', {
    className: 'task__checkbox',
    type: 'checkbox',
    checked: task.completed,
    attrs: {
      'aria-label': task.completed
        ? `Вернуть задачу «${task.title}» в работу`
        : `Отметить задачу «${task.title}» выполненной`,
    },
  });

  checkbox.addEventListener('change', () => {
    onToggle(task.id);
  });

  const meta = el('div', { className: 'task__meta' });

  if (task.dueDate) {
    const overdue = !task.completed && isOverdue(task.dueDate);
    const dateClass = overdue ? 'task__date task__date--overdue' : 'task__date';

    meta.append(
      el(
        'span',
        {
          className: dateClass,
          attrs: { title: formatFullDate(task.dueDate) },
        },
        createIcon('calendar', { size: 14 }),
        el('span', { text: formatDueDate(task.dueDate) }),
      ),
    );
  } else {
    meta.append(el('span', { className: 'task__date task__date--empty', text: 'Без срока' }));
  }

  return el(
    'li',
    {
      className: task.completed ? 'task is-completed' : 'task',
      dataset: { id: task.id },
    },
    el('label', { className: 'task__check' }, checkbox),
    el(
      'div',
      { className: 'task__body' },
      el('p', { className: 'task__title', text: task.title }),
      meta,
    ),
  );
}
