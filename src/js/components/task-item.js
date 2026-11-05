import { el } from '../dom.js';
import { createIcon } from '../icons.js';
import { formatFullDate, formatDueDate, isOverdue } from '../utils/date.js';

export function createTaskItem(
  task,
  { onToggle, onEdit, onDelete, onMove, reorderable = false },
) {
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
      className: 'task__action task__action--edit',
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

  const dragHandle = reorderable
    ? el(
        'button',
        {
          className: 'task__action task__drag',
          type: 'button',
          draggable: true,
          attrs: {
            'aria-label': `Переместить задачу «${task.title}»`,
            'aria-describedby': 'drag-hint',
            'aria-keyshortcuts': 'Alt+ArrowUp Alt+ArrowDown',
            title: 'Перетащить или Alt + стрелки',
          },
        },
        createIcon('grip', { size: 17 }),
      )
    : null;

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
    el('div', { className: 'task__actions' }, dragHandle, editButton, deleteButton),
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

  if (dragHandle) {
    function clearDropIndicator() {
      element.classList.remove('task--drop-before', 'task--drop-after');
    }

    dragHandle.addEventListener('dragstart', (event) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', task.id);
      element.classList.add('is-dragging');
    });

    dragHandle.addEventListener('dragend', () => {
      element.classList.remove('is-dragging');
      clearDropIndicator();
    });

    dragHandle.addEventListener('keydown', (event) => {
      if (!event.altKey) {
        return;
      }

      const direction =
        event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;

      if (direction === 0) {
        return;
      }

      const sibling =
        direction === -1 ? element.previousElementSibling : element.nextElementSibling;

      if (!sibling || !sibling.classList.contains('task')) {
        return;
      }

      event.preventDefault();
      onMove(task.id, sibling.dataset.id, {
        after: direction === 1,
        focus: true,
      });
    });

    let touchState = null;

    function clearTouchIndicator() {
      touchState?.target?.classList.remove(
        'task--drop-before',
        'task--drop-after',
      );
    }

    dragHandle.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'touch') {
        return;
      }

      event.preventDefault();
      touchState = { pointerId: event.pointerId, target: null, after: false };
      element.classList.add('is-dragging');

      try {
        dragHandle.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is optional; the drag still works without it.
      }
    });

    dragHandle.addEventListener('pointermove', (event) => {
      if (!touchState || event.pointerId !== touchState.pointerId) {
        return;
      }

      const candidate = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest('.task');
      const target = candidate && candidate !== element ? candidate : null;

      if (target !== touchState.target) {
        clearTouchIndicator();
        touchState.target = target;
        touchState.after = false;
      }

      if (!target) {
        return;
      }

      const rect = target.getBoundingClientRect();
      const after = event.clientY > rect.top + rect.height / 2;
      touchState.after = after;
      target.classList.toggle('task--drop-before', !after);
      target.classList.toggle('task--drop-after', after);
    });

    function finishTouchDrag(event, cancelled) {
      if (!touchState || event.pointerId !== touchState.pointerId) {
        return;
      }

      const { target, after } = touchState;
      clearTouchIndicator();
      element.classList.remove('is-dragging');
      touchState = null;

      if (!cancelled && target && target.dataset.id !== task.id) {
        onMove(task.id, target.dataset.id, { after });
      }
    }

    dragHandle.addEventListener('pointerup', (event) => {
      finishTouchDrag(event, false);
    });

    dragHandle.addEventListener('pointercancel', (event) => {
      finishTouchDrag(event, true);
    });

    element.addEventListener('dragover', (event) => {
      if (element.classList.contains('is-dragging')) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      const rect = element.getBoundingClientRect();
      const after = event.clientY > rect.top + rect.height / 2;

      element.classList.toggle('task--drop-before', !after);
      element.classList.toggle('task--drop-after', after);
    });

    element.addEventListener('dragleave', (event) => {
      if (!element.contains(event.relatedTarget)) {
        clearDropIndicator();
      }
    });

    element.addEventListener('drop', (event) => {
      event.preventDefault();

      const draggedId = event.dataTransfer.getData('text/plain');
      const after = element.classList.contains('task--drop-after');
      clearDropIndicator();

      if (draggedId && draggedId !== task.id) {
        onMove(draggedId, task.id, { after });
      }
    });
  }

  return element;
}
