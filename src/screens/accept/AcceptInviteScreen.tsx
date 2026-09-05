import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { signOut } from '../../api/authApi';
import {
  acceptInvite,
  acceptInviteAddress,
  acceptInviteAddressMine,
  acceptInviteMine,
  fetchInvitePreview,
  fetchPendingInvite,
} from '../../api/subscriptionMembersApi';
import { CHEF_ORANGE, GRAY_600 } from '../../constants/theme';
import type { RootStackParamList } from '../../navigation/types';
import type { LagosLocation } from '../../types';
import type { RootState } from '../../store';
import {
  isAuthenticated,
  setCachedPayerFirstName,
  setPendingInviteToken,
  setPostLoginTab,
  signOutUser,
} from '../../store/authSlice';
import { getInviteErrorCopy, mapInviteError } from '../../utils/inviteErrors';

import AcceptAddressStep from './AcceptAddressStep';

type Props = NativeStackScreenProps<RootStackParamList, 'AcceptInvite'>;
type Step = 'preview' | 'address' | 'success' | 'error';

export default function AcceptInviteScreen({ route, navigation }: Props) {
  const dispatch = useDispatch();
  const authed = useSelector(isAuthenticated);
  const pendingToken = useSelector(
    (state: RootState) => state.auth.pendingInviteToken,
  );

  const token = route.params?.token ?? pendingToken ?? '';
  const [useMineFlow, setUseMineFlow] = useState(false);
  const [step, setStep] = useState<Step>('preview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [inviterFirstName, setInviterFirstName] = useState('');
  const [planName, setPlanName] = useState('');
  const [payerVisitLocation, setPayerVisitLocation] = useState<
    LagosLocation | undefined
  >();
  const [errorCopy, setErrorCopy] = useState<{ title: string; body: string } | null>(
    null,
  );

  useEffect(() => {
    if (token) {
      dispatch(setPendingInviteToken(token));
      void loadPreview(token);
      return;
    }
    void loadPendingInvite();
  }, [token, dispatch]);

  const applyPreview = (preview: {
    inviterFirstName: string;
    planName: string;
    payerVisitLocation?: string;
    step?: 'preview' | 'address';
  }) => {
    setInviterFirstName(preview.inviterFirstName);
    setPlanName(preview.planName);
    setPayerVisitLocation(
      preview.payerVisitLocation as LagosLocation | undefined,
    );
    dispatch(setCachedPayerFirstName(preview.inviterFirstName));
    setStep(preview.step === 'address' ? 'address' : 'preview');
  };

  const loadPendingInvite = async () => {
    setLoading(true);
    const { invite, error } = await fetchPendingInvite();
    if (error || !invite) {
      setErrorCopy(getInviteErrorCopy('missing_token'));
      setStep('error');
    } else {
      setUseMineFlow(true);
      applyPreview(invite);
    }
    setLoading(false);
  };

  const loadPreview = async (inviteToken: string) => {
    setLoading(true);
    setUseMineFlow(false);
    const { preview, error } = await fetchInvitePreview(inviteToken);
    if (error || !preview) {
      setErrorCopy(mapInviteError(String(error)));
      setStep('error');
    } else {
      applyPreview(preview);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    dispatch(signOutUser());
  };

  const goToAuth = (screen: 'Login' | 'SignUp') => {
    navigation.navigate('Auth', { screen });
  };

  const handleContinueToAddress = async () => {
    setActionLoading(true);
    const { error } = useMineFlow
      ? await acceptInviteMine()
      : token
        ? await acceptInvite(token)
        : { error: 'missing_token' };
    setActionLoading(false);
    if (error) {
      setErrorCopy(mapInviteError(String(error)));
      setStep('error');
      return;
    }
    setStep('address');
  };

  const finishAddress = useCallback(
    async (payload: Parameters<typeof acceptInviteAddress>[0]) => {
      setActionLoading(true);
      const { error } = useMineFlow
        ? await acceptInviteAddressMine({
            useOwnerAddress: payload.useOwnerAddress,
            streetAddress1: payload.streetAddress1,
            streetAddress2: payload.streetAddress2,
            city: payload.city,
            state: payload.state,
            visitLocation: payload.visitLocation,
            localArea: payload.localArea,
          })
        : await acceptInviteAddress(payload);
      setActionLoading(false);
      if (error) {
        setErrorCopy(mapInviteError(String(error)));
        setStep('error');
        return;
      }
      dispatch(setPendingInviteToken(null));
      setStep('success');
    },
    [dispatch, useMineFlow],
  );

  const handleSubmitOwn = (address: {
    streetAddress1: string;
    streetAddress2: string;
    city: string;
    visitLocation: string;
    localArea: string;
  }) => {
    void finishAddress({
      ...(useMineFlow || !token ? {} : { token }),
      useOwnerAddress: false,
      streetAddress1: address.streetAddress1,
      streetAddress2: address.streetAddress2,
      city: address.city,
      state: 'lagos',
      visitLocation: address.visitLocation,
      localArea: address.localArea,
    });
  };

  const handleSubmitSame = () => {
    void finishAddress({
      ...(useMineFlow || !token ? {} : { token }),
      useOwnerAddress: true,
    });
  };

  const goHome = () => {
    dispatch(setPostLoginTab(null));
    navigation.navigate('Main');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={CHEF_ORANGE} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => void handleSignOut()} accessibilityRole="button">
          <Text style={styles.signOut}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {step === 'preview' ? (
        <View style={styles.content}>
          <Text style={styles.heading}>You're invited</Text>
          <Text style={styles.body}>
            {inviterFirstName} invited you to join their {planName} plan on Chef2Home.
          </Text>
          <Text style={styles.helper}>
            No charge for you — {inviterFirstName} stays the billing account.
          </Text>
          {authed ? (
            <Button
              mode="contained"
              onPress={() => void handleContinueToAddress()}
              loading={actionLoading}
              disabled={actionLoading}
              style={styles.cta}
            >
              Continue to address
            </Button>
          ) : (
            <>
              <Button
                mode="contained"
                onPress={() => goToAuth('Login')}
                style={styles.cta}
              >
                Log in or sign up to accept
              </Button>
              <Button mode="text" onPress={() => goToAuth('SignUp')}>
                Create an account
              </Button>
            </>
          )}
        </View>
      ) : null}

      {step === 'address' ? (
        <AcceptAddressStep
          inviterFirstName={inviterFirstName}
          payerVisitLocation={payerVisitLocation}
          loading={actionLoading}
          onSubmitOwn={handleSubmitOwn}
          onSubmitSame={handleSubmitSame}
        />
      ) : null}

      {step === 'success' ? (
        <View style={styles.content}>
          <Text style={styles.heading}>You're in the household</Text>
          <Text style={styles.body}>
            Your membership is active. Head to Home to see the shared plan.
          </Text>
          <Button mode="contained" onPress={goHome} style={styles.cta}>
            Go to Home
          </Button>
        </View>
      ) : null}

      {step === 'error' && errorCopy ? (
        <View style={styles.content}>
          <Text style={styles.heading}>{errorCopy.title}</Text>
          <Text style={styles.body}>{errorCopy.body}</Text>
          {!authed ? (
            <Button mode="contained" onPress={() => goToAuth('Login')} style={styles.cta}>
              Log in or sign up to accept
            </Button>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    paddingTop: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
  signOut: { color: CHEF_ORANGE, fontSize: 16, fontWeight: '600' },
  content: { flex: 1, padding: 24, paddingTop: 16 },
  heading: { fontSize: 28, fontWeight: '700', color: '#101928', marginBottom: 12 },
  body: { fontSize: 16, color: GRAY_600, lineHeight: 22, marginBottom: 12 },
  helper: { fontSize: 15, color: GRAY_600, marginBottom: 24 },
  cta: { marginTop: 8 },
});
