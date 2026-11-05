import { el } from '../dom.js';
import { createIcon } from '../icons.js';
import { formatFullDate, formatDueDate, isOverdue } from '../utils/date.js';

export function createTaskItem(task, { onToggle, onEdit, onDelete }) {
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

  const titleInput = el('input', {
    className: 'task__edit-input task__edit-input--title',
    type: 'text',
    value: task.title,
    maxLength: 140,
    autocomplete: 'off',
    attrs: { 'aria-label': 'Название задачи', 'aria-describedby': `edit-error-${task.id}` },
  });

  const dateInput = el('input', {
    className: 'task__edit-input task__edit-input--date',
    type: 'date',
    value: task.dueDate ?? '',
    attrs: { 'aria-label': 'Срок выполнения' },
  });

  const error = el('p', {
    className: 'task__edit-error',
    id: `edit-error-${task.id}`,
    role: 'alert',
    hidden: true,
  });

  const saveButton = el(
    'button',
    { className: 'button button--primary task__edit-save', type: 'submit' },
    el('span', { text: 'Сохранить' }),
  );

  const cancelButton = el(
    'button',
    {
      className: 'button button--ghost task__edit-cancel',
      type: 'button',
      attrs: { 'aria-label': 'Отменить редактирование' },
    },
    createIcon('close', { size: 17 }),
  );

  const editForm = el(
    'form',
    { className: 'task__edit', noValidate: true, hidden: true },
    titleInput,
    dateInput,
    saveButton,
    cancelButton,
    error,
  );

  const editButton = el(
    'button',
    {
      className: 'task__action',
      type: 'button',
      attrs: { 'aria-label': `Редактировать задачу «${task.title}»`, title: 'Редактировать' },
    },
    createIcon('edit', { size: 16 }),
  );

  const deleteButton = el(
    'button',
    {
      className: 'task__action task__action--danger',
      type: 'button',
      attrs: { 'aria-label': `Удалить задачу «${task.title}»`, title: 'Удалить' },
    },
    createIcon('trash', { size: 16 }),
  );

  deleteButton.addEventListener('click', () => {
    onDelete(task.id);
  });

  const element = el(
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
    el('div', { className: 'task__actions' }, editButton, deleteButton),
    editForm,
  );

  function clearError() {
    error.hidden = true;
    error.textContent = '';
    titleInput.removeAttribute('aria-invalid');
  }

  function startEditing() {
    clearError();
    titleInput.value = task.title;
    dateInput.value = task.dueDate ?? '';
    editForm.hidden = false;
    element.classList.add('is-editing');
    titleInput.focus();
    titleInput.select();
  }

  function stopEditing() {
    editForm.hidden = true;
    element.classList.remove('is-editing');
    editButton.focus();
  }

  editButton.addEventListener('click', startEditing);

  cancelButton.addEventListener('click', stopEditing);

  titleInput.addEventListener('input', () => {
    if (!error.hidden) {
      clearError();
    }
  });

  editForm.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      stopEditing();
    }
  });

  editForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    if (!title) {
      error.textContent = 'Введите название задачи';
      error.hidden = false;
      titleInput.setAttribute('aria-invalid', 'true');
      titleInput.focus();
      return;
    }

    onEdit(task.id, {
      title,
      dueDate: dateInput.value || null,
    });
  });

  return element;
}
