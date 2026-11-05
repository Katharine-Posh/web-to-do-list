let tasks = [];
const listeners = new Set();

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function notify() {
  for (const listener of listeners) {
    listener(tasks);
  }
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
    title: title.trim(),
    dueDate: dueDate || null,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks = [...tasks, task];
  notify();
  return task;
}

export function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  );
  notify();
}
