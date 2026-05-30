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
import useGetPreference from '../../hooks/useGetPreference';
import { CHEF_ORANGE, GRAY_400, GRAY_600 } from '../../constants/theme';

interface PreferencesTabProps {
  onSaved?: () => void;
}

export default function PreferencesTab({ onSaved }: PreferencesTabProps) {
  const { preference, loading: prefLoading } = useGetPreference();

  const [emailNotifications, setEmailNotifications] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [cookingPreferences, setCookingPreferences] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [savingNotification, setSavingNotification] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);

  useEffect(() => {
    if (preference) {
      setEmailNotifications(preference.emailNotifications ?? false);
      setAllergies(preference.allergies ?? '');
      setDietaryRestrictions(preference.dietaryRestrictions ?? '');
      setCookingPreferences(preference.cookingPreferences ?? '');
      setAdditionalNotes(preference.additionalNotes ?? '');
    }
  }, [preference]);

  const handleNotificationToggle = async (value: boolean) => {
    setEmailNotifications(value);
    setSavingNotification(true);
    const { error } = await persistPreferenceUpdate({
      emailNotifications: value,
      allergies,
      cookingPreferences,
      dietaryRestrictions,
      additionalNotes,
    });
    setSavingNotification(false);
    if (!error) onSaved?.();
  };

  const handleSaveBookingPrefs = async () => {
    setSavingBooking(true);
    const { error } = await persistPreferenceUpdate({
      emailNotifications,
      allergies,
      dietaryRestrictions,
      cookingPreferences,
      additionalNotes,
    });
    setSavingBooking(false);
    if (!error) onSaved?.();
  };

  if (prefLoading) {
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

      {/* 2. Booking preferences */}
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
              placeholderTextColor={GRAY_400}
              multiline
              numberOfLines={4}
              maxLength={300}
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
              placeholderTextColor={GRAY_400}
              multiline
              numberOfLines={4}
              maxLength={300}
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
              placeholderTextColor={GRAY_400}
              multiline
              numberOfLines={4}
              maxLength={300}
              editable={!savingBooking}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Additional notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
              placeholder="Is there anything else you think we should know?"
              placeholderTextColor={GRAY_400}
              multiline
              numberOfLines={4}
              maxLength={300}
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
  saveBtn: {
    backgroundColor: CHEF_ORANGE,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
});
