import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button, Card, Switch } from 'react-native-paper';

import { persistPreferenceUpdate } from '../../api/preferenceApi';
import { persistProfileUpdate } from '../../api/userApi';
import useGetCurrentUserDetails from '../../hooks/useGetCurrentUserDetails';
import useGetPreference from '../../hooks/useGetPreference';
import { CHEF_ORANGE, GRAY_100, GRAY_600 } from '../../constants/theme';

export default function PreferencesTab() {
  const { user, loading: userLoading } = useGetCurrentUserDetails();
  const { preference, loading: prefLoading } = useGetPreference();

  const [emailNotifications, setEmailNotifications] = useState(false);
  const [contactPhone, setContactPhone] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [allergies, setAllergies] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [cookingPreferences, setCookingPreferences] = useState('');

  const [savingNotification, setSavingNotification] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);

  useEffect(() => {
    if (preference) {
      setEmailNotifications(preference.emailNotifications ?? false);
      setAllergies(preference.allergies ?? '');
      setDietaryRestrictions(preference.dietaryRestrictions ?? '');
      setCookingPreferences(preference.cookingPreferences ?? '');
    }
  }, [preference]);

  useEffect(() => {
    if (user?.address) {
      setContactPhone(user.phoneNumber?.replace(/^\+234\s?/, '') ?? '');
      setState(user.address.state ?? '');
      setCity(user.address.city ?? '');
      const parts = [
        user.address.streetAddress1,
        user.address.streetAddress2,
      ].filter(Boolean);
      setHomeAddress(parts.length ? parts.join('\n') : '');
    }
  }, [user]);

  const handleNotificationToggle = async (value: boolean) => {
    setEmailNotifications(value);
    setSavingNotification(true);
    await persistPreferenceUpdate({
      emailNotifications: value,
      allergies,
      cookingPreferences,
      dietaryRestrictions,
      additionalNotes: preference?.additionalNotes,
    });
    setSavingNotification(false);
  };

  const handleSaveContact = async () => {
    if (!user) return;
    setSavingContact(true);
    const lines = homeAddress.split('\n').map((s) => s.trim()).filter(Boolean);
    const streetAddress1 = lines[0] ?? '';
    const streetAddress2 = lines.slice(1).join(', ') ?? '';
    await persistProfileUpdate({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email ?? '',
      address: {
        streetAddress1,
        streetAddress2,
        city: city ?? user.address?.city ?? '',
        state: state ?? user.address?.state ?? '',
      },
    });
    setSavingContact(false);
  };

  const handleSaveBookingPrefs = async () => {
    setSavingBooking(true);
    await persistPreferenceUpdate({
      emailNotifications,
      allergies,
      dietaryRestrictions,
      cookingPreferences,
      additionalNotes: preference?.additionalNotes,
    });
    setSavingBooking(false);
  };

  if (userLoading || prefLoading) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Notification preferences */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Notification preferences</Text>
          <View style={styles.notificationRow}>
            <View style={styles.notificationText}>
              <Text style={styles.subtitle}>Email notifications</Text>
              <Text style={styles.intro}>
                We'll send you updates on this like subscription status and
                scheduled visits via email.
              </Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={handleNotificationToggle}
              color={CHEF_ORANGE}
              disabled={savingNotification}
            />
          </View>
        </Card.Content>
      </Card>

      {/* 2. Booking contact information */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Booking contact information</Text>
          <Text style={styles.intro}>
            Set the address and phone number for your bookings. If possible,
            please provide your WhatsApp phone number.
          </Text>
          <View style={styles.field}>
            <Text style={styles.label}>Contact phone number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.prefix}>
                <Text style={styles.prefixText}>+234</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                value={contactPhone}
                onChangeText={(t) =>
                  setContactPhone(t.replace(/\D/g, '').slice(0, 10))
                }
                placeholder="812 345 6789"
                placeholderTextColor={GRAY_600}
                keyboardType="phone-pad"
                editable={!savingContact}
              />
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>State of residence</Text>
            <TextInput
              style={styles.input}
              value={state}
              onChangeText={setState}
              placeholder="e.g. Lagos"
              placeholderTextColor={GRAY_600}
              editable={!savingContact}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="e.g. Eti-Osa"
              placeholderTextColor={GRAY_600}
              editable={!savingContact}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Home address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={homeAddress}
              onChangeText={setHomeAddress}
              placeholder="Street, area, city"
              placeholderTextColor={GRAY_600}
              multiline
              numberOfLines={3}
              editable={!savingContact}
            />
          </View>
          <Button
            mode="contained"
            onPress={handleSaveContact}
            loading={savingContact}
            disabled={savingContact}
            style={styles.saveBtn}
          >
            Save changes
          </Button>
        </Card.Content>
      </Card>

      {/* 3. Booking preferences */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Booking preferences</Text>
          <Text style={styles.intro}>
            Updates you make here will be used across your bookings with us.
          </Text>
          <View style={styles.field}>
            <Text style={styles.label}>Food allergies</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={allergies}
              onChangeText={setAllergies}
              placeholder="Are there any allergies your chef should keep in mind?"
              placeholderTextColor={GRAY_600}
              multiline
              numberOfLines={4}
              editable={!savingBooking}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Dietary restrictions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={dietaryRestrictions}
              onChangeText={setDietaryRestrictions}
              placeholder="Do you or anyone in your household have special dietary needs?"
              placeholderTextColor={GRAY_600}
              multiline
              numberOfLines={4}
              editable={!savingBooking}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Cooking preferences</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={cookingPreferences}
              onChangeText={setCookingPreferences}
              placeholder="Do you have any cooking preferences?"
              placeholderTextColor={GRAY_600}
              multiline
              numberOfLines={4}
              editable={!savingBooking}
            />
          </View>
          <Button
            mode="contained"
            onPress={handleSaveBookingPrefs}
            loading={savingBooking}
            disabled={savingBooking}
            style={styles.saveBtn}
          >
            Save changes
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 24, paddingBottom: 48 },
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
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationText: { flex: 1, marginRight: 16 },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#101928',
    marginBottom: 4,
  },
  field: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#101928',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#101928',
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
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
  saveBtn: {
    backgroundColor: CHEF_ORANGE,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
});
