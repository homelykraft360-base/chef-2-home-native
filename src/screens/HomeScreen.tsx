import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Button, Card, Icon } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import useGetCurrentUserDetails from '../hooks/useGetCurrentUserDetails';
import useGetInvoiceHistory from '../hooks/useGetInvoiceHistory';
import useGetMealPlanForWeek from '../hooks/useGetMealPlanForWeek';
import useGetSubscription from '../hooks/useGetSubscription';
import useGetSupportTicketsUnread from '../hooks/useGetSupportTicketsUnread';
import useHouseholdEntitlement from '../hooks/useHouseholdEntitlement';
import { currentUser, setUser } from '../store/authSlice';
import {
  CHEF_GREEN,
  CHEF_GREY,
  CHEF_ORANGE,
  ERROR_RED,
  GRAY_100,
  GRAY_600,
} from '../constants/theme';
import type { Subscription, User } from '../types';
import {
  formatAddress,
  formatDate,
  formatPhoneNumber,
  formatToMoney,
  getInitials,
} from '../utils/string.utils';
import { mealPlanHasSelections } from '../utils/mealPlan.utils';
import { currentWeekStart, weekRangeLabel } from '../utils/week';

import PaymentHistory from './booking/components/PaymentHistory';

export default function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const current = useSelector(currentUser);

  const {
    isActiveMember,
    shouldShowSubscribeCTA,
    cachedPayerFirstName,
  } = useHouseholdEntitlement();

  const { subscription, error: subscriptionError, loading: subscriptionLoading, refetch: refetchSubscription } =
    useGetSubscription();
  const { user, error: userError, loading: userLoading, refetch: refetchUser } =
    useGetCurrentUserDetails();
  const {
    invoices,
    loading: invoicesLoading,
    error: invoicesError,
    refetch: refetchInvoices,
  } = useGetInvoiceHistory();

  const currentWeek = currentWeekStart();
  const subscriptionActive = subscription?.status === 'active';
  const {
    mealPlan: currentWeekMealPlan,
    loading: mealPlanLoading,
    refetch: refetchMealPlan,
  } = useGetMealPlanForWeek(subscriptionActive ? currentWeek : null);

  const {
    hasUnread: hasSupportUnread,
    unreadCount: supportUnreadCount,
    refetch: refetchSupportUnread,
  } = useGetSupportTicketsUnread();

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetchSupportUnread();
    }, [refetchSupportUnread]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchSubscription(),
        refetchUser(),
        refetchInvoices(),
        refetchMealPlan(),
        refetchSupportUnread(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchInvoices, refetchMealPlan, refetchSubscription, refetchSupportUnread, refetchUser]);

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
    const parent = navigation.getParent();
    if (parent) {
      (parent as { navigate: (name: string) => void }).navigate('Booking');
    } else {
      (navigation as { navigate: (screen: string) => void }).navigate('Booking');
    }
  };
  const goToSettings = () => {
    (navigation as { navigate: (screen: string) => void }).navigate('Settings');
  };
  const goToMeals = () => {
    (navigation as { navigate: (screen: string) => void }).navigate('Meals');
  };
  const goToSupport = () => {
    const parent = navigation.getParent();
    if (parent) {
      (parent as { navigate: (name: string) => void }).navigate('SupportTickets');
    }
  };

  const hasWeeklyMealSelections = mealPlanHasSelections(currentWeekMealPlan);

  return (
    <View style={styles.screen}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={CHEF_ORANGE}
          colors={[CHEF_ORANGE]}
          progressBackgroundColor="#fff"
        />
      }
    >
      {refreshing ? (
        <View style={styles.refreshBanner}>
          <ActivityIndicator size="small" color={CHEF_ORANGE} />
          <Text style={styles.refreshBannerText}>Refreshing your data…</Text>
        </View>
      ) : null}

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
          shouldShowSubscribeCTA ? (
          <Card style={styles.card}>
            <Card.Content style={styles.emptyBlock}>
              <View style={styles.emptyIconWrap}>
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
          ) : null
        ) : isActiveMember ? (
          <HouseholdPlanCard
            subscription={subscription}
            payerFirstName={cachedPayerFirstName ?? 'your payer'}
            onPlanMeals={goToMeals}
            onViewPlan={goToSubscription}
          />
        ) : (
          <SubscriptionCard subscription={subscription} onManage={goToSubscription} />
        )}
      </View>

      {subscriptionActive ? (
        <View style={styles.cardRow}>
          <MealPlanPromptCard
            hasSelections={hasWeeklyMealSelections}
            loading={mealPlanLoading}
            weekLabel={weekRangeLabel(currentWeek)}
            onPress={goToMeals}
          />
        </View>
      ) : null}

      <View style={styles.cardRow}>
        <PaymentHistory
          invoices={invoices}
          loading={invoicesLoading}
          limit={3}
          showViewAll
        />
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

      <TouchableOpacity
        style={styles.helpFab}
        onPress={goToSupport}
        activeOpacity={0.85}
        accessibilityLabel={
          hasSupportUnread
            ? 'Get help, you have support ticket updates'
            : 'Get help'
        }
        accessibilityRole="button"
      >
        <Icon source="help-circle" size={26} color="#fff" />
        {hasSupportUnread ? (
          <View style={styles.helpFabBadge}>
            {supportUnreadCount > 1 ? (
              <Text style={styles.helpFabBadgeText}>
                {supportUnreadCount > 9 ? '9+' : supportUnreadCount}
              </Text>
            ) : null}
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

function MealPlanPromptCard({
  hasSelections,
  loading,
  weekLabel,
  onPress,
}: {
  hasSelections: boolean;
  loading: boolean;
  weekLabel: string;
  onPress: () => void;
}) {
  if (loading) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.mealPromptLoading}>
          <ActivityIndicator size="small" color={CHEF_ORANGE} />
        </Card.Content>
      </Card>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card
        style={[
          styles.card,
          styles.mealPromptCard,
          !hasSelections && styles.mealPromptCardAccent,
        ]}
      >
        <Card.Content style={styles.mealPromptContent}>
          <View style={styles.mealPromptIconWrap}>
            <Icon
              source="silverware-fork-knife"
              size={22}
              color={hasSelections ? CHEF_GREEN : CHEF_ORANGE}
            />
          </View>
          <View style={styles.mealPromptTextWrap}>
            <Text style={styles.mealPromptTitle}>
              {hasSelections
                ? 'View / select meals'
                : 'Select your meals for this week'}
            </Text>
            <Text style={styles.mealPromptSub}>
              {hasSelections
                ? `Week of ${weekLabel} — tap to update your plan`
                : `Week of ${weekLabel} — choose what your chef will prepare`}
            </Text>
          </View>
          <Icon source="chevron-right" size={24} color={GRAY_600} />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

function HouseholdPlanCard({
  subscription,
  payerFirstName,
  onPlanMeals,
  onViewPlan,
}: {
  subscription: Subscription;
  payerFirstName: string;
  onPlanMeals: () => void;
  onViewPlan: () => void;
}) {
  const plan = subscription.subscriptionPlan;

  return (
    <Card style={[styles.card, styles.subscriptionCard]}>
      <Card.Content style={styles.subscriptionInner}>
        <Text style={styles.planLabel}>Household plan</Text>
        <Text style={styles.planName}>{plan.name ?? '--'}</Text>
        <Text style={styles.emptySub}>
          You're on {payerFirstName}'s household plan.
        </Text>
        <Text style={[styles.emptySub, { marginTop: 8 }]}>
          No charge for you — {payerFirstName} stays the billing account.
        </Text>
      </Card.Content>
      <View style={styles.subscriptionActions}>
        <Button
          mode="contained"
          onPress={onPlanMeals}
          style={[styles.btn, styles.subscriptionManageBtn]}
          contentStyle={styles.subscriptionManageBtnContent}
        >
          Plan your meals
        </Button>
        <Button mode="outlined" onPress={onViewPlan} style={styles.btn}>
          View plan
        </Button>
      </View>
    </Card>
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
  const subscriptionExpired = dayjs().isAfter(dayjs(subscription.expiresAt));

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
        <Text
          style={[
            styles.autoRenew,
            subscriptionExpired && styles.autoRenewExpired,
          ]}
        >
          {subscriptionExpired
            ? 'Subscription expired'
            : subscription.autoRenewal
              ? 'Renews automatically'
              : "Doesn't renew automatically"}
        </Text>
      </Card.Content>
      <View style={styles.subscriptionActions}>
        <Button
          mode="contained"
          compact={false}
          onPress={onManage}
          style={[styles.btn, styles.subscriptionManageBtn]}
          contentStyle={styles.subscriptionManageBtnContent}
        >
          Manage subscription
        </Button>
      </View>
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
  screen: { flex: 1 },
  content: { padding: 24, paddingBottom: 96 },
  refreshBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  refreshBannerText: { fontSize: 14, fontWeight: '600', color: CHEF_ORANGE },
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
  mealPromptCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mealPromptCardAccent: {
    borderColor: CHEF_ORANGE,
    backgroundColor: '#fff8f0',
  },
  mealPromptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  mealPromptIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealPromptTextWrap: { flex: 1, minWidth: 0 },
  mealPromptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CHEF_GREY,
    marginBottom: 4,
  },
  mealPromptSub: { fontSize: 13, color: GRAY_600, lineHeight: 18 },
  mealPromptLoading: {
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
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
  autoRenew: { fontSize: 12, color: GRAY_600, marginBottom: 6, marginTop: 8 },
  autoRenewExpired: { color: ERROR_RED, fontWeight: '700', marginBottom: 6 },
  /** Plain View (not Card.Actions): Paper injects padding:8 + MD3 margin on buttons. */
  subscriptionActions: {
    width: '100%',
    padding: 0,
    margin: 0,
    flexDirection: 'column',
    alignItems: 'stretch',
    alignSelf: 'stretch',
  },
  subscriptionManageBtn: {
    width: '100%',
    alignSelf: 'stretch',
    margin: 0,
    borderRadius: 0,
  },
  subscriptionManageBtnContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
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
  helpFab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: CHEF_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  helpFabBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: ERROR_RED,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  helpFabBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 10,
  },
});
