const headerDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const shortDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

const fullDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const DAY_MS = 24 * 60 * 60 * 1000;

export function toIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getHeaderDate(date = new Date()) {
  const value = headerDateFormatter.format(date);
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function parseIsoDate(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDayDifference(from, to) {
  return Math.round((startOfDay(to) - startOfDay(from)) / DAY_MS);
}

export function isOverdue(value) {
  const date = parseIsoDate(value);
  if (!date) {
    return false;
  }

  return getDayDifference(new Date(), date) < 0;
}

export function formatDueDate(value) {
  const date = parseIsoDate(value);
  if (!date) {
    return 'Без срока';
  }

  const difference = getDayDifference(new Date(), date);

  if (difference === 0) {
    return 'Сегодня';
  }

  if (difference === 1) {
    return 'Завтра';
  }

  if (difference === -1) {
    return 'Вчера';
  }

  if (date.getFullYear() === new Date().getFullYear()) {
    return shortDateFormatter.format(date).replace(/\.$/, '');
  }

  return fullDateFormatter.format(date);
}

export function formatFullDate(value) {
  const date = parseIsoDate(value);
  return date ? fullDateFormatter.format(date) : 'Без срока';
}
