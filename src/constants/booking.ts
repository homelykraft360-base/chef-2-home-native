/** Lagos visit fee (₦ major units). Monthly = visits/week × rate × weeks. */
export const LAGOS_ISLAND_PER_VISIT_NAIRA = 8_000;
export const LAGOS_MAINLAND_PER_VISIT_NAIRA = 6_000;
export const WEEKLY_VISIT_MONTHLY_WEEKS = 4;

export const dayOptions = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export const VISIT_TIME_MORNING_RANGE = '8am - 12 Noon';
export const VISIT_TIME_AFTERNOON_RANGE = '1pm - 6pm';

export function visitTimeSlotRange(value: string): string {
  if (value === 'morning') return VISIT_TIME_MORNING_RANGE;
  if (value === 'afternoon') return VISIT_TIME_AFTERNOON_RANGE;
  return '--';
}

export function visitTimeSlotLabel(value: string): string {
  const range = visitTimeSlotRange(value);
  if (range === '--') return range;
  const name = value === 'morning' ? 'Morning' : 'Afternoon';
  return `${name} (${range})`;
}

export const timeOptionsWithLabels: { label: string; value: string }[] = [
  { label: 'Select time', value: '' },
  { label: visitTimeSlotLabel('morning'), value: 'morning' },
  { label: visitTimeSlotLabel('afternoon'), value: 'afternoon' },
];

export const planColorScheme = ['#6aa301', '#D97602', '#7c3aed'] as const;
