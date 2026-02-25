import { useState } from 'react';
import { Text, TextInput, TouchableOpacity } from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { login, signInWithGoogle } from '../../api/authApi';
import { setToken, setUser } from '../../store/authSlice';
import { CHEF_ORANGE } from '../../constants/theme';
import type { AuthStackParamList } from '../../navigation/types';
import type { SignInRequest } from '../../types';
import { getGoogleIdToken, isGoogleSignInAvailable } from '../../utils/googleSignIn';

import AuthLayout from './components/AuthLayout';
import { authStyles } from './components/authStyles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const [data, setData] = useState<SignInRequest>({
    emailOrPlatformId: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const idToken = await getGoogleIdToken();
      setGoogleLoading(false);
      if (!idToken) return;
      setGoogleLoading(true);
      const { accessToken, user, error: apiError } = await signInWithGoogle(idToken);
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

  const isLoading = loading || googleLoading;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign into your account to pick up where you left off."
    >
      {error ? (
        <Text style={authStyles.errorText}>{error}</Text>
      ) : null}
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
  );
}
