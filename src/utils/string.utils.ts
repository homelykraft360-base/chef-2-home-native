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
