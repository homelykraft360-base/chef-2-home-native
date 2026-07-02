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
  metaData?: Record<string, unknown> | null;
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
  /** Stored in kobo (smallest currency unit). Divide by 100 before displaying as naira. */
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

export type DayOfWeek =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export type MealSelectionSource = 'user' | 'prior_week' | 'admin_default';

export interface MealPlanDay {
  id: number;
  dayOfWeek: DayOfWeek;
  source: MealSelectionSource;
  meals: Meal[];
}

export interface MealPlan {
  id: number;
  userId: number;
  subscriptionId: number;
  weekStart: string;
  days: MealPlanDay[];
  /** From list/get meal plan API; used to surface ingredient checkout for past unpaid weeks. */
  ingredientPaymentStatus?: IngredientPaymentStatus;
  shoppingNotes?: string | null;
  shoppingNotesOps?: string | null;
  effectiveShoppingNotes?: string | null;
}

export interface MealPlanDayInput {
  dayOfWeek: DayOfWeek;
  mealIds: number[];
}

export interface MealPlanCreateRequest {
  weekStart: string;
  days: MealPlanDayInput[];
  shoppingNotes?: string | null;
}

export interface MealPlanUpdateRequest {
  days: MealPlanDayInput[];
  shoppingNotes?: string | null;
}

export interface MealPlanResponse extends GenericResponse {
  mealPlan?: MealPlan | null;
}

export interface MealPlansResponse extends GenericResponse {
  mealPlans: MealPlan[];
}

export type DevicePlatform = 'ios' | 'android' | 'web';

export interface PushTokenRegisterRequest {
  fcmToken: string;
  platform: DevicePlatform;
}

export interface SubscriptionPlanResponse extends GenericResponse {
  subscriptionPlan: SubscriptionPlan | null;
}

export interface SubscriptionPlansResponse extends GenericResponse {
  subscriptionPlans: SubscriptionPlan[];
}

// ===== Weekly Ingredient Payment =====
export type ExclusionReason = 'have' | 'self_source';
export type IngredientPaymentStatus = 'unpaid' | 'pending' | 'paid';

export interface MealPlanIngredientRow {
  ingredientId: number;
  name: string;
  unit?: string | null;
  quantity: number;
  unitCostKobo: number;
  lineTotalKobo: number;
  isExcluded: boolean;
  exclusionReason?: ExclusionReason | null;
  imageUrl?: string | null;
}

export interface MealPlanMealRow {
  mealPlanDayId: number;
  mealId: number;
  dayOfWeek: DayOfWeek;
  mealName: string;
  mealImageUrl?: string | null;
  ingredients: MealPlanIngredientRow[];
  mealSubtotalKobo: number;
}

export interface MealPlanIngredientBreakdown {
  mealPlanId: number;
  weekStart: string;
  cutoffPassed: boolean;
  meals: MealPlanMealRow[];
  grossTotalKobo: number;
  excludedTotalKobo: number;
  payableTotalKobo: number;
  paymentStatus: IngredientPaymentStatus;
  invoiceId?: number | null;
  shoppingNotes?: string | null;
  shoppingNotesOps?: string | null;
  effectiveShoppingNotes?: string | null;
}

export interface IngredientExclusionInput {
  mealPlanDayId: number;
  mealId: number;
  ingredientId: number;
  reason: ExclusionReason;
}

export interface IngredientCheckoutResponse {
  authorizationUrl?: string | null;
  accessCode?: string | null;
  reference: string;
  invoiceId: number;
  amount: number;
}

export interface InvoiceIngredientLine {
  id: number;
  mealId: number;
  mealName: string;
  dayOfWeek: DayOfWeek;
  ingredientId: number;
  ingredientName: string;
  unit?: string | null;
  quantity: number;
  unitCostKobo: number;
  lineTotalKobo: number;
  wasExcluded: boolean;
  exclusionReason?: ExclusionReason | null;
}

export interface InvoiceIngredientBreakdown {
  invoiceId: number;
  weekStart?: string | null;
  mealPlanId?: number | null;
  paidAt?: string | null;
  amount: number;
  lines: InvoiceIngredientLine[];
}
