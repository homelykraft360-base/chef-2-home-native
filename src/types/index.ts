import type { AxiosError } from 'axios';

export const noop = () => {};

export type Nullable<T> = null | T;

export type ApiError = {
  error: AxiosError;
  message?: string;
};

export type GenericAPICallbackProps<T, K = string> = {
  payload: T;
  onError?: (error: string) => void;
  onSuccess?: (response?: K) => void;
};

export type GenericAPICallbackWithoutPayloadProps<K = string> = {
  onError?: (error: string) => void;
  onSuccess?: (response?: K) => void;
};

export type CategoryType = 'main' | 'starter' | 'side' | 'protein' | 'swallow';
export type ChefTierType = 'tier 1' | 'tier 2' | 'tier 3' | 'luxury';
export type InvoiceStatus = 'canceled' | 'paid' | 'pending' | 'failed';
export type StatusType = 'active' | 'inactive' | 'pending';
export type SortByType = 'asc' | 'desc';
export type RoleType = 'admin' | 'super_admin' | 'operations' | 'customer';
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'deactivated'
  | 'paused'
  | 'pending';

export interface GenericResponse {
  error?: Nullable<string>;
}

export interface Address {
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  state: string;
  country: string;
}

export interface Chef {
  id: number;
  name: string;
  bio: string;
  bookedDaysAndTime: string;
  phoneNumber: string;
  specialities: string;
  careerStartYear: string;
  tier: string;
  isArchived: string;
  isAvailable: string;
  imageId?: string;
  imageUrl?: string;
}

export interface Menu {
  id: number;
  chef_id: number;
  meal_id: number;
  chefs: Chef[];
  meals: Meal[];
}

export interface Invoice {
  id: number;
  subscriptionId?: number;
  planId?: string;
  chefId?: number;
  userId?: number;
  transactionRef: string;
  platformType: string;
  currency?: string;
  channel?: string;
  amount: number;
  status: InvoiceStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** GET /invoices/history — rows with plan label for payment history UI. */
export interface InvoiceHistoryItem extends Invoice {
  planName?: string | null;
}

export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  unitLabel: string;
  cost: string;
  description: string;
  quantity: number;
  isAvailable: boolean;
  isArchived: boolean;
  imageUrl?: string;
}

export type LagosLocation = 'lagos-island' | 'lagos-mainland';

export interface LogisticsProps {
  location: LagosLocation | '';
  weeklySessionsCount: number;
  selectedDays: string[];
  confirmKitchen: boolean;
  selectedDayAndTime: Record<string, string>;
  preference?: 'cook-in' | 'delivery';
}

export interface Meal {
  id: number;
  name: string;
  description: string;
  category: string;
  isAvailable: boolean;
  isArchived: boolean;
  tags: string;
  imageId?: string;
  imageUrl?: string;
  ingredients: Ingredient[];
  checked?: boolean;
}

export interface Preference {
  id: number;
  allergies?: string;
  cookingPreferences?: string;
  additionalNotes?: string;
  dietaryRestrictions?: string;
  emailNotifications: boolean;
  updatedAt: string;
}

export interface PreferenceProps {
  allergies?: string;
  cookingPreferences?: string;
  dietaryRestrictions?: string;
  additionalNotes?: string;
}

export interface Recipe {
  id: number;
  mealId: number;
  quantity: number;
  ingredient: Ingredient;
}

export interface Subscription {
  id: number;
  subscriptionPlanId: number;
  userId: number;
  status: SubscriptionStatus;
  lastPaid: string;
  expiresAt: string;
  procureIngredients: boolean;
  delivery: boolean;
  autoRenewal: boolean;
  weeklySessions?: number;
  subscriptionPlan: SubscriptionPlan;
  allergies?: string;
  cookingPreferences?: string;
  additionalNotes?: string;
  visitingDays?: Record<string, string> | string;
  paystackSubscriptionCode?: string;
}

export interface SubscriptionCreationRequest {
  subscriptionPlanId: number;
  procureIngredients: boolean;
  delivery: boolean;
  autoRenewal: boolean;
  weeklySessions: number;
  visitingDays: Record<string, string>;
  preferences: Omit<PreferenceRequest, 'emailNotifications'>;
  location?: LagosLocation | '';
}

export interface SubscriptionPlanMenu {
  id: number;
  subscriptionPlanId: number;
  meals: Meal[];
}

/** Amount in kobo (API). */
export interface SubscriptionPlan {
  id: number;
  name: string;
  amount: number;
  isActive: boolean;
  multiplier: number;
  description?: string;
  menus?: SubscriptionPlanMenu[];
  colorScheme?: string;
  paystackPlanId?: string;
}

export interface User {
  id: number;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  platformType: string;
  imageUrl: string;
  isActive: boolean;
  isDisabled: boolean;
  isEmailVerified: boolean;
  isPhoneNumberVerified: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  address: Address;
}

export interface SignInRequest {
  emailOrPlatformId: string;
  phoneNumber: string;
}

export interface SignUpRequest {
  emailOrPlatformId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export type PreferenceRequest = {
  emailNotifications: boolean;
  allergies?: string;
  cookingPreferences?: string;
  dietaryRestrictions?: string;
  additionalNotes?: string;
};

export type UserUpdateRequest = {
  email: string;
  firstName: string;
  lastName: string;
  address: Omit<Address, 'country'>;
};

export type VerifyOTPRequest = {
  code: string;
  phoneNumber: string;
  ref: string;
};

export type FetchFilters = {
  limit: number;
  page: number;
  query?: string;
  sortBy?: SortByType;
  status?: StatusType;
  isActive?: boolean;
  role?: RoleType | null;
  category?: RoleType | null;
};

export interface AuthResponse extends GenericResponse {
  user?: Nullable<User>;
  accessToken?: Nullable<string>;
  authToken?: Nullable<string>;
}

export interface OTPResponse extends GenericResponse {
  ref: string;
  success?: boolean;
  message?: string;
}

export interface MessageResponse extends GenericResponse {
  message?: string;
  data?: {
    [key: string]: string;
  };
}

export interface PreferenceResponse extends GenericResponse {
  preference?: Preference | null;
}

export interface SubscriptionResponse extends GenericResponse {
  subscription?: Subscription | null;
}

export interface SubscriptionPlanResponse extends GenericResponse {
  subscriptionPlan: SubscriptionPlan | null;
}

export interface SubscriptionPlansResponse extends GenericResponse {
  subscriptionPlans: SubscriptionPlan[];
}
