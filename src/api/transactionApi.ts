import type { Nullable } from '../types';
import { tryCatch } from '../utils/error.utils';

import { clientApi } from './client';

export interface TransactionVerifyResult {
  status: string;
  message: string;
  invoiceId: number;
  reference: string;
  paid: boolean;
  paidAt?: string | null;
}

export const verifyTransaction = async (reference: string) => {
  const { error, data } = await tryCatch<TransactionVerifyResult>(
    clientApi.get(`/transactions/verify/${reference}`),
  );

  return {
    result: data as Nullable<TransactionVerifyResult>,
    error,
  };
};
