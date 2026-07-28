/** Check whether two Date objects fall on the same calendar day. */
export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Returns true if `date` is today. */
export const isToday = (date: Date): boolean => isSameDay(date, new Date());

/** Shift a date by `n` days (positive = forward). */
export const addDays = (date: Date, n: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

/** Start of calendar day. */
export const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/** End of calendar day. */
export const endOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/** Format a Date as "9:00 AM". */
export const formatTime = (date: Date): string =>
  date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

/** Format a Date as "Sat, 12 Jul". */
export const formatDateShort = (date: Date): string =>
  date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

/** Format a Date as "Saturday, 12 July 2026". */
export const formatDateLong = (date: Date): string =>
  date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

/** ISO date key YYYY-MM-DD for Firestore queries. */
export const toDateKey = (date: Date): string => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Monday of the week containing `date`. */
export const startOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Sunday end of the week containing `date`. */
export const endOfWeek = (date: Date): Date => {
  const start = startOfWeek(date);
  const end = addDays(start, 6);
  return endOfDay(end);
};
