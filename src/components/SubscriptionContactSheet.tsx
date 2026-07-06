import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';

import { persistProfileUpdate } from '../api/userApi';
import {
  CHEF_GREY,
  CHEF_ORANGE,
  ERROR_RED,
  GRAY_100,
  GRAY_400,
  GRAY_600,
} from '../constants/theme';
import type { User } from '../types';

type Props = {
  visible: boolean;
  user: User;
  onClose: () => void;
  onSaved: () => void;
};

export default function SubscriptionContactSheet({
  visible,
  user,
  onClose,
  onSaved,
}: Props) {
  const [phone, setPhone] = useState('');
  const [streetAddress1, setStreetAddress1] = useState('');
  const [streetAddress2, setStreetAddress2] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setPhone(user.phoneNumber?.replace(/^\+234\s?/, '').replace(/\D/g, '') ?? '');
    setStreetAddress1(user.address?.streetAddress1 ?? '');
    setStreetAddress2(user.address?.streetAddress2 ?? '');
    setCity(user.address?.city ?? '');
    setError(null);
  }, [visible, user]);

  const handleSave = async () => {
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setError('Enter a valid Nigerian phone number (10–11 digits).');
      return;
    }
    if (!streetAddress1.trim()) {
      setError('Street address is required.');
      return;
    }
    if (!city.trim()) {
      setError('City is required.');
      return;
    }

    setError(null);
    setLoading(true);
    const { error: err } = await persistProfileUpdate({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: phoneDigits,
      address: {
        streetAddress1: streetAddress1.trim(),
        streetAddress2: streetAddress2.trim(),
        city: city.trim(),
        state: user.address?.state?.trim() || 'lagos',
      },
    });
    setLoading(false);

    if (err) {
      setError(typeof err === 'string' ? err : 'Could not save your details.');
      return;
    }
    onSaved();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Contact & delivery details</Text>
          <Text style={styles.hint}>
            Add your phone number and address before completing your subscription.
          </Text>

          <Text style={styles.label}>Phone number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>+234</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 11))}
              placeholder="812 345 6789"
              placeholderTextColor={GRAY_400}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          <Text style={styles.label}>Street address</Text>
          <TextInput
            style={styles.input}
            value={streetAddress1}
            onChangeText={setStreetAddress1}
            placeholder="House number and street"
            placeholderTextColor={GRAY_400}
            editable={!loading}
            maxLength={100}
          />

          <Text style={styles.label}>Street address 2 (optional)</Text>
          <TextInput
            style={styles.input}
            value={streetAddress2}
            onChangeText={setStreetAddress2}
            placeholder="Apartment, estate, landmark"
            placeholderTextColor={GRAY_400}
            editable={!loading}
            maxLength={100}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor={GRAY_400}
                editable={!loading}
                maxLength={50}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user.address?.state || 'Lagos'}
                editable={false}
              />
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            buttonColor={CHEF_ORANGE}
            style={styles.saveBtn}
          >
            Save and continue
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '90%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: CHEF_GREY,
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: GRAY_600,
    lineHeight: 18,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: CHEF_GREY,
    marginBottom: 6,
    marginTop: 8,
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
  prefixText: { fontSize: 16, color: CHEF_GREY },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: CHEF_GREY,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: CHEF_GREY,
    backgroundColor: '#fafafa',
  },
  inputDisabled: { backgroundColor: GRAY_100, color: GRAY_600 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  error: { color: ERROR_RED, fontSize: 14, marginTop: 12 },
  saveBtn: { marginTop: 20, borderRadius: 12 },
});
