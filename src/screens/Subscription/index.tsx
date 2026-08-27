import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Button, Switch } from 'react-native-paper';

import useGetPreference from '../../hooks/useGetPreference';
import useGetSubscription from '../../hooks/useGetSubscription';
import useHouseholdEntitlement from '../../hooks/useHouseholdEntitlement';
import useRenewSubscription from '../../hooks/useRenewSubscription';
import useToggleAutoRenew from '../../hooks/useToggleAutoRenew';
import { formatDate, formatToMoney } from '../../utils/string.utils';
import {
  isSubscriptionExpired,
  subscriptionNeedsRenew,
} from '../../utils/subscription.utils';
import { capitalizeString } from '../../utils/url.utils';
import { CHEF_ORANGE } from '../../constants/theme';

import AutoRenewalModal from './components/AutoRenewalModal';
import SubscriptionItem from './components/SubscriptionItem';

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const [autoRenew, setAutoRenew] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const { subscription, setSubscription, loading, error, refetch } = useGetSubscription();
  const { isActiveMember, isPayer, householdManagement } =
    useHouseholdEntitlement(subscription);
  const { preference, loading: loadingPreferences } = useGetPreference();
  const { toggleAutoRenewal, loading: toggling } = useToggleAutoRenew();
  const { loading: renewLoading, renew } = useRenewSubscription(subscription, {
    onRenewed: (updated) => {
      setSubscription(updated);
      setAutoRenew(updated.autoRenewal);
    },
  });

  useEffect(() => {
    if (subscription) setAutoRenew(subscription.autoRenewal);
  }, [subscription]);

  const handleTogglePress = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleModalConfirm = useCallback(() => {
    toggleAutoRenewal({
      onSuccess: (sub) => {
        setAutoRenew(sub?.autoRenewal ?? !autoRenew);
        setModalVisible(false);
      },
      onError: () => {},
    });
  }, [autoRenew, toggleAutoRenewal]);

  const goToBooking = useCallback(() => {
    const parent = navigation.getParent();
    if (parent) {
      (parent as { navigate: (name: string) => void }).navigate('Booking');
    } else {
      (navigation as { navigate: (screen: string) => void }).navigate('Booking');
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  if (loading || loadingPreferences) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={CHEF_ORANGE} />
      </View>
    );
  }

  if (error || !subscription) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Failed to load subscription details.</Text>
        <Text style={styles.errorSub}>{error ?? 'No active subscription'}</Text>
      </View>
    );
  }

  const plan = subscription.subscriptionPlan;
  const showRenew = isPayer && subscriptionNeedsRenew(subscription);
  const showMemberSoft = isActiveMember && subscriptionNeedsRenew(subscription);
  const expired = isSubscriptionExpired(subscription);
  const planName = capitalizeString(plan.name);
  const formattedAmount = formatToMoney(plan.amount / 100);
  const visitDays = (() => {
    const vd = subscription.visitingDays;
    if (!vd) return '--';
    if (typeof vd === 'string') {
      try {
        const o = JSON.parse(vd) as Record<string, string>;
        return Object.entries(o)
          .map(([d, t]) => `${capitalizeString(d)} ${t}`)
          .join(', ');
      } catch {
        return vd;
      }
    }
    return Object.entries(vd)
      .map(([d, t]) => `${capitalizeString(d)} ${t}`)
      .join(', ');
  })();

  const items: Array<{ label: string; value: string }> = [
    { label: 'Plan', value: capitalizeString(plan.name) },
    { label: 'Start date', value: formatDate(subscription.lastPaid) },
    { label: 'End date', value: formatDate(subscription.expiresAt) },
    {
      label: 'Weekly sessions',
      value:
        subscription.weeklySessions != null
          ? `${subscription.weeklySessions} per week`
          : '--',
    },
    { label: 'Visit days', value: visitDays },
    { label: 'Allergies', value: subscription.allergies || 'None' },
    {
      label: 'Dietary restrictions',
      value: preference?.dietaryRestrictions || 'None',
    },
    {
      label: 'Cooking preferences',
      value: preference?.cookingPreferences || 'None',
    },
    {
      label: 'Additional notes',
      value: preference?.additionalNotes || 'None',
    },
  ];

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Subscription details</Text>
        {isActiveMember && householdManagement === 'payer_assigns' ? (
          <Text style={styles.memberBanner}>Your payer manages visit days.</Text>
        ) : null}
        {showRenew ? (
          <View style={styles.renewBanner}>
            <Text style={styles.renewTitle}>
              {expired
                ? 'Your subscription has expired'
                : 'Your subscription ends soon'}
            </Text>
            <Text style={styles.renewBody}>
              Renew to keep cook-in visits for your household. Same plan ·{' '}
              {planName} · {formattedAmount}/month.
            </Text>
            <View style={styles.renewActions}>
              <Button
                mode="contained"
                onPress={() => renew()}
                loading={renewLoading}
                disabled={renewLoading}
                style={styles.renewPrimaryBtn}
                buttonColor={CHEF_ORANGE}
              >
                Renew now
              </Button>
              <Button
                mode="outlined"
                onPress={goToBooking}
                disabled={renewLoading}
                style={styles.renewSecondaryBtn}
                textColor={CHEF_ORANGE}
              >
                Change plan
              </Button>
            </View>
          </View>
        ) : null}
        {showMemberSoft ? (
          <View style={styles.renewBanner}>
            <Text style={styles.renewTitle}>Ask your payer to renew</Text>
            <Text style={styles.renewBody}>
              Only the account that pays can renew this plan.
            </Text>
          </View>
        ) : null}
        <View style={styles.card}>
          {items.map((item, index) => (
            <SubscriptionItem
              key={item.label}
              label={item.label}
              value={item.value}
              isLast={index === items.length - 1}
            />
          ))}
        </View>

        {isActiveMember ? null : (
          <>
        <Text style={styles.sectionTitle}>Subscription settings</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingsText}>
            <Text style={styles.settingsLabel}>
              Automatically renew subscription
            </Text>
            <Text style={styles.settingsHint}>
              {showRenew
                ? 'Turning this on does not charge you now — use Renew to pay for another month.'
                : 'Your subscription will renew at the end of the billing period.'}
            </Text>
          </View>
          <Switch
            value={autoRenew}
            onValueChange={handleTogglePress}
            disabled={toggling}
            color={CHEF_ORANGE}
          />
        </View>
          </>
        )}
      </ScrollView>

      <AutoRenewalModal
        visible={modalVisible && !isActiveMember}
        onClose={() => setModalVisible(false)}
        onConfirm={handleModalConfirm}
        loading={toggling}
        isActive={autoRenew}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#101928',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSub: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 24 },
  memberBanner: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: -12,
    marginBottom: 16,
  },
  renewBanner: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  renewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#78350f',
    marginBottom: 8,
  },
  renewBody: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
    marginBottom: 12,
  },
  renewActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
  renewPrimaryBtn: {
    backgroundColor: CHEF_ORANGE,
    borderRadius: 12,
  },
  renewSecondaryBtn: {
    borderRadius: 12,
    borderColor: CHEF_ORANGE,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  settingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsText: { flex: 1, marginRight: 16 },
  settingsLabel: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  settingsHint: { fontSize: 12, color: '#6b7280' },
});
