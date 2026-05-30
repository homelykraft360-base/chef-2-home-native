import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Switch } from 'react-native-paper';

import useGetPreference from '../../hooks/useGetPreference';
import useGetSubscription from '../../hooks/useGetSubscription';
import useToggleAutoRenew from '../../hooks/useToggleAutoRenew';
import { formatDate } from '../../utils/string.utils';
import { capitalizeString } from '../../utils/url.utils';
import { CHEF_ORANGE } from '../../constants/theme';

import AutoRenewalModal from './components/AutoRenewalModal';
import SubscriptionItem from './components/SubscriptionItem';

export default function SubscriptionScreen() {
  const [autoRenew, setAutoRenew] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const { subscription, loading, error } = useGetSubscription();
  const { preference, loading: loadingPreferences } = useGetPreference();
  const { toggleAutoRenewal, loading: toggling } = useToggleAutoRenew();

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

        <Text style={styles.sectionTitle}>Subscription settings</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingsText}>
            <Text style={styles.settingsLabel}>
              Automatically renew subscription
            </Text>
            <Text style={styles.settingsHint}>
              Your subscription will renew at the end of the billing period.
            </Text>
          </View>
          <Switch
            value={autoRenew}
            onValueChange={handleTogglePress}
            disabled={toggling}
            color={CHEF_ORANGE}
          />
        </View>
      </ScrollView>

      <AutoRenewalModal
        visible={modalVisible}
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
