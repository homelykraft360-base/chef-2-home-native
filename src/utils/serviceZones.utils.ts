import type { LagosLocation, ServiceZone } from '../types';

export type ZoneOption = { label: string; value: LagosLocation };
export type LocalAreaOption = { label: string; value: string };

export function zoneBySlug(
  zones: ServiceZone[],
  slug: string | null | undefined,
): ServiceZone | undefined {
  if (!slug) return undefined;
  return zones.find((zone) => zone.slug === slug);
}

/** Zone options in API order (All Lagos first). */
export function zoneOptions(zones: ServiceZone[]): ZoneOption[] {
  return zones.map((zone) => ({ label: zone.name, value: zone.slug }));
}

/** Area / LGA options for a zone. lagos-all already carries every active area. */
export function localAreasForZone(
  zones: ServiceZone[],
  slug: string | null | undefined,
): LocalAreaOption[] {
  const zone = zoneBySlug(zones, slug);
  if (!zone) return [];
  return zone.areas.map((area) => ({ label: area.name, value: area.slug }));
}

export function localAreaLabel(
  zones: ServiceZone[],
  slug: string | null | undefined,
  areaSlug: string | null | undefined,
): string {
  if (!areaSlug) return '';
  const inZone = zoneBySlug(zones, slug)?.areas.find((a) => a.slug === areaSlug);
  if (inZone) return inZone.name;
  for (const zone of zones) {
    const match = zone.areas.find((a) => a.slug === areaSlug);
    if (match) return match.name;
  }
  return areaSlug;
}

export function zoneLabel(
  zones: ServiceZone[],
  slug: string | null | undefined,
): string {
  if (!slug) return '--';
  return zoneBySlug(zones, slug)?.name ?? slug;
}

/** Per-visit fee in naira; 0 for blank or unknown zones. */
export function perVisitFeeForZone(
  zones: ServiceZone[],
  slug: string | null | undefined,
): number {
  return zoneBySlug(zones, slug)?.perVisitFeeNaira ?? 0;
}

/**
 * Zone choices for a household member joining with their own address.
 * Payer blank or All Lagos: any zone. Otherwise only the payer's zone.
 */
export function householdMemberAreaOptions(
  zones: ServiceZone[],
  payerVisitLocation: string | null | undefined,
): ZoneOption[] {
  const all = zoneOptions(zones);
  const payer = payerVisitLocation ?? '';
  if (!payer || payer === 'lagos-all') return all;
  return all.filter((option) => option.value === payer);
}
