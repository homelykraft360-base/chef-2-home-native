import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card } from 'react-native-paper';

import { persistProfileUpdate } from '../../../api/userApi';
import LagosAreaFields from '../../../components/LagosAreaFields';
import {
  CHEF_GREY,
  CHEF_ORANGE,
  ERROR_RED,
  GRAY_600,
} from '../../../constants/theme';
import type { LagosLocation, User } from '../../../types';

interface EditProfileCardProps {
  user: User;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export default function EditProfileCard({
  user,
  onSuccess,
  onError,
}: EditProfileCardProps) {
  const [fullName, setFullName] = useState(
    `${user.firstName} ${user.lastName}`.trim(),
  );
  const [email, setEmail] = useState(user.email ?? '');
  const [streetAddress1, setStreetAddress1] = useState(
    user.address?.streetAddress1 ?? '',
  );
  const [streetAddress2, setStreetAddress2] = useState(
    user.address?.streetAddress2 ?? '',
  );
  const [city, setCity] = useState(user.address?.city ?? '');
  const [visitLocation, setVisitLocation] = useState<LagosLocation | ''>(
    user.address?.visitLocation ?? '',
  );
  const [localArea, setLocalArea] = useState(user.address?.localArea ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) {
      setError('Please enter first and last name.');
      return;
    }
    if (!visitLocation) {
      setError('Select your Lagos area.');
      return;
    }
    if (!localArea) {
      setError('Select your local area.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: err } = await persistProfileUpdate({
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
      email: email.trim(),
      address: {
        streetAddress1: streetAddress1.trim(),
        streetAddress2: streetAddress2.trim(),
        city: city.trim(),
        state: user.address?.state ?? 'lagos',
        visitLocation,
        localArea,
      },
    });
    setLoading(false);
    if (err) {
      setError(typeof err === 'string' ? err : 'Failed to save.');
      onError?.(typeof err === 'string' ? err : 'Failed to save.');
    } else {
      onSuccess?.();
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.cardTitle}>Edit profile</Text>
        <Text style={styles.intro}>
          For the sake of your profile security, we require code verification
          each time you try to change your profile details.
        </Text>
        <View style={styles.field}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor={GRAY_600}
            editable={!loading}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email address"
            placeholderTextColor={GRAY_600}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Street Address 1</Text>
          <TextInput
            style={styles.input}
            value={streetAddress1}
            onChangeText={setStreetAddress1}
            placeholder=""
            placeholderTextColor={GRAY_600}
            editable={!loading}
            maxLength={100}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Street Address 2</Text>
          <TextInput
            style={styles.input}
            value={streetAddress2}
            onChangeText={setStreetAddress2}
            placeholder=""
            placeholderTextColor={GRAY_600}
            editable={!loading}
            maxLength={100}
          />
        </View>
        <LagosAreaFields
          visitLocation={visitLocation}
          localArea={localArea}
          onVisitLocationChange={setVisitLocation}
          onLocalAreaChange={setLocalArea}
          disabled={loading}
        />
        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder=""
              placeholderTextColor={GRAY_600}
              editable={!loading}
              maxLength={50}
            />
          </View>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user.address?.state ?? 'Lagos'}
              placeholder=""
              placeholderTextColor={GRAY_600}
              editable={false}
            />
          </View>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    color: CHEF_GREY,
    marginBottom: 8,
  },
  intro: {
    fontSize: 14,
    color: GRAY_600,
    marginBottom: 20,
    lineHeight: 20,
  },
  field: { marginBottom: 16 },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfField: { flex: 1 },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: CHEF_GREY,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: CHEF_GREY,
  },
  errorText: { color: ERROR_RED, fontSize: 14, marginBottom: 8 },
  saveBtn: {
    backgroundColor: CHEF_ORANGE,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
});
