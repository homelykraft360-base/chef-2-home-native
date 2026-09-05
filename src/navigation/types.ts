import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';

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
  Household: undefined;
  Subscription: undefined;
  Settings: undefined;
};

/** Root native stack: auth flow, tab shell, and modal-style app screens */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: undefined;
  AcceptInvite: { token?: string };
  Booking: undefined;
  IngredientCheckout: { mealPlanId: number; refreshToken?: number };
  IngredientReceipt: { invoiceId: number };
  PaymentHistory: undefined;
  SupportTickets: undefined;
  SupportTicketDetail: { ticketId: number };
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
