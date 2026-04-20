import { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, Icon } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import useGetCurrentUserDetails from '../hooks/useGetCurrentUserDetails';
import useGetInvoiceHistory from '../hooks/useGetInvoiceHistory';
import useGetSubscription from '../hooks/useGetSubscription';
import { currentUser, setUser } from '../store/authSlice';
import { CHEF_GREEN, CHEF_ORANGE, GRAY_100, GRAY_600 } from '../constants/theme';
import type { Subscription, User } from '../types';
import {
  formatAddress,
  formatDate,
  formatPhoneNumber,
  formatToMoney,
  getInitials,
} from '../utils/string.utils';

import PaymentHistory from './booking/components/PaymentHistory';

export default function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const current = useSelector(currentUser);

  const { subscription, error: subscriptionError, loading: subscriptionLoading } =
    useGetSubscription();
  const { user, error: userError, loading: userLoading } =
    useGetCurrentUserDetails();
  const {
    invoices,
    loading: invoicesLoading,
    error: invoicesError,
  } = useGetInvoiceHistory();

  useEffect(() => {
    if (user) dispatch(setUser(user));
  }, [dispatch, user]);

  useEffect(() => {
    if (!invoicesError) return;
    Alert.alert('Could not load payment history', invoicesError);
  }, [invoicesError]);

  const goToSubscription = () => {
    (navigation as { navigate: (screen: string) => void }).navigate('Subscription');
  };
  const goToBooking = () => {
    (navigation as { navigate: (screen: string) => void }).navigate('Booking');
  };
  const goToSettings = () => {
    (navigation as { navigate: (screen: string) => void }).navigate('Settings');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.welcome}>
        {current?.firstName
          ? `Welcome back, ${current.firstName}`
          : 'Welcome to Chef2Home'}
      </Text>

      {/* Subscription — 1 column */}
      <View style={styles.cardRow}>
        {subscriptionLoading ? (
          <Card style={styles.card}>
            <Card.Content style={styles.loadingBlock}>
              <ActivityIndicator size="large" color={CHEF_ORANGE} />
              <Text style={styles.loadingText}>Loading subscription…</Text>
            </Card.Content>
          </Card>
        ) : subscriptionError ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.errorText}>
                An error occurred while loading your subscription. Please try again.
              </Text>
            </Card.Content>
          </Card>
        ) : !subscription ? (
          <Card style={styles.card}>
            <Card.Content style={styles.emptyBlock}>
              <View style={styles.emptyIconWrap}>
                {/* <Icon source="silverware-fork-knife" size={48} color={CHEF_ORANGE} /> */}
                <Image
                  source={require('../../assets/images/utensils.png')}
                  style={{ height: 100 }}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.emptyTitle}>No active subscription</Text>
              <Text style={styles.emptySub}>
                You don't have an active subscription. To get started on your journey to
                convenient feeding for you and your family, start a subscription.
              </Text>
              <Button mode="contained" onPress={goToBooking} style={styles.btn}>
                Start your subscription
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <SubscriptionCard subscription={subscription} onManage={goToSubscription} />
        )}
      </View>

      <View style={styles.cardRow}>
        <PaymentHistory invoices={invoices} loading={invoicesLoading} />
      </View>

      {/* User info — 1 column */}
      <View style={styles.cardRow}>
        {userLoading ? (
          <Card style={styles.card}>
            <Card.Content style={styles.loadingBlock}>
              <ActivityIndicator size="large" color={CHEF_ORANGE} />
              <Text style={styles.loadingText}>Loading profile…</Text>
            </Card.Content>
          </Card>
        ) : userError ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.errorTitle}>Error retrieving user info</Text>
              <Text style={styles.errorText}>
                Please try again or contact support for help.
              </Text>
            </Card.Content>
          </Card>
        ) : user ? (
          <UserInfoCard user={user} onCompleteProfile={goToSettings} />
        ) : null}
      </View>
    </ScrollView>
  );
}

