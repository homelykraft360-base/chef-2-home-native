import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, Icon } from 'react-native-paper';

import { CHEF_ORANGE, GRAY_100, GRAY_600 } from '../../../constants/theme';
import type { User } from '../../../types';

interface ChangePhoneCardProps {
  user: User;
}

export default function ChangePhoneCard({ user }: ChangePhoneCardProps) {
  const [phone, setPhone] = useState(
    user.phoneNumber?.replace(/^\+234\s?/, '') ?? '',
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // TODO: wire to change-phone + OTP flow when API is available
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.cardTitle}>Change phone number</Text>
        <Text style={styles.intro}>
          Change the phone number you use to log in to your account.
        </Text>
        <View style={styles.field}>
          <Text style={styles.label}>Phone number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>+234</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
              placeholder="812 345 6789"
              placeholderTextColor={GRAY_600}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>
        </View>
        <View style={styles.hintRow}>
          <Icon source="information-outline" size={16} color={GRAY_600} />
          <Text style={styles.hintText}>
            We'll send a code to verify this number.
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveBtn}
        >
          Save changes
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#101928',
    marginBottom: 8,
  },
  intro: {
    fontSize: 14,
    color: GRAY_600,
    marginBottom: 20,
    lineHeight: 20,
  },
  field: { marginBottom: 12 },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#101928',
    marginBottom: 6,
  },
  phoneRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
  },
  prefix: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    backgroundColor: GRAY_100,
  },
  prefixText: { fontSize: 16, color: '#101928' },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#101928',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  hintText: { fontSize: 13, color: GRAY_600 },
  saveBtn: {
    backgroundColor: CHEF_ORANGE,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
});
