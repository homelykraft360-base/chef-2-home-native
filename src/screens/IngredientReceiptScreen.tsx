import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { fetchInvoiceIngredientBreakdown } from '../api/mealPlanIngredientsApi';
import {
  CHEF_GREEN,
  CHEF_GREY,
  CHEF_ORANGE,
  ERROR_RED,
  GRAY_100,
  GRAY_400,
  GRAY_600,
} from '../constants/theme';
import type { InvoiceIngredientBreakdown, InvoiceIngredientLine } from '../types';
import { formatToMoney } from '../utils/string.utils';

type IngredientReceiptParams = {
  IngredientReceipt: { invoiceId: number };
};

function dayLabel(day: string) {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

type GroupedMeal = {
  key: string;
  mealId: number;
  mealName: string;
  dayOfWeek: string;
  lines: InvoiceIngredientLine[];
  subtotal: number;
};

function groupByMeal(lines: InvoiceIngredientLine[]): GroupedMeal[] {
  const map = new Map<string, GroupedMeal>();
  for (const line of lines) {
    const key = `${line.dayOfWeek}:${line.mealId}`;
    let group = map.get(key);
    if (!group) {
      group = {
        key,
        mealId: line.mealId,
        mealName: line.mealName,
        dayOfWeek: line.dayOfWeek,
        lines: [],
        subtotal: 0,
      };
      map.set(key, group);
    }
    group.lines.push(line);
    if (!line.wasExcluded) group.subtotal += line.lineTotalKobo;
  }
  return Array.from(map.values());
}

export default function IngredientReceiptScreen() {
  const route = useRoute<RouteProp<IngredientReceiptParams, 'IngredientReceipt'>>();
  const { invoiceId } = route.params ?? { invoiceId: 0 };
  const [breakdown, setBreakdown] = useState<InvoiceIngredientBreakdown | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { breakdown: data, error: err } =
        await fetchInvoiceIngredientBreakdown(invoiceId);
      if (cancelled) return;
      if (err) setError(String(err));
      else setBreakdown(data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  if (loading || !breakdown) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={CHEF_ORANGE} />
      </View>
    );
  }

  if (!breakdown.lines.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No breakdown available</Text>
        <Text style={styles.emptyBody}>
          This invoice was not for weekly ingredients.
        </Text>
      </View>
    );
  }

  const groups = groupByMeal(breakdown.lines);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {error && <Text style={styles.errorBanner}>{error}</Text>}
      <View style={styles.headerCard}>
        <Text style={styles.headerLabel}>Receipt</Text>
        <Text style={styles.headerAmount}>
          {formatToMoney((breakdown.amount / 100).toFixed(2))}
        </Text>
        {breakdown.weekStart && (
          <Text style={styles.headerMeta}>Week of {breakdown.weekStart}</Text>
        )}
        {breakdown.paidAt && (
          <Text style={styles.headerMeta}>Paid {breakdown.paidAt}</Text>
        )}
      </View>

      {groups.map((group) => (
        <View key={group.key} style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mealDay}>{dayLabel(group.dayOfWeek)}</Text>
              <Text style={styles.mealName}>{group.mealName}</Text>
            </View>
            <Text style={styles.mealSubtotal}>
              {formatToMoney((group.subtotal / 100).toFixed(2))}
            </Text>
          </View>
          {group.lines.map((line) => (
            <View key={line.id} style={styles.line}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.ingredientName,
                    line.wasExcluded && styles.struck,
                  ]}
                >
                  {line.ingredientName}
                </Text>
                <Text style={styles.ingredientMeta}>
                  {line.quantity} {line.unit ?? ''} ·{' '}
                  {formatToMoney((line.unitCostKobo / 100).toFixed(2))}/
                  {line.unit ?? 'unit'}
                  {line.wasExcluded && line.exclusionReason
                    ? ` · ${
                        line.exclusionReason === 'have'
                          ? 'You had it'
                          : 'You sourced it'
                      }`
                    : ''}
                </Text>
              </View>
              <Text
                style={[styles.linePrice, line.wasExcluded && styles.struck]}
              >
                {formatToMoney((line.lineTotalKobo / 100).toFixed(2))}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 16, paddingBottom: 40 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: CHEF_GREY,
    marginBottom: 8,
  },
  emptyBody: { color: GRAY_600, textAlign: 'center' },
  headerCard: {
    backgroundColor: GRAY_100,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  headerLabel: { color: GRAY_600, fontSize: 12 },
  headerAmount: {
    color: CHEF_ORANGE,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  headerMeta: { color: GRAY_600, fontSize: 12, marginTop: 2 },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mealDay: { color: GRAY_600, fontSize: 12 },
  mealName: { fontSize: 16, fontWeight: '600', color: CHEF_GREY },
  mealSubtotal: { fontSize: 14, fontWeight: '600', color: CHEF_GREEN },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  ingredientName: { color: CHEF_GREY, fontWeight: '500' },
  ingredientMeta: { color: GRAY_600, fontSize: 12, marginTop: 2 },
  linePrice: {
    color: CHEF_GREY,
    fontVariant: ['tabular-nums'],
    minWidth: 80,
    textAlign: 'right',
  },
  struck: {
    color: GRAY_400,
    textDecorationLine: 'line-through',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    color: ERROR_RED,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
});
