const STORAGE_KEY = 'to-do-list.tasks';
const STORAGE_VERSION = 1;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const listeners = new Set();

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isValidIsoDate(value) {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function sanitizeTask(value) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const title = typeof value.title === 'string' ? value.title.trim().slice(0, 140) : '';
  if (!title) {
    return null;
  }

  const dueDate =
    typeof value.dueDate === 'string' && isValidIsoDate(value.dueDate)
      ? value.dueDate
      : null;

  return {
    id: typeof value.id === 'string' && value.id ? value.id : createId(),
    title,
    dueDate,
    completed: value.completed === true,
    createdAt:
      typeof value.createdAt === 'string' && !Number.isNaN(Date.parse(value.createdAt))
        ? value.createdAt
        : new Date().toISOString(),
  };
}

function sanitizeTasks(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenIds = new Set();

  return value
    .map(sanitizeTask)
    .filter(Boolean)
    .map((task) => {
      if (seenIds.has(task.id)) {
        return { ...task, id: createId() };
      }

      seenIds.add(task.id);
      return task;
    });
}

function loadTasks() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return sanitizeTasks(Array.isArray(parsed) ? parsed : parsed?.tasks);
  } catch (error) {
    console.warn('Не удалось прочитать сохранённые задачи', error);
    return [];
  }
}

function saveTasks() {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, tasks }),
    );
  } catch (error) {
    console.warn('Не удалось сохранить задачи', error);
  }
}

let tasks = loadTasks();

function notify() {
  for (const listener of listeners) {
    listener(tasks);
  }
}

function commit() {
  saveTasks();
  notify();
}

export function getTasks() {
  return tasks;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addTask({ title, dueDate = null }) {
  const task = {
    id: createId(),
    title: title.trim().slice(0, 140),
    dueDate: dueDate || null,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks = [...tasks, task];
  commit();
  return task;
}

export function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  );
  commit();
}

export function removeTask(id) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    return null;
  }

  const removed = { task: tasks[index], index };
  tasks = tasks.filter((task) => task.id !== id);
  commit();
  return removed;
}

export function removeCompletedTasks() {
  const removed = [];

  tasks.forEach((task, index) => {
    if (task.completed) {
      removed.push({ task, index });
    }
  });

  if (removed.length === 0) {
    return [];
  }

  tasks = tasks.filter((task) => !task.completed);
  commit();
  return removed;
}

export function restoreTasks(entries = []) {
  if (entries.length === 0) {
    return;
  }

  const next = [...tasks];

  for (const { task, index } of [...entries].sort((a, b) => a.index - b.index)) {
    if (next.some((item) => item.id === task.id)) {
      continue;
    }

    next.splice(Math.min(index, next.length), 0, task);
  }

  tasks = next;
  commit();
}

export function moveTask(draggedId, targetId, { after = false } = {}) {
  if (draggedId === targetId) {
    return false;
  }

  const draggedTask = tasks.find((task) => task.id === draggedId);
  if (!draggedTask) {
    return false;
  }

  const rest = tasks.filter((task) => task.id !== draggedId);
  const targetIndex = rest.findIndex((task) => task.id === targetId);
  if (targetIndex === -1) {
    return false;
  }

  const next = [...rest];
  next.splice(targetIndex + (after ? 1 : 0), 0, draggedTask);

  if (next.every((task, index) => task.id === tasks[index].id)) {
    return false;
  }

  tasks = next;
  commit();
  return true;
}

export function updateTask(id, { title, dueDate = null }) {
  const nextTitle = title.trim().slice(0, 140);
  if (!nextTitle) {
    return null;
  }

  let updated = null;

  tasks = tasks.map((task) => {
    if (task.id !== id) {
      return task;
    }

    updated = {
      ...task,
      title: nextTitle,
      dueDate:
        typeof dueDate === 'string' && isValidIsoDate(dueDate) ? dueDate : null,
    };

    return updated;
  });

  if (updated) {
    commit();
  }

  return updated;
}

window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) {
    return;
  }

  tasks = event.newValue === null ? [] : loadTasks();
  notify();
});
