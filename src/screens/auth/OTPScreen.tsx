import { useState } from 'react';
import { Text, TextInput, TouchableOpacity } from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { Button, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { resendCode, verifyOTP } from '../../api/authApi';
import { CHEF_ORANGE } from '../../constants/theme';
import type { AuthStackParamList } from '../../navigation/types';
import type { SignInRequest, SignUpRequest, User } from '../../types';
import { setPostLoginTab, setToken, setUser } from '../../store/authSlice';
import type { RootState } from '../../store';

import AuthLayout from './components/AuthLayout';
import { authStyles } from './components/authStyles';
import SuccessModal from './components/SuccessModal';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

export default function OTPScreen({
  navigation,
  route,
}: Props) {
  const {
    phoneNumber,
    ref: codeRef,
    isSignUp,
    emailOrPlatformId = '',
    fullName = '',
    firstName = '',
    lastName = '',
  } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [pendingAuth, setPendingAuth] = useState<{
    accessToken: string;
    user: User;
  } | null>(null);
  const dispatch = useDispatch();
  const pendingInviteToken = useSelector(
    (state: RootState) => state.auth.pendingInviteToken,
  );

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    const { error: err, accessToken, user } = await verifyOTP({
      phoneNumber,
      code,
      ref: codeRef,
    });
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    if (accessToken && user) {
      setPendingAuth({ accessToken, user });
      setSuccessModalVisible(true);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    const payload: SignInRequest | SignUpRequest = isSignUp
      ? {
          emailOrPlatformId,
          phoneNumber,
          fullName,
          firstName,
          lastName,
        }
      : { emailOrPlatformId, phoneNumber };
    const { error: err, ref: newRef } = await resendCode(payload);
    setLoading(false);
    if (err) setError(err);
    else navigation.setParams({ ref: newRef ?? codeRef });
  };

  const handleGoHome = () => {
    if (pendingAuth) {
      dispatch(setToken(pendingAuth.accessToken));
      dispatch(setUser(pendingAuth.user));
      if (pendingInviteToken) {
        dispatch(setPostLoginTab('AcceptInvite'));
      }
      setPendingAuth(null);
    }
    setSuccessModalVisible(false);
  };

  const handleBookSession = () => {
    if (pendingAuth) {
      dispatch(setToken(pendingAuth.accessToken));
      dispatch(setUser(pendingAuth.user));
      dispatch(setPostLoginTab('Booking'));
      setPendingAuth(null);
    }
    setSuccessModalVisible(false);
  };

  const title = isSignUp
    ? 'Verify your phone number'
    : "Let's make sure it's you";
  const subtitle = `We sent a code to ${phoneNumber}. Enter the code below.`;

  return (
    <>
      <AuthLayout title={title} subtitle={subtitle}>
        <TextInput
          style={authStyles.inputOtp}
          placeholder="Verification code"
          placeholderTextColor="#9ca3af"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
        />
        <Button
          mode="contained"
          onPress={handleVerify}
          loading={loading}
          disabled={loading || code.length < 4}
          style={[authStyles.button, { backgroundColor: CHEF_ORANGE }]}
          labelStyle={{ color: '#fff' }}
        >
          Verify
        </Button>
        <TouchableOpacity
          onPress={handleResend}
          disabled={loading}
          style={authStyles.resendRow}
        >
          <Text style={authStyles.linkText}>Resend code</Text>
        </TouchableOpacity>
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
      </AuthLayout>
      <SuccessModal
        visible={successModalVisible}
        onGoHome={handleGoHome}
        onBookSession={handleBookSession}
      />
    </>
  );
}
