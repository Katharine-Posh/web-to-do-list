import { el } from './dom.js';
import { createAppHeader } from './components/app-header.js';
import { createHero } from './components/hero.js';
import { createComposer } from './components/composer.js';
import { createTaskList } from './components/task-list.js';
import { createAppFooter } from './components/app-footer.js';
import { addTask, getTasks, subscribe, toggleTask } from './store.js';

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

  function announce(message) {
    liveRegion.textContent = message;
  }

  function render(tasks) {
    taskList.render(tasks);
    hero.update({
      total: tasks.length,
      completed: tasks.filter((task) => task.completed).length,
    });
    footer.update(tasks);
  }

  taskList.emptyAction.addEventListener('click', () => {
    composer.titleInput.focus();
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
