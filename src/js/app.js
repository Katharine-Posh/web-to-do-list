import { el } from './dom.js';
import { createAppHeader } from './components/app-header.js';
import { createHero } from './components/hero.js';
import { createComposer } from './components/composer.js';
import { createTaskList } from './components/task-list.js';
import { createAppFooter } from './components/app-footer.js';

export function createApp() {
  const header = createAppHeader();
  const hero = createHero();
  const composer = createComposer();
  const tasks = createTaskList();
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
    tasks.element,
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

  return {
    element,
    header,
    hero,
    composer,
    tasks,
    footer,
    main,
    toastRegion,
    liveRegion,
  };
}
