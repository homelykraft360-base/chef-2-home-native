import type {
  AuthResponse,
  MessageResponse,
  OTPResponse,
  SignInRequest,
  SignUpRequest,
  User,
  VerifyOTPRequest,
} from '../types';
import { tryCatch } from '../utils/error.utils';

import { clientApi } from './client';

/** Normalize API auth response (snake_case) to app shape (camelCase) */
function normalizeAuthResponse(raw: {
  access_token?: string;
  accessToken?: string;
  refresh_token?: string;
  user?: Record<string, unknown>;
}): AuthResponse {
  const user = raw.user as Record<string, unknown> | undefined;
  const normalizedUser: User | undefined = user
    ? {
        id: user.id as number,
        email: (user.email as string) ?? '',
        phoneNumber: (user.phone_number as string) ?? '',
        firstName: (user.first_name as string) ?? '',
        lastName: (user.last_name as string) ?? '',
        platformType: (user.platform_type as string) ?? '',
        imageUrl: (user.image_url as string) ?? '',
        isActive: (user.is_active as boolean) ?? true,
        isDisabled: false,
        isEmailVerified: (user.is_email_verified as boolean) ?? false,
        isPhoneNumberVerified: (user.is_phone_number_verified as boolean) ?? false,
        role: (user.role as string) ?? 'customer',
        createdAt: (user.created_at as Date) ?? new Date(),
        updatedAt: (user.updated_at as Date) ?? new Date(),
        address: (user.address as User['address']) ?? {
          streetAddress1: '',
          streetAddress2: '',
          city: '',
          state: '',
          country: '',
        },
      }
    : undefined;
  return {
    accessToken: raw.access_token ?? raw.accessToken ?? undefined,
    user: normalizedUser ?? undefined,
    error: null,
  };
}

export const login = async (request: SignInRequest): Promise<OTPResponse> => {
  const { data, error } = await tryCatch<MessageResponse>(
    clientApi.post('/auth/login', request),
  );
  return {
    message: data?.message,
    ref: data?.data?.ref ?? '',
    error,
  };
};

export const signOut = async (): Promise<MessageResponse> => {
  const { data, error } = await tryCatch<MessageResponse>(
    clientApi.post('/auth/logout'),
  );
  return {
    message: data?.message,
    error,
  };
};

export const resendCode = async (
  request: SignInRequest | SignUpRequest,
): Promise<OTPResponse> => {
  const { data, error } = await tryCatch<MessageResponse>(
    clientApi.post('/auth/resend-otp', request),
  );
  return {
    message: data?.message,
    ref: data?.data?.ref ?? '',
    error,
  };
};

export const signUp = async (request: SignUpRequest): Promise<OTPResponse> => {
  const { data, error } = await tryCatch<MessageResponse>(
    clientApi.post('/auth/create-account', request),
  );
  return {
    message: data?.message,
    ref: data?.data?.ref ?? '',
    error,
  };
};

export const verifyOTP = async (
  payload: VerifyOTPRequest,
): Promise<AuthResponse> => {
  const { data, error } = await tryCatch<Record<string, unknown>>(
    clientApi.post('/auth/verify-otp', payload),
  );
  if (error || !data) return { accessToken: undefined, user: undefined, error: error ?? 'No response' };
  const normalized = normalizeAuthResponse(
    data as Parameters<typeof normalizeAuthResponse>[0],
  );
  return normalized;
};

export const signInWithGoogle = async (
  idToken: string,
): Promise<AuthResponse> => {
  const { data, error } = await tryCatch<Record<string, unknown>>(
    clientApi.post('/auth/google', { id_token: idToken }),
  );
  if (error || !data) return { accessToken: undefined, user: undefined, error: error ?? 'No response' };
  const normalized = normalizeAuthResponse(
    data as Parameters<typeof normalizeAuthResponse>[0],
  );
  return normalized;
};

export const signInWithApple = async (
  identityToken: string,
  firstName?: string | null,
  lastName?: string | null,
): Promise<AuthResponse> => {
  const { data, error } = await tryCatch<Record<string, unknown>>(
    clientApi.post('/auth/apple', {
      id_token: identityToken,
      first_name: firstName ?? undefined,
      last_name: lastName ?? undefined,
    }),
  );
  if (error || !data) return { accessToken: undefined, user: undefined, error: error ?? 'No response' };
  const normalized = normalizeAuthResponse(
    data as Parameters<typeof normalizeAuthResponse>[0],
  );
  return normalized;
};
