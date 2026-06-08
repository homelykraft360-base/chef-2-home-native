import { StyleSheet, Text, View } from 'react-native';

import type { LogisticsProps, SubscriptionPlan } from '../../../types';
import {
  computeBookingMonthlyTotalNaira,
  computeVisitFeesNaira,
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
  return `${titled} menu`;
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
        <Text style={styles.muted}>Select a plan to see your monthly estimate.</Text>
      </View>
    );
  }

  const menuAmountNaira = plan.amount / 100;
  const weeklyVisits = logistics.weeklySessionsCount;
  const visitFeesNaira = computeVisitFeesNaira(logistics);
  const visitFeesLabel =
    logistics.location === 'lagos-island'
      ? 'Weekly visits (Lagos Island)'
      : logistics.location === 'lagos-mainland'
        ? 'Weekly visits (Lagos Mainland)'
        : 'Weekly visits';

  const totalNaira = computeBookingMonthlyTotalNaira(plan, logistics);

  return (
    <View style={[styles.card, styles.cardElevated]}>
      <Text style={styles.kicker}>Pricing breakdown</Text>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{menuLineLabel(plan)}</Text>
        <Text style={styles.rowValue}>₦ {fmt(menuAmountNaira)}</Text>
      </View>
      {visitFeesNaira > 0 ? (
        <View style={styles.row}>
          <Text style={styles.rowLabel}>
            {visitFeesLabel} ×{weeklyVisits} weekly
          </Text>
          <Text style={styles.rowValue}>₦ {fmt(visitFeesNaira)}</Text>
        </View>
      ) : null}
      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Estimated monthly</Text>
        <Text style={styles.totalValue}>₦ {fmt(totalNaira)}</Text>
      </View>
      <Text style={styles.disclaimer}>
        Prices may change. This estimate reflects current plan and visit rates;
        the amount confirmed at checkout applies to your subscription. See our
        Terms & Conditions for how we update pricing.
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
  disclaimer: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 17,
    color: '#6b7280',
  },
});
