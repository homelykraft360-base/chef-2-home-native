/**
 * Week anchoring and cutoff rules for weekly meal plans.
 * Weeks start on Sunday. Mirrors the API's week.py logic so the UI can show
 * locked days without a round-trip.
 */
import type { DayOfWeek } from '../types';

const DAY_INDEX: Record<DayOfWeek, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const VISIT_TIME_HOURS: Record<string, number> = {
  morning: 8,
  afternoon: 14,
  evening: 18,
};
const DEFAULT_VISIT_HOUR = 8;

const MONDAY_CUTOFF_HOURS = 8;
const OTHER_CUTOFF_HOURS = 24;

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function sundayOf(reference: Date = new Date()): string {
  const d = new Date(reference);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return formatDate(d);
}

export const currentWeekStart = () => sundayOf();

export function addWeeks(weekStart: string, weeks: number): string {
  const d = parseWeekStart(weekStart);
  d.setDate(d.getDate() + weeks * 7);
  return formatDate(d);
}

export function parseWeekStart(weekStart: string): Date {
  const [y, m, day] = weekStart.split('-').map(Number);
  return new Date(y, m - 1, day);
}

export function weekRangeLabel(weekStart: string): string {
  const start = parseWeekStart(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (x: Date) =>
    x.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function visitDateTime(
  weekStart: string,
  day: DayOfWeek,
  timeOfDay: string,
): Date {
  const d = parseWeekStart(weekStart);
  d.setDate(d.getDate() + DAY_INDEX[day]);
  const hour = VISIT_TIME_HOURS[timeOfDay?.toLowerCase()] ?? DEFAULT_VISIT_HOUR;
  d.setHours(hour, 0, 0, 0);
  return d;
}

export function cutoffFor(
  weekStart: string,
  day: DayOfWeek,
  timeOfDay: string,
): Date {
  const visit = visitDateTime(weekStart, day, timeOfDay);
  const hours = day === 'monday' ? MONDAY_CUTOFF_HOURS : OTHER_CUTOFF_HOURS;
  const cutoff = new Date(visit);
  cutoff.setHours(cutoff.getHours() - hours);
  return cutoff;
}

export function isCutoffPassed(
  weekStart: string,
  day: DayOfWeek,
  timeOfDay: string,
  now: Date = new Date(),
): boolean {
  return now >= cutoffFor(weekStart, day, timeOfDay);
}

function sundayBeforeOrOn(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() - out.getDay());
  return out;
}

/** Sunday-starting weeks that fall within the subscription's active period.
 * Starts at max(today, subscription start) and ends at the last Sunday whose
 * week overlaps the subscription's end. */
export function weekOptionsForSubscription(
  startIso: string | null | undefined,
  endIso: string | null | undefined,
): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const periodStart = startIso ? new Date(startIso) : today;
  const periodEnd = endIso ? new Date(endIso) : null;
  if (!periodEnd || periodEnd < today) return [];

  const firstSunday = sundayBeforeOrOn(
    periodStart > today ? periodStart : today,
  );
  const lastSunday = sundayBeforeOrOn(periodEnd);

  const weeks: string[] = [];
  const cursor = new Date(firstSunday);
  while (cursor <= lastSunday) {
    weeks.push(formatDate(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }
  return weeks;
}
