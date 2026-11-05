import { el } from './dom.js';
import { createAppHeader } from './components/app-header.js';
import { createHero } from './components/hero.js';
import { createComposer } from './components/composer.js';
import { createTaskList } from './components/task-list.js';
import { createAppFooter } from './components/app-footer.js';
import { createToastController } from './components/toast.js';
import {
  addTask,
  getTasks,
  moveTask,
  removeCompletedTasks,
  removeTask,
  restoreTasks,
  subscribe,
  toggleTask,
  updateTask,
} from './store.js';
import { pluralize } from './utils/format.js';

export function createApp() {
  const header = createAppHeader();
  const hero = createHero();
  const composer = createComposer({
    onAdd(task) {
      addTask(task);
      announce(`Задача добавлена: ${task.title}`);
    },
  });
  const taskList = createTaskList({
    onToggle(id) {
      const task = getTasks().find((item) => item.id === id);
      toggleTask(id);
      if (task) {
        announce(
          task.completed
            ? `Задача возвращена в работу: ${task.title}`
            : `Задача выполнена: ${task.title}`,
        );
      }
    },
    onEdit(id, changes) {
      const updated = updateTask(id, changes);
      if (updated) {
        announce(`Задача обновлена: ${updated.title}`);
      }
    },
    onDelete(id) {
      const removed = removeTask(id);
      if (!removed) {
        return;
      }

      toast.show({
        message: `Задача удалена: ${removed.task.title}`,
        actionLabel: 'Отменить',
        onAction() {
          restoreTasks([removed]);
          toast.show({ message: 'Задача восстановлена' });
        },
      });
    },
    onMove(draggedId, targetId, { after }) {
      if (moveTask(draggedId, targetId, { after })) {
        announce('Порядок задач обновлён');
      }
    },
  });
  const footer = createAppFooter();

  const liveRegion = el('div', {
    className: 'visually-hidden',
    id: 'live-region',
    attrs: { 'aria-live': 'polite', 'aria-atomic': 'true' },
  });

  const toastRegion = el('div', {
    className: 'toast-region',
    id: 'toast-region',
    attrs: { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' },
  });

  const toast = createToastController(toastRegion);

  const skipLink = el('a', {
    className: 'skip-link',
    href: '#main-content',
    text: 'Перейти к содержимому',
  });

  const main = el(
    'main',
    { className: 'app-main', id: 'main-content', tabIndex: -1 },
    hero.element,
    composer.element,
    taskList.element,
  );

  const element = el(
    'div',
    { className: 'app' },
    skipLink,
    header,
    main,
    footer.element,
    toastRegion,
    liveRegion,
  );

  const view = {
    filter: 'all',
    query: '',
    sort: 'manual',
  };

  function announce(message) {
    liveRegion.textContent = message;
  }

  function getVisibleTasks(tasks) {
    let visible = tasks;

    if (view.filter === 'active') {
      visible = visible.filter((task) => !task.completed);
    } else if (view.filter === 'completed') {
      visible = visible.filter((task) => task.completed);
    }

    const query = view.query.trim().toLocaleLowerCase('ru');

    if (query) {
      visible = visible.filter((task) =>
        task.title.toLocaleLowerCase('ru').includes(query),
      );
    }

    if (view.sort === 'date-asc' || view.sort === 'date-desc') {
      const direction = view.sort === 'date-asc' ? 1 : -1;
      const dated = visible.filter((task) => task.dueDate);
      const undated = visible.filter((task) => !task.dueDate);

      dated.sort((a, b) => direction * a.dueDate.localeCompare(b.dueDate));
      visible = [...dated, ...undated];
    }

    return visible;
  }

  function render(tasks) {
    taskList.render(getVisibleTasks(tasks), tasks, {
      reorderable: view.sort === 'manual',
    });
    hero.update({
      total: tasks.length,
      completed: tasks.filter((task) => task.completed).length,
    });
    footer.update(tasks);
  }

  function setFilter(filter) {
    if (view.filter === filter) {
      return;
    }

    view.filter = filter;

    for (const [value, button] of taskList.toolbar.filterButtons) {
      const isActive = value === filter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    }

    render(getTasks());
    announce(
      filter === 'active'
        ? 'Показаны активные задачи'
        : filter === 'completed'
          ? 'Показаны выполненные задачи'
          : 'Показаны все задачи',
    );
  }

  for (const [value, button] of taskList.toolbar.filterButtons) {
    button.addEventListener('click', () => {
      setFilter(value);
    });
  }

  taskList.toolbar.searchInput.addEventListener('input', () => {
    view.query = taskList.toolbar.searchInput.value;
    taskList.toolbar.searchClear.hidden = view.query.length === 0;
    render(getTasks());
  });

  taskList.toolbar.searchClear.addEventListener('click', () => {
    taskList.toolbar.searchInput.value = '';
    view.query = '';
    taskList.toolbar.searchClear.hidden = true;
    taskList.toolbar.searchInput.focus();
    render(getTasks());
  });

  taskList.toolbar.sortSelect.addEventListener('change', () => {
    view.sort = taskList.toolbar.sortSelect.value;
    render(getTasks());
    announce(
      `Сортировка: ${taskList.toolbar.sortSelect.selectedOptions[0].textContent.toLocaleLowerCase('ru')}`,
    );
  });

  taskList.emptyAction.addEventListener('click', () => {
    composer.titleInput.focus();
  });

  taskList.clearButton.addEventListener('click', () => {
    const removed = removeCompletedTasks();
    if (removed.length === 0) {
      return;
    }

    toast.show({
      message: `Удалено ${removed.length} ${pluralize(removed.length, ['выполненная задача', 'выполненные задачи', 'выполненных задач'])}`,
      actionLabel: 'Отменить',
      onAction() {
        restoreTasks(removed);
        toast.show({ message: 'Задачи восстановлены' });
      },
    });
  });

  subscribe(render);
  render(getTasks());

  return {
    element,
    header,
    hero,
    composer,
    tasks: taskList,
    footer,
    main,
    toastRegion,
    liveRegion,
  };
}
