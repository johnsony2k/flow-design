const APP_STORAGE_KEY = 'flow-weight-entries-v1';
const TARGET_STORAGE_KEY = 'flow-weight-target-v1';
const UNIT_STORAGE_KEY = 'flow-weight-unit-v1';

const formatDateForInput = (date = new Date()) => {
  const d = new Date(date);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
};

const toKg = (pounds) => pounds * 0.45359237;
const fromKg = (kg) => kg / 0.45359237;

const safeLocalStorageRead = (key, fallback) => {
  try {
    const item = window.localStorage.getItem(key);
    return item === null ? fallback : item;
  } catch {
    return fallback;
  }
};

export const loadEntries = () => {
  try {
    const raw = window.localStorage.getItem(APP_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveEntries = (entries) => {
  window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(entries));
};

export const loadTargetWeight = () => {
  const value = Number(safeLocalStorageRead(TARGET_STORAGE_KEY, '150'));
  return Number.isFinite(value) ? value : 150;
};

export const saveTargetWeight = (value) => {
  window.localStorage.setItem(TARGET_STORAGE_KEY, String(value));
};

export const loadUnit = () => safeLocalStorageRead(UNIT_STORAGE_KEY, 'lb');
export const saveUnit = (value) => window.localStorage.setItem(UNIT_STORAGE_KEY, value);

export const isValidEntry = (entry) => {
  if (!entry || !entry.date || !Number.isFinite(Number(entry.weight))) {
    return false;
  }
  return true;
};

export const formatWeight = (value, unit = 'lb') => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '0 lb';

  if (unit === 'kg') {
    return `${toKg(numericValue).toFixed(1)} kg`;
  }

  return `${numericValue.toFixed(1)} lb`;
};

export const convertWeightForDisplay = (value, unit) => {
  if (unit === 'kg') {
    return toKg(Number(value));
  }
  return Number(value);
};

export const convertWeightForStorage = (value, unit) => {
  if (unit === 'kg') {
    return fromKg(Number(value));
  }
  return Number(value);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const getChartPoints = (entries, unit = 'lb') => {
  if (!entries.length) return [];

  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const values = sorted.map((entry) => convertWeightForDisplay(entry.weight, unit));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return sorted.map((entry, index) => {
    const x = (index / Math.max(sorted.length - 1, 1)) * 100;
    const y = 100 - ((convertWeightForDisplay(entry.weight, unit) - min) / range) * 100;
    return { ...entry, x, y };
  });
};

export { formatDateForInput };
