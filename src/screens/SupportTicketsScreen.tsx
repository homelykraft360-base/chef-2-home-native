import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CreateSupportTicketSheet from '../components/CreateSupportTicketSheet';
import {
  CHEF_GREEN,
  CHEF_GREY,
  CHEF_ORANGE,
  GRAY_100,
  GRAY_600,
} from '../constants/theme';
import useCreateSupportTicket from '../hooks/useCreateSupportTicket';
import useGetSupportTickets from '../hooks/useGetSupportTickets';
import type { RootStackParamList } from '../navigation/types';
import type { TicketStatus } from '../types';
import { formatDate } from '../utils/string.utils';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FILTERS: { label: string; value: TicketStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
];

function statusStyle(status: TicketStatus) {
  return status === 'open'
    ? { bg: '#dcfce7', color: CHEF_GREEN, label: 'Open' }
    : { bg: GRAY_100, color: GRAY_600, label: 'Closed' };
}

export default function SupportTicketsScreen() {
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<TicketStatus | 'all'>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const statusParam = filter === 'all' ? undefined : filter;
  const { tickets, loading, error, refetch } = useGetSupportTickets(statusParam);
  const { loading: creating, createTicket } = useCreateSupportTicket();

  useEffect(() => {
    if (!error) return;
    Alert.alert('Could not load tickets', error);
  }, [error]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleCreate = (title: string, message: string) => {
    createTicket({
      payload: { title, message },
      onSuccess: (ticket) => {
        setSheetOpen(false);
        refetch();
        navigation.navigate('SupportTicketDetail', { ticketId: ticket.id });
      },
      onError: (err) => Alert.alert('Could not create ticket', err),
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={CHEF_ORANGE}
            colors={[CHEF_ORANGE]}
          />
        }
      >
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
              onPress={() => setFilter(f.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === f.value && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && tickets.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={CHEF_ORANGE} />
            <Text style={styles.loadingText}>Loading tickets…</Text>
          </View>
        ) : tickets.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No tickets yet</Text>
            <Text style={styles.emptySub}>
              Need help? Create a ticket and our team will get back to you.
            </Text>
          </View>
        ) : (
          tickets.map((ticket) => {
            const badge = statusStyle(ticket.status);
            return (
              <TouchableOpacity
                key={ticket.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate('SupportTicketDetail', { ticketId: ticket.id })
                }
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {ticket.title}
                  </Text>
                  <View style={styles.cardBadges}>
                    {ticket.hasUnread ? <View style={styles.unreadDot} /> : null}
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.cardMeta}>
                  {ticket.messageCount} message{ticket.messageCount === 1 ? '' : 's'} · Updated{' '}
                  {formatDate(ticket.updatedAt)}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => setSheetOpen(true)}
          buttonColor={CHEF_ORANGE}
          style={styles.createBtn}
        >
          Create ticket
        </Button>
      </View>

      <CreateSupportTicketSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleCreate}
        loading={creating}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingBottom: 100 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: GRAY_100,
  },
  filterChipActive: { backgroundColor: CHEF_ORANGE },
  filterChipText: { fontSize: 14, fontWeight: '600', color: GRAY_600 },
  filterChipTextActive: { color: '#fff' },
  centered: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  loadingText: { color: GRAY_600 },
  empty: { paddingVertical: 48, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: CHEF_GREY },
  emptySub: { fontSize: 14, color: GRAY_600, textAlign: 'center', lineHeight: 20 },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: CHEF_GREY },
  cardBadges: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CHEF_ORANGE,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardMeta: { fontSize: 13, color: GRAY_600 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  createBtn: { borderRadius: 12 },
});
