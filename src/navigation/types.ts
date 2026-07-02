import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  OTP: {
    phoneNumber: string;
    ref: string;
    isSignUp: boolean;
    emailOrPlatformId?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Meals: undefined;
  Subscription: undefined;
  Settings: undefined;
};

/** Root native stack: auth flow, tab shell, and modal-style app screens */
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Booking: undefined;
  IngredientCheckout: { mealPlanId: number };
  IngredientReceipt: { invoiceId: number };
  PaymentHistory: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList
      extends AuthStackParamList,
        MainTabParamList,
        RootStackParamList {}
  }
}
