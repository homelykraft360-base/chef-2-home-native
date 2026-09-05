export type LagosLocation = 'lagos-all' | 'lagos-island' | 'lagos-mainland';

export type LocalAreaOption = {
  label: string;
  value: string;
};

export const LAGOS_ISLAND_LOCAL_AREAS: LocalAreaOption[] = [
  { label: 'Victoria Island (VI)', value: 'victoria-island' },
  { label: 'Ikoyi', value: 'ikoyi' },
  { label: 'Lekki Phase 1', value: 'lekki-phase-1' },
  { label: 'Lekki Phase 2', value: 'lekki-phase-2' },
  { label: 'Ajah', value: 'ajah' },
  { label: 'Sangotedo', value: 'sangotedo' },
  { label: 'Chevron', value: 'chevron' },
  { label: 'Oniru', value: 'oniru' },
  { label: 'Osborne', value: 'osborne' },
  { label: 'Banana Island', value: 'banana-island' },
  { label: 'Parkview Estate', value: 'parkview-estate' },
  { label: 'Ikate', value: 'ikate' },
  { label: 'VGC', value: 'vgc' },
];

export const LAGOS_MAINLAND_LOCAL_AREAS: LocalAreaOption[] = [
  { label: 'Ikeja', value: 'ikeja' },
  { label: 'Yaba', value: 'yaba' },
  { label: 'Surulere', value: 'surulere' },
  { label: 'Maryland', value: 'maryland' },
  { label: 'Gbagada', value: 'gbagada' },
  { label: 'Ogudu', value: 'ogudu' },
  { label: 'Anthony Village', value: 'anthony-village' },
  { label: 'Magodo', value: 'magodo' },
  { label: 'Ojota', value: 'ojota' },
  { label: 'Ketu', value: 'ketu' },
  { label: 'Mile 12', value: 'mile-12' },
  { label: 'Festac', value: 'festac' },
  { label: 'Apapa', value: 'apapa' },
  { label: 'Oshodi', value: 'oshodi' },
  { label: 'Alimosho', value: 'alimosho' },
  { label: 'Egbeda', value: 'egbeda' },
];

export const ALL_LAGOS_LOCAL_AREAS: LocalAreaOption[] = [
  ...LAGOS_ISLAND_LOCAL_AREAS,
  ...LAGOS_MAINLAND_LOCAL_AREAS,
];

export function localAreasForVisitLocation(
  visitLocation: LagosLocation | '',
): LocalAreaOption[] {
  if (visitLocation === 'lagos-all') return ALL_LAGOS_LOCAL_AREAS;
  if (visitLocation === 'lagos-island') return LAGOS_ISLAND_LOCAL_AREAS;
  if (visitLocation === 'lagos-mainland') return LAGOS_MAINLAND_LOCAL_AREAS;
  return [];
}

export function localAreaLabel(
  visitLocation: LagosLocation | '',
  localArea: string,
): string {
  const areas =
    visitLocation === 'lagos-all'
      ? ALL_LAGOS_LOCAL_AREAS
      : localAreasForVisitLocation(visitLocation);
  const match = areas.find((opt) => opt.value === localArea);
  return match?.label ?? localArea;
}

export const LAGOS_AREA_OPTIONS: Array<{ label: string; value: LagosLocation }> = [
  { label: 'All', value: 'lagos-all' },
  { label: 'Lagos Island', value: 'lagos-island' },
  { label: 'Lagos Mainland', value: 'lagos-mainland' },
];

export function householdMemberAreaOptions(
  payerVisitLocation: LagosLocation | '' | null | undefined,
): LagosLocation[] {
  const payer = payerVisitLocation ?? '';
  if (payer === 'lagos-island') return ['lagos-island'];
  if (payer === 'lagos-mainland') return ['lagos-mainland'];
  return ['lagos-all', 'lagos-island', 'lagos-mainland'];
}
