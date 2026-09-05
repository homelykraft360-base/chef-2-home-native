import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import {
  CHEF_GREEN,
  CHEF_GREY,
  CHEF_ORANGE,
  ERROR_RED,
  GRAY_100,
  GRAY_400,
  GRAY_600,
} from '../constants/theme';
import useGetSupportTicket from '../hooks/useGetSupportTicket';
import useSupportTicketActions from '../hooks/useSupportTicketActions';
import type { RootStackParamList } from '../navigation/types';
import { formatDate } from '../utils/string.utils';

type Route = RouteProp<RootStackParamList, 'SupportTicketDetail'>;

export default function SupportTicketDetailScreen() {
  const { params } = useRoute<Route>();
  const { ticketId } = params;
  const { ticket, loading, error, refetch } = useGetSupportTicket(ticketId);
  const { reply, replyLoading, close, closeLoading } = useSupportTicketActions();
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!error) return;
    Alert.alert('Could not load ticket', error);
  }, [error]);

  const handleReply = useCallback(() => {
    const body = replyText.trim();
    if (!body) {
      Alert.alert('Message required', 'Enter a message before sending.');
      return;
    }
    reply(
      ticketId,
      body,
      () => {
        setReplyText('');
        refetch();
      },
      (err) => Alert.alert('Could not send reply', err),
    );
  }, [reply, replyText, refetch, ticketId]);

  const handleClose = useCallback(() => {
    Alert.alert(
      'Close ticket',
      'Are you sure you want to close this ticket? You can still view the history but cannot send new messages.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close ticket',
          style: 'destructive',
          onPress: () =>
            close(ticketId, () => refetch(), (err) =>
              Alert.alert('Could not close ticket', err),
            ),
        },
      ],
    );
  }, [close, refetch, ticketId]);

  if (loading && !ticket) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={CHEF_ORANGE} />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ticket not found.</Text>
      </View>
    );
  }

  const isOpen = ticket.status === 'open';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{ticket.title}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: isOpen ? '#dcfce7' : GRAY_100 },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isOpen ? CHEF_GREEN : GRAY_600 },
              ]}
            >
              {isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
        <Text style={styles.meta}>Opened {formatDate(ticket.createdAt)}</Text>

        <View style={styles.thread}>
          {ticket.messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.isStaff ? styles.staffBubble : styles.customerBubble,
              ]}
            >
              <Text style={styles.messageAuthor}>{msg.authorName}</Text>
              <Text style={styles.messageBody}>{msg.body}</Text>
              <Text style={styles.messageTime}>{formatDate(msg.createdAt)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {isOpen ? (
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={replyText}
            onChangeText={setReplyText}
            placeholder="Write a reply…"
            placeholderTextColor={GRAY_400}
            multiline
            textAlignVertical="top"
            editable={!replyLoading && !closeLoading}
          />
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={handleClose}
              loading={closeLoading}
              disabled={replyLoading || closeLoading}
              textColor={ERROR_RED}
              style={styles.closeBtn}
            >
              Close ticket
            </Button>
            <Button
              mode="contained"
              onPress={handleReply}
              loading={replyLoading}
              disabled={replyLoading || closeLoading}
              buttonColor={CHEF_ORANGE}
              style={styles.sendBtn}
            >
              Send
            </Button>
          </View>
        </View>
      ) : (
        <View style={styles.closedBanner}>
          <Text style={styles.closedText}>This ticket is closed.</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingBottom: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: ERROR_RED },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: CHEF_GREY },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  meta: { fontSize: 13, color: GRAY_600, marginBottom: 20 },
  thread: { gap: 12 },
  messageBubble: {
    borderRadius: 12,
    padding: 14,
    maxWidth: '95%',
  },
  customerBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  staffBubble: {
    alignSelf: 'flex-start',
    backgroundColor: GRAY_100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageAuthor: { fontSize: 12, fontWeight: '700', color: CHEF_GREY, marginBottom: 4 },
  messageBody: { fontSize: 15, color: CHEF_GREY, lineHeight: 22 },
  messageTime: { fontSize: 11, color: GRAY_600, marginTop: 8 },
  composer: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: CHEF_GREY,
    backgroundColor: '#fafafa',
    marginBottom: 12,
  },
  actions: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  closeBtn: { borderRadius: 12 },
  sendBtn: { borderRadius: 12, minWidth: 100 },
  closedBanner: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
  },
  closedText: { fontSize: 14, color: GRAY_600 },
});
