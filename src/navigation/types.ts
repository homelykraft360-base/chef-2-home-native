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
  Booking: undefined;
  Subscription: undefined;
  Settings: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends AuthStackParamList, MainTabParamList {}
  }
}
