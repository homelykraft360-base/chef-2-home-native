import type { User } from '../types';

/** True when phone or delivery address is missing for subscription checkout. */
export function userNeedsContactDetails(user?: User | null): boolean {
  if (!user) return true;
  const phoneDigits = (user.phoneNumber ?? '').replace(/\D/g, '');
  if (phoneDigits.length < 10) return true;
  if (!user.address?.streetAddress1?.trim()) return true;
  if (!user.address?.city?.trim()) return true;
  return false;
}
