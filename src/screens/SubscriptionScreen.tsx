import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Switch } from 'react-native-paper';

import useGetPreference from '../hooks/useGetPreference';
import useGetSubscription from '../hooks/useGetSubscription';
import useToggleAutoRenew from '../hooks/useToggleAutoRenew';
import { formatDate } from '../utils/string.utils';
import { capitalizeString } from '../utils/url.utils';

export default function SubscriptionScreen() {
  const { subscription, loading, error } = useGetSubscription();
  const { preference } = useGetPreference();
  const { toggleAutoRenewal, loading: toggling } = useToggleAutoRenew();
  const [autoRenew, setAutoRenew] = useState(true);

  useEffect(() => {
    if (subscription) setAutoRenew(subscription.autoRenewal);
  }, [subscription]);

  const handleToggle = useCallback(() => {
    toggleAutoRenewal({
      onSuccess: (sub) => {
        setAutoRenew(sub?.autoRenewal ?? !autoRenew);
      },
      onError: () => {},
    });
  }, [autoRenew, toggleAutoRenewal]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (error || !subscription) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {error ?? 'No active subscription'}
        </Text>
      </View>
    );
  }

  const plan = subscription.subscriptionPlan;
  const visitDays = subscription.visitingDays
    ? Object.values(subscription.visitingDays).map(capitalizeString).join(', ')
    : '--';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Subscription details</Text>
      <View style={styles.card}>
        <Row label="Plan" value={capitalizeString(plan.name)} />
        <Row label="Start date" value={formatDate(subscription.lastPaid)} />
        <Row label="End date" value={formatDate(subscription.expiresAt)} />
        <Row
          label="Frequency"
          value={`${plan.frequency} times ${plan.interval}`}
        />
        <Row label="Visit days" value={visitDays} />
        <Row label="Allergies" value={subscription.allergies || 'None'} />
        <Row
          label="Dietary restrictions"
          value={preference?.dietaryRestrictions || 'None'}
        />
      </View>
      <Text style={styles.sectionTitle}>Subscription settings</Text>
      <View style={styles.cardRow}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Auto-renew</Text>
          <Text style={styles.hint}>
            Your subscription will renew at the end of the billing period.
          </Text>
        </View>
        <Switch
          value={autoRenew}
          onValueChange={handleToggle}
          disabled={toggling}
          color="#e65100"
        />
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  errorText: { color: '#b00020', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  row: { marginBottom: 12 },
  rowLabel: { fontSize: 12, color: '#666', marginBottom: 2 },
  rowValue: { fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  flex1: { flex: 1 },
  label: { fontWeight: '600', marginBottom: 4 },
  hint: { fontSize: 12, color: '#666' },
});
