import type { Invoice, SubscriptionCreationRequest } from '../types';
import { tryCatch } from '../utils/error.utils';

import { clientApi } from './client';

const BASE_PATH = '/invoices/';

export const persistInvoiceCreation = async (
  payload: SubscriptionCreationRequest,
) => {
  const { error, data } = await tryCatch<Invoice>(
    clientApi.post(BASE_PATH, payload),
  );
  return {
    invoice: data,
    error,
  };
};
