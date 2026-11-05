import { el } from '../dom.js';

export function createToastController(region) {
  let timer = null;

  function hide() {
    if (timer) {
      window.clearTimeout(timer);
      timer = null;
    }
    region.replaceChildren();
  }

  function show({ message, actionLabel, onAction, duration = 6000 } = {}) {
    hide();

    const content = el('p', { className: 'toast__message', text: message });
    const children = [content];

    if (actionLabel && typeof onAction === 'function') {
      const action = el('button', {
        className: 'toast__action',
        type: 'button',
        text: actionLabel,
      });

      action.addEventListener('click', () => {
        hide();
        onAction();
      });

      children.push(action);
    }

    region.append(el('div', { className: 'toast' }, children));
    timer = window.setTimeout(hide, duration);
  }

  return { show, hide };
}
