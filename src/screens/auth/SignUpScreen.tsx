import { useState } from 'react';
import { Text, TextInput, TouchableOpacity } from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { Button, Snackbar } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { signUp, signInWithGoogle } from '../../api/authApi';
import { setToken, setUser } from '../../store/authSlice';
import { CHEF_ORANGE } from '../../constants/theme';
import type { AuthStackParamList } from '../../navigation/types';
import type { SignUpRequest } from '../../types';
import { getGoogleIdToken, isGoogleSignInAvailable } from '../../utils/googleSignIn';

import AuthLayout from './components/AuthLayout';
import { authStyles } from './components/authStyles';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const [data, setData] = useState<SignUpRequest>({
    emailOrPlatformId: '',
    fullName: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSignUp = async () => {
    if (data.fullName.trim().split(' ').length < 2) {
      setError('Please enter your full name (first and last name).');
      return;
    }
    setError('');
    const nameParts = data.fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    setLoading(true);
    const { error: err, message, ref } = await signUp({
      ...data,
      firstName,
      lastName,
    });
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    navigation.replace('OTP', {
      phoneNumber: data.phoneNumber,
      ref: ref ?? '',
      isSignUp: true,
      emailOrPlatformId: data.emailOrPlatformId,
      fullName: data.fullName,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' '),
    });
  };

  return (
    <>
      <AuthLayout
        title="Welcome to Chef2Home"
        subtitle="Create an account to get started on your journey to culinary delight."
      >
        <TextInput
        style={authStyles.input}
        placeholder="Full name"
        placeholderTextColor="#9ca3af"
        value={data.fullName}
        onChangeText={(v) => setData((prev) => ({ ...prev, fullName: v }))}
        />
        <TextInput
          style={authStyles.input}
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          value={data.emailOrPlatformId}
          onChangeText={(v) =>
            setData((prev) => ({ ...prev, emailOrPlatformId: v }))
          }
          autoCapitalize="none"
          keyboardType="email-address"
        />
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
          onPress={handleSignUp}
          loading={loading}
          disabled={loading || googleLoading}
          style={[authStyles.button, { backgroundColor: CHEF_ORANGE }]}
          labelStyle={{ color: '#fff' }}
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </Button>
        {isGoogleSignInAvailable ? (
          <Button
            mode="outlined"
            onPress={handleGoogleSignIn}
            loading={googleLoading}
            disabled={loading || googleLoading}
            style={[authStyles.button, { marginTop: 12 }]}
            icon="google"
          >
            Sign up with Google
          </Button>
        ) : null}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={authStyles.switchBtn}
        >
          <Text style={authStyles.linkTextMuted}>
            Already have an account?{' '}
            <Text style={authStyles.linkText}>Sign in</Text>
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
