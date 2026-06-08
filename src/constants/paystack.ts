/** Paystack channels enabled for Nigerian checkout (must match API + web). */
export const PAYSTACK_NGN_CHANNELS = [
  'card',
  'bank',
  'ussd',
  'qr',
  'bank_transfer',
] as const;
