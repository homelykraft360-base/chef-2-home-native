import { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { Button, Snackbar } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { login, signInWithApple, signInWithGoogle } from '../../api/authApi';
import { setToken, setUser } from '../../store/authSlice';
import { CHEF_ORANGE } from '../../constants/theme';
import type { AuthStackParamList } from '../../navigation/types';
import type { SignInRequest } from '../../types';
import {
  AppleAuthentication,
  getAppleSignInAvailability,
  performAppleSignIn,
} from '../../utils/appleSignIn';
import { getGoogleIdToken, isGoogleSignInAvailable } from '../../utils/googleSignIn';

import AuthLayout from './components/AuthLayout';
import { AUTH_PAPER_BUTTON_CORNER_RADIUS, authStyles } from './components/authStyles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const [data, setData] = useState<SignInRequest>({
    emailOrPlatformId: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void getAppleSignInAvailability().then(setAppleAvailable);
  }, []);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const { error: err, message, ref } = await login(data);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    navigation.replace('OTP', {
      phoneNumber: data.phoneNumber,
      ref: ref ?? '',
      isSignUp: false,
      emailOrPlatformId: data.emailOrPlatformId,
    });
  };

  const handleAppleSignIn = async () => {
    setError('');
    setAppleLoading(true);
    try {
      const result = await performAppleSignIn();
      if (result.status === 'cancelled') {
        setAppleLoading(false);
        return;
      }
      if (result.status === 'unavailable' || result.status === 'error') {
        setAppleLoading(false);
        setError(
          result.status === 'unavailable'
            ? 'Apple sign-in is not available on this device.'
            : result.error,
        );
        return;
      }

      const { accessToken, user, error: apiError } = await signInWithApple(
        result.identityToken,
        result.firstName,
        result.lastName,
      );
      setAppleLoading(false);
      if (apiError) {
        setError(apiError);
        return;
      }
      if (accessToken && user) {
        dispatch(setToken(accessToken));
        dispatch(setUser(user));
      }
    } catch (e) {
      setAppleLoading(false);
      setError(e instanceof Error ? e.message : 'Apple sign-in failed');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const result = await getGoogleIdToken();
      setGoogleLoading(false);
      if (result.status === 'cancelled') return;
      if (result.status === 'unavailable' || result.status === 'error') {
        setError(result.error);
        return;
      }

      setGoogleLoading(true);
      const { accessToken, user, error: apiError } = await signInWithGoogle(
        result.idToken,
      );
      setGoogleLoading(false);
      if (apiError) {
        setError(apiError);
        return;
      }
      if (accessToken && user) {
        dispatch(setToken(accessToken));
        dispatch(setUser(user));
      }
    } catch (e) {
      setGoogleLoading(false);
      setError(e instanceof Error ? e.message : 'Google sign-in failed');
    }
  };

  const isLoading = loading || googleLoading || appleLoading;

  return (
    <>
      <AuthLayout
        title="Welcome back"
        subtitle="Sign into your account to pick up where you left off."
      >
        {/* <TextInput
        style={authStyles.input}
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        value={data.emailOrPlatformId}
        onChangeText={(v) =>
          setData((prev) => ({ ...prev, emailOrPlatformId: v }))
        }
        autoCapitalize="none"
        keyboardType="email-address"
      /> */}
        <TextInput
          style={authStyles.input}
          placeholder="Phone number"
          placeholderTextColor="#9ca3af"
          value={data.phoneNumber}
          onChangeText={(v) =>
            setData((prev) => ({ ...prev, phoneNumber: v }))
          }
          keyboardType="phone-pad"
        />
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={isLoading}
          style={[authStyles.button, { backgroundColor: CHEF_ORANGE }]}
          labelStyle={{ color: '#fff' }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
        {appleAvailable ? (
          <View
            style={{ marginTop: 12, opacity: isLoading ? 0.6 : 1 }}
            pointerEvents={isLoading ? 'none' : 'auto'}
          >
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={AUTH_PAPER_BUTTON_CORNER_RADIUS}
              style={{ width: '100%', height: 44 }}
              onPress={() => {
                void handleAppleSignIn();
              }}
            />
          </View>
        ) : null}
        {isGoogleSignInAvailable ? (
          <Button
            mode="outlined"
            onPress={handleGoogleSignIn}
            loading={googleLoading}
            disabled={isLoading}
            style={[authStyles.button, { marginTop: 12 }]}
            icon="google"
          >
            Sign in with Google
          </Button>
        ) : null}
        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
          style={authStyles.switchBtn}
        >
          <Text style={authStyles.linkTextMuted}>
            Don't have an account?{' '}
            <Text style={authStyles.linkText}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </AuthLayout>
      <Snackbar
        visible={Boolean(error)}
        onDismiss={() => setError('')}
        duration={4500}
        wrapperStyle={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
        action={
          __DEV__
            ? {
                label: 'Copy',
                onPress: () => {
                  void Clipboard.setStringAsync(error);
                },
              }
            : { label: 'Dismiss', onPress: () => setError('') }
        }
      >
        {error}
      </Snackbar>
    </>
  );
}
