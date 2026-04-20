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

export const timeOptionsWithLabels: { label: string; value: string }[] = [
  { label: 'Select time', value: '' },
  { label: 'Morning (8am - 9am)', value: 'morning' },
  { label: 'Afternoon (2pm - 3pm)', value: 'afternoon' },
];

export const planColorScheme = ['#6aa301', '#D97602', '#7c3aed'] as const;
