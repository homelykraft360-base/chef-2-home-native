import dayjs from 'dayjs';

import type { Address } from '../types';

export const formatAddress = (address?: Address) => {
  if (!address || !address.streetAddress1) return '--';
  return [
    address.streetAddress1,
    address.streetAddress2,
    address.city,
    address.state,
    address.country,
  ]
    .filter((x) => !!x)
    .join(', ');
};

export const formatDate = (date?: string | Date) => {
  if (!date) return '--';
  return dayjs(date).format('MMMM D, YYYY');
};

/** e.g. "14th September, 2025" for payment history rows. */
export const formatDateOrdinal = (date?: string | Date | null) => {
  if (!date) return '--';
  const d = dayjs(date);
  if (!d.isValid()) return '--';
  const dayNum = d.date();
  const j = dayNum % 10;
  const k = dayNum % 100;
  let suffix = 'th';
  if (j === 1 && k !== 11) suffix = 'st';
  else if (j === 2 && k !== 12) suffix = 'nd';
  else if (j === 3 && k !== 13) suffix = 'rd';
  return `${dayNum}${suffix} ${d.format('MMMM, YYYY')}`;
};

export const formatPhoneNumber = (phone?: string) => {
  if (!phone) return '--';
  return `+234 ${phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}`;
};

export const getInitials = (firstName?: string, lastName?: string) => {
  if (!firstName) return '--';
  return lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`
    : firstName.charAt(0);
};

export const formatToReadableNumber = (
  value: number | string,
  fraction = true,
): string => {
  if (value === undefined || value === null) return '--';
  const valueAsNumber = typeof value === 'string' ? parseFloat(value) : value;
  return Intl.NumberFormat('en-NG', {
    maximumFractionDigits: fraction ? 2 : 0,
  }).format(valueAsNumber);
};

export const formatToMoney = (
  value: number | string,
  fraction = true,
): string => {
  if (value === undefined || value === null) return '--';
  const valueAsNumber = typeof value === 'string' ? parseFloat(value) : value;
  return Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: fraction ? 2 : 0,
    maximumFractionDigits: fraction ? 2 : 0,
  }).format(valueAsNumber);
};
