import dayjs from 'dayjs';

export const formatDate = (date?: string | Date) => {
  if (!date) return '--';
  return dayjs(date).format('MMMM D, YYYY');
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
