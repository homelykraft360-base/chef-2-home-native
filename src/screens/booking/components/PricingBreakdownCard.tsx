import { StyleSheet, Text, View } from 'react-native';

import type { LogisticsProps, SubscriptionPlan } from '../../../types';
import {
  computeBookingTotalNaira,
  periodLabel,
} from '../../../utils/booking.helper';
import { formatToReadableNumber } from '../../../utils/string.utils';

function menuLineLabel(plan: SubscriptionPlan): string {
  const titled = plan.name
    .trim()
    .split(/\s+/)
    .map(
      (w) =>
        w.charAt(0).toLocaleUpperCase() + w.slice(1).toLocaleLowerCase(),
    )
    .join(' ');
  return `${titled} plan`;
}

function fmt(n: number) {
  return formatToReadableNumber(n, false);
}

interface Props {
  plan?: SubscriptionPlan;
  logistics: LogisticsProps;
}

export default function PricingBreakdownCard({ plan, logistics }: Props) {
  if (!plan) {
    return (
      <View style={styles.card}>
        <Text style={styles.kicker}>Pricing breakdown</Text>
        <Text style={styles.muted}>Select a plan to see your estimate.</Text>
      </View>
    );
  }

  const billingPeriod = logistics.billingPeriod || 'monthly';
  const weeks = logistics.weeks ?? null;
  const totalNaira = computeBookingTotalNaira(plan, logistics);
  const period = periodLabel(billingPeriod, weeks);

  return (
    <View style={[styles.card, styles.cardElevated]}>
      <Text style={styles.kicker}>Pricing breakdown</Text>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>
          {menuLineLabel(plan)} · {logistics.weeklySessionsCount} day
          {logistics.weeklySessionsCount === 1 ? '' : 's'}/week
        </Text>
        <Text style={styles.rowValue}>
          {totalNaira == null ? '—' : `₦ ${fmt(totalNaira)}`}
        </Text>
      </View>
      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Estimated total</Text>
        <Text style={styles.totalValue}>
          {totalNaira == null ? '—' : `₦ ${fmt(totalNaira)}`}/{period}
        </Text>
      </View>
      {totalNaira == null ? (
        <Text style={styles.hint}>
          Select a covered Lagos area and days (1–5) to see the matrix price.
        </Text>
      ) : null}
      <Text style={styles.disclaimer}>
        Prices come from the plan matrix for your area and days (visit fees
        included). The amount confirmed at checkout applies to your
        subscription.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  cardElevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#475569',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  muted: { fontSize: 14, color: '#6b7280', marginTop: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  rowLabel: { flex: 1, fontSize: 14, color: '#4b5563' },
  rowValue: { fontSize: 14, color: '#4b5563', fontVariant: ['tabular-nums'] },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginBottom: 0,
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#101928' },
  totalValue: { fontSize: 15, fontWeight: '700', color: '#101928' },
  hint: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 17,
    color: '#b45309',
  },
  disclaimer: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 17,
    color: '#6b7280',
  },
});
