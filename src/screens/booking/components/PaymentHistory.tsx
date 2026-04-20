import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CHEF_GREEN, CHEF_GREY, GRAY_600 } from '../../../constants/theme';
import type { InvoiceHistoryItem, InvoiceStatus } from '../../../types';
import { formatDateOrdinal, formatToMoney } from '../../../utils/string.utils';

function statusLabel(status: InvoiceStatus): string {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    case 'canceled':
      return 'Canceled';
    default:
      return status;
  }
}

function statusColors(status: InvoiceStatus): { bg: string; text: string } {
  switch (status) {
    case 'paid':
      return { bg: '#d1fae5', text: '#065f46' };
    case 'pending':
      return { bg: '#fef3c7', text: '#92400e' };
    case 'failed':
      return { bg: '#fee2e2', text: '#991b1b' };
    case 'canceled':
      return { bg: '#e2e8f0', text: '#334155' };
    default:
      return { bg: '#e5e7eb', text: '#1f2937' };
  }
}

function rowTitle(item: InvoiceHistoryItem) {
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
  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.title}>Payment history</Text>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={CHEF_GREEN} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Payment history</Text>

      {invoices.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>₦</Text>
          </View>
          <Text style={styles.emptyText}>No payment history</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {invoices.map((item, index) => {
            const badge = statusColors(item.status);
            return (
              <View
                key={item.id}
                style={[
                  styles.row,
                  index > 0 && styles.rowBorder,
                ]}
              >
                <View style={styles.rowIcon}>
                  <Text style={styles.rowIconText}>₦</Text>
                </View>
                <View style={styles.rowMid}>
                  <Text style={styles.rowTitle}>{rowTitle(item)}</Text>
                  <View style={styles.rowMeta}>
                    <Text style={styles.rowDate}>{rowDate(item)}</Text>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.text }]}>
                        {statusLabel(item.status)}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.rowAmount}>
                  {formatToMoney(item.amount / 100, false)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#f7f7f7',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
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
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(148, 163, 184, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#475569',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  list: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8f3d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: CHEF_GREEN,
  },
  rowMid: { flex: 1, minWidth: 0 },
  rowTitle: {
    fontWeight: '600',
    color: CHEF_GREY,
    fontSize: 15,
  },
  rowMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  rowDate: { fontSize: 13, color: GRAY_600 },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  rowAmount: {
    fontWeight: '600',
    color: CHEF_GREY,
    fontSize: 15,
    textAlign: 'right',
  },
});
