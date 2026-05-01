import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { CHEF_GREEN, CHEF_GREY, GRAY_600 } from '../../../constants/theme';
import type { InvoiceHistoryItem, InvoiceStatus } from '../../../types';
import { formatDateOrdinal, formatToMoney } from '../../../utils/string.utils';

type StatusVisual = {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  bg: string;
  color: string;
  label: string;
};

function statusVisual(status: InvoiceStatus): StatusVisual {
  switch (status) {
    case 'paid':
      return {
        name: 'currency-ngn',
        bg: '#e8f3d4',
        color: CHEF_GREEN,
        label: 'Paid',
      };
    case 'pending':
      return {
        name: 'clock-outline',
        bg: '#fef3c7',
        color: '#b45309',
        label: 'Pending',
      };
    case 'failed':
      return {
        name: 'alert-circle-outline',
        bg: '#fee2e2',
        color: '#b91c1c',
        label: 'Failed',
      };
    case 'canceled':
      return {
        name: 'close-circle-outline',
        bg: '#e2e8f0',
        color: '#475569',
        label: 'Canceled',
      };
    default:
      return {
        name: 'currency-ngn',
        bg: '#e5e7eb',
        color: '#1f2937',
        label: String(status),
      };
  }
}

function isWeeklyIngredientInvoice(item: InvoiceHistoryItem): boolean {
  return item.metaData?.kind === 'weekly_ingredients';
}

function rowTitle(item: InvoiceHistoryItem) {
  if (isWeeklyIngredientInvoice(item)) {
    const week = item.metaData?.week_start;
    return week
      ? `Weekly ingredients · ${week}`
      : 'Weekly ingredients';
  }
  if (item.planName?.trim()) {
    return `${item.planName.trim()} plan subscription`;
  }
  return 'Subscription payment';
}

function rowDate(item: InvoiceHistoryItem) {
  const raw = item.paidAt ?? item.createdAt;
  return formatDateOrdinal(raw as string | Date | undefined);
}

type Props = {
  loading?: boolean;
  invoices: InvoiceHistoryItem[];
};

export default function PaymentHistory({ loading, invoices }: Props) {
  const navigation = useNavigation();
  if (loading) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text style={styles.title}>Payment history</Text>
          <View style={styles.loadingBox}>
            <ActivityIndicator color={CHEF_GREEN} />
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Text style={styles.title}>Payment history</Text>

        {invoices.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name="currency-ngn"
                size={28}
                color="#475569"
              />
            </View>
            <Text style={styles.emptyText}>No payment history</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {invoices.map((item, index) => {
              const v = statusVisual(item.status);
              const ingredientReceipt =
                isWeeklyIngredientInvoice(item) && item.status === 'paid';
              const RowWrapper: typeof TouchableOpacity | typeof View =
                ingredientReceipt ? TouchableOpacity : View;
              return (
                <RowWrapper
                  key={item.id}
                  style={[styles.row, index > 0 && styles.rowBorder]}
                  accessibilityLabel={`${rowTitle(item)} — ${v.label}`}
                  onPress={
                    ingredientReceipt
                      ? () =>
                          (
                            navigation as unknown as {
                              navigate: (
                                name: 'IngredientReceipt',
                                params: { invoiceId: number },
                              ) => void;
                            }
                          ).navigate('IngredientReceipt', { invoiceId: item.id })
                      : undefined
                  }
                >
                  <View style={[styles.rowIcon, { backgroundColor: v.bg }]}>
                    <MaterialCommunityIcons
                      name={v.name}
                      size={20}
                      color={v.color}
                    />
                  </View>
                  <View style={styles.rowMid}>
                    <Text style={styles.rowTitle}>{rowTitle(item)}</Text>
                    <Text style={styles.rowDate}>{rowDate(item)}</Text>
                  </View>
                  <Text style={styles.rowAmount}>
                    {formatToMoney(item.amount / 100, false)}
                  </Text>
                </RowWrapper>
              );
            })}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, overflow: 'hidden' },
  cardContent: { padding: 20 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: CHEF_GREY,
    marginBottom: 20,
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748b',
  },
  list: { backgroundColor: 'transparent' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMid: { flex: 1, minWidth: 0 },
  rowTitle: {
    fontWeight: '600',
    color: CHEF_GREY,
    fontSize: 15,
  },
  rowDate: { fontSize: 13, color: GRAY_600, marginTop: 2 },
  rowAmount: {
    fontWeight: '600',
    color: CHEF_GREY,
    fontSize: 15,
    textAlign: 'right',
  },
});
