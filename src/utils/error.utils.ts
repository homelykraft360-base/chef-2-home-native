import type { AxiosError } from 'axios';

import type { Nullable } from '../types';

export type Result<T, E> = {
  success: boolean;
  data: T | null;
  error: Nullable<string | E>;
};

type DetailObject = {
  loc: Array<string>;
  msg: string;
  type: string;
};

export async function tryCatch<T, E = string>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const response = (await promise) as T;
    return { success: true, data: response, error: null };
  } catch (err) {
    if (err && typeof err === 'object' && 'message' in err) {
      return { success: true, data: null, error: `${(err as Error).message}` };
    }
    return { success: true, data: null, error: err as E };
  }
}

export function getErrorMessage(error: AxiosError | string): string {
  if (typeof error === 'string') return error;
  if (error?.response?.data) {
    const { detail } = error.response.data as {
      detail?: string | Array<DetailObject>;
    };
    if (detail) {
      return Array.isArray(detail)
        ? `${detail[0].msg} - ${detail[0].loc[0]}`
        : detail;
    }
  }
  return error?.message ?? 'Something went wrong';
}
