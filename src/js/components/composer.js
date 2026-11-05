import { el } from '../dom.js';
import { createIcon } from '../icons.js';

export function createComposer({ onAdd } = {}) {
  const titleInput = el('input', {
    className: 'field__input',
    id: 'task-title',
    name: 'title',
    type: 'text',
    placeholder: 'Что нужно сделать?',
    autocomplete: 'off',
    maxLength: 140,
    required: true,
    attrs: {
      'aria-describedby': 'task-form-error',
    },
  });

  const dateInput = el('input', {
    className: 'field__input field__input--date',
    id: 'task-date',
    name: 'date',
    type: 'date',
  });

  const submitButton = el(
    'button',
    {
      className: 'button button--primary composer__submit',
      type: 'submit',
    },
    createIcon('plus', { size: 19, strokeWidth: 2.2 }),
    el('span', { className: 'button__label', text: 'Добавить' }),
  );

  const errorElement = el('p', {
    className: 'composer__error',
    id: 'task-form-error',
    role: 'alert',
    hidden: true,
  });

  const form = el(
    'form',
    {
      className: 'composer__form',
      id: 'task-form',
      noValidate: true,
    },
    el(
      'div',
      { className: 'field field--title' },
      el('label', { className: 'visually-hidden', htmlFor: 'task-title', text: 'Название задачи' }),
      el('span', { className: 'field__icon', attrs: { 'aria-hidden': 'true' } }, createIcon('sparkles', { size: 18 })),
      titleInput,
    ),
    el(
      'div',
      { className: 'field field--date' },
      el('label', { className: 'visually-hidden', htmlFor: 'task-date', text: 'Срок выполнения' }),
      el('span', { className: 'field__icon', attrs: { 'aria-hidden': 'true' } }, createIcon('calendar', { size: 17 })),
      dateInput,
    ),
    submitButton,
  );

  const element = el(
    'section',
    {
      className: 'composer panel',
      attrs: { 'aria-labelledby': 'composer-title' },
    },
    el('h2', { className: 'visually-hidden', id: 'composer-title', text: 'Новая задача' }),
    form,
    errorElement,
    el(
      'p',
      { className: 'composer__hint' },
      el('kbd', { text: 'Enter' }),
      el('span', { text: ' — добавить задачу' }),
    ),
  );

  function showError(message) {
    errorElement.textContent = message;
    errorElement.hidden = false;
    titleInput.setAttribute('aria-invalid', 'true');
  }

  function clearError() {
    errorElement.hidden = true;
    errorElement.textContent = '';
    titleInput.removeAttribute('aria-invalid');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();

    if (!title) {
      showError('Введите название задачи');
      titleInput.focus();
      return;
    }

    clearError();
    onAdd?.({ title, dueDate: dateInput.value || null });
    form.reset();
    titleInput.focus();
  });

  titleInput.addEventListener('input', () => {
    if (!errorElement.hidden) {
      clearError();
    }
  });

  return {
    element,
    form,
    titleInput,
    dateInput,
    submitButton,
    errorElement,
    showError,
    clearError,
  };
}
