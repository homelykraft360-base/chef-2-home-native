import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card, Icon } from 'react-native-paper';

import { CHEF_ORANGE, CHEF_GREY, GRAY_600 } from '../constants/theme';
import type { PendingInvite } from '../types';

export default function PendingInviteHomeCard({
  invite,
  loading,
  onPress,
}: {
  invite: PendingInvite;
  loading?: boolean;
  onPress: () => void;
}) {
  if (loading) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.loading}>
          <ActivityIndicator size="small" color={CHEF_ORANGE} />
        </Card.Content>
      </Card>
    );
  }

  const title =
    invite.step === 'address'
      ? 'Finish joining the household'
      : 'You have a household invite';

  const subtitle =
    invite.step === 'address'
      ? `${invite.inviterFirstName} invited you to ${invite.planName}. Choose your address to finish.`
      : `${invite.inviterFirstName} invited you to join ${invite.planName}.`;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card style={[styles.card, styles.accent]}>
        <Card.Content style={styles.content}>
          <View style={styles.iconWrap}>
            <Icon source="email-open" size={22} color={CHEF_ORANGE} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.sub}>{subtitle}</Text>
          </View>
          <Icon source="chevron-right" size={24} color={GRAY_600} />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  accent: {
    borderColor: CHEF_ORANGE,
    backgroundColor: '#fff8f0',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  loading: {
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1, minWidth: 0 },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: CHEF_GREY,
    marginBottom: 4,
  },
  sub: { fontSize: 13, color: GRAY_600, lineHeight: 18 },
});