function SubscriptionCard({
  subscription,
  onManage,
}: {
  subscription: Subscription;
  onManage: () => void;
}) {
  const plan = subscription.subscriptionPlan;
  return (
    <Card style={[styles.card, styles.subscriptionCard]}>
      <Card.Content style={styles.subscriptionInner}>
        <Text style={styles.planLabel}>Current plan</Text>
        <Text style={styles.planName}>{plan.name ?? '--'}</Text>
        <Text style={styles.planAmount}>
          {formatToMoney(plan.amount / 100)} / month
        </Text>
        <View style={styles.datesRow}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Start date</Text>
            <Text style={styles.dateValue}>{formatDate(subscription.lastPaid)}</Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>End date</Text>
            <Text style={styles.dateValue}>{formatDate(subscription.expiresAt)}</Text>
          </View>
        </View>
        <Text style={styles.autoRenew}>
          {subscription.autoRenewal
            ? 'Renews automatically'
            : "Doesn't renew automatically"}
        </Text>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Button mode="contained" onPress={onManage} style={styles.btn}>
          Manage subscription
        </Button>
      </Card.Actions>
    </Card>
  );
}

const DETAIL_ICONS: Record<string, 'phone' | 'email' | 'map-marker'> = {
  phone: 'phone',
  email: 'email',
  address: 'map-marker',
};

function UserInfoCard({
  user,
  onCompleteProfile,
}: {
  user: User;
  onCompleteProfile: () => void;
}) {
  const initials = getInitials(user.firstName, user.lastName);
  const showCompleteOverlay = !user.phoneNumber || !user.address;

  const details = [
    { label: 'phone', value: formatPhoneNumber(user.phoneNumber) },
    { label: 'email', value: user.email ?? '--' },
    { label: 'address', value: formatAddress(user.address) },
  ];

  return (
    <Card style={styles.card}>
      {showCompleteOverlay && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={onCompleteProfile}
          activeOpacity={1}
          accessibilityLabel="Complete your profile"
          accessibilityRole="button"
        >
          <Text style={styles.overlayText}>Complete Profile</Text>
          <Button mode="contained" onPress={onCompleteProfile} style={styles.btn}>
            Go to Settings
          </Button>
        </TouchableOpacity>
      )}
      <Card.Content style={styles.cardContent}>
        <View style={styles.userHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userNameWrap}>
            <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
              {user.firstName} {user.lastName}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.details}>
          {details.map(({ label, value }) => (
            <View key={label} style={styles.detailRow}>
              <View style={styles.detailIconWrap}>
                <Icon
                  source={DETAIL_ICONS[label as keyof typeof DETAIL_ICONS] ?? 'information'}
                  size={16}
                  color={GRAY_600}
                />
              </View>
              <Text style={styles.detailValue}>{value}</Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  welcome: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    color: CHEF_GREEN,
  },
  cardRow: { marginBottom: 24 },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  loadingBlock: {
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 12, fontSize: 14, color: GRAY_600 },
  errorText: { fontSize: 14, color: GRAY_600 },
  errorTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  emptyBlock: { alignItems: 'center' },
  emptyIconWrap: { marginBottom: 8 },
  emptySub: {
    fontSize: 14,
    color: GRAY_600,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  btn: { backgroundColor: CHEF_ORANGE, borderRadius: 12 },
  subscriptionCard: { borderWidth: 2, borderColor: CHEF_ORANGE },
  subscriptionInner: { backgroundColor: '#fff8f0' },
  planLabel: { fontSize: 14, color: GRAY_600, marginBottom: 4 },
  planName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  planAmount: { fontSize: 16, color: CHEF_GREEN, marginBottom: 16 },
  datesRow: { flexDirection: 'row', gap: 24, marginBottom: 8 },
  dateBlock: {},
  dateLabel: { fontSize: 12, color: GRAY_600 },
  dateValue: { fontSize: 14, fontWeight: '600' },
  autoRenew: { fontSize: 12, color: GRAY_600, marginTop: 8 },
  cardActions: { paddingHorizontal: 16, paddingBottom: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    padding: 24,
  },
  overlayText: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 16 },
  cardContent: { paddingTop: 16, width: '100%' },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    maxWidth: '100%',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CHEF_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  userNameWrap: { flex: 1, minWidth: 0 },
  userName: { fontSize: 18, fontWeight: '600' },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
    width: '100%',
  },
  details: { gap: 4 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  detailIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GRAY_100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailValue: { fontSize: 14, color: GRAY_600, flex: 1 },
});
