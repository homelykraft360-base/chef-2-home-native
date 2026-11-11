import type { SubscriptionPlan } from '../types';

const ALL_DAYS = [1, 2, 3, 4, 5] as const;

export function normalizeEnabledDaysPerWeek(
  raw: number[] | null | undefined,
): number[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [...ALL_DAYS];
  }
  const seen = new Set<number>();
  const out: number[] = [];
  for (const item of raw) {
    const day = Number(item);
    if (!Number.isInteger(day) || day < 1 || day > 5 || seen.has(day)) continue;
    seen.add(day);
    out.push(day);
  }
  return out.length > 0 ? out.sort((a, b) => a - b) : [...ALL_DAYS];
}

export function getEnabledDaysPerWeek(
  plan: SubscriptionPlan | null | undefined,
): number[] {
  return normalizeEnabledDaysPerWeek(plan?.enabledDaysPerWeek);
}

export function getPlanWeeklyVisitCap(
  plan: SubscriptionPlan | null | undefined,
): number {
  if (!plan) return 0;
  const enabled = getEnabledDaysPerWeek(plan);
  return enabled[enabled.length - 1] ?? 5;
}

export function clampWeeklySessions(
  plan: SubscriptionPlan | null | undefined,
  current: number,
): number {
  const enabled = getEnabledDaysPerWeek(plan);
  const n = Number(current);
  if (!Number.isFinite(n)) return enabled[0];
  const floored = Math.floor(n);
  if (enabled.includes(floored)) return floored;
  const le = [...enabled].reverse().find((d) => d <= floored);
  return le ?? enabled[0];
}

export function stepWeeklySessions(
  plan: SubscriptionPlan | null | undefined,
  current: number,
  delta: 1 | -1,
): number {
  const enabled = getEnabledDaysPerWeek(plan);
  const clamped = clampWeeklySessions(plan, current);
  const idx = enabled.indexOf(clamped);
  if (idx < 0) return enabled[0];
  const next = idx + delta;
  if (next < 0) return enabled[0];
  if (next >= enabled.length) return enabled[enabled.length - 1];
  return enabled[next];
}

export function getWeeklySessionsHint(
  plan: SubscriptionPlan | null | undefined,
): string {
  const enabled = getEnabledDaysPerWeek(plan);
  const contiguousFromOne =
    enabled[0] === 1 && enabled.every((d, i) => d === i + 1);
  if (contiguousFromOne) {
    return `Up to ${enabled[enabled.length - 1]} per week`;
  }
  return `Available: ${enabled.join(', ')} days/week`;
}

export function getPlanSummaryPeriodDays(): number {
  return 30;
}
