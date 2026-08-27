import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';

import LagosAreaFields from '../../components/LagosAreaFields';
import { CHEF_ORANGE, ERROR_RED, GRAY_600 } from '../../constants/theme';
import type { LagosLocation } from '../../types';

type AddressMode = 'own' | 'same';

type Props = {
  inviterFirstName: string;
  payerVisitLocation?: LagosLocation | '' | null;
  loading?: boolean;
  error?: string | null;
  onSubmitOwn: (address: {
    streetAddress1: string;
    streetAddress2: string;
    city: string;
    visitLocation: LagosLocation;
    localArea: string;
  }) => void;
  onSubmitSame: () => void;
};

export default function AcceptAddressStep({
  inviterFirstName,
  payerVisitLocation,
  loading,
  error,
  onSubmitOwn,
  onSubmitSame,
}: Props) {
  const [mode, setMode] = useState<AddressMode>('own');
  const [street1, setStreet1] = useState('');
  const [street2, setStreet2] = useState('');
  const [city, setCity] = useState('');
  const [visitLocation, setVisitLocation] = useState<LagosLocation | ''>('');
  const [localArea, setLocalArea] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleOwnSubmit = () => {
    if (!street1.trim()) {
      setValidationError('Street address is required.');
      return;
    }
    if (!city.trim()) {
      setValidationError('City is required.');
      return;
    }
    if (!visitLocation) {
      setValidationError('Select your Lagos area.');
      return;
    }
    if (!localArea) {
      setValidationError('Select your local area.');
      return;
    }
    setValidationError(null);
    onSubmitOwn({
      streetAddress1: street1.trim(),
      streetAddress2: street2.trim(),
      city: city.trim(),
      visitLocation,
      localArea,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Where should we cook?</Text>
        <Text style={styles.body}>
          Choose your own address or use the same address as {inviterFirstName}. You can
          change this later.
        </Text>

        <ModeRadio
          label="Own address"
          helper="We'll cook at your address."
          selected={mode === 'own'}
          onPress={() => setMode('own')}
        />
        <ModeRadio
          label="Same as owner"
          helper={`We'll use ${inviterFirstName}'s current address. If they update it, yours follows.`}
          selected={mode === 'same'}
          onPress={() => setMode('same')}
        />

        {mode === 'own' ? (
          <View style={styles.form}>
            <Text style={styles.label}>Street address</Text>
            <TextInput style={styles.input} value={street1} onChangeText={setStreet1} />
            <Text style={styles.label}>Apartment, suite (optional)</Text>
            <TextInput style={styles.input} value={street2} onChangeText={setStreet2} />
            <LagosAreaFields
              visitLocation={visitLocation}
              localArea={localArea}
              onVisitLocationChange={setVisitLocation}
              onLocalAreaChange={setLocalArea}
              disabled={loading}
              payerVisitLocation={payerVisitLocation}
            />
            <Text style={styles.label}>City</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity} />
            <Text style={styles.label}>State</Text>
            <TextInput style={[styles.input, styles.locked]} value="Lagos" editable={false} />
            <Button
              mode="contained"
              onPress={handleOwnSubmit}
              loading={loading}
              disabled={loading}
              style={styles.cta}
            >
              Join with my address
            </Button>
          </View>
        ) : (
          <Button
            mode="contained"
            onPress={onSubmitSame}
            loading={loading}
            disabled={loading}
            style={styles.cta}
          >
            Use owner's address
          </Button>
        )}

        {validationError || error ? (
          <Text style={styles.error}>{validationError ?? error}</Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ModeRadio({
  label,
  helper,
  selected,
  onPress,
}: {
  label: string;
  helper: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.radioRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <View style={styles.radioTextWrap}>
        <Text style={styles.radioLabel}>{label}</Text>
        <Text style={styles.radioHelper}>{helper}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  heading: { fontSize: 24, fontWeight: '700', color: '#101928', marginBottom: 12 },
  body: { fontSize: 16, color: GRAY_600, marginBottom: 24, lineHeight: 22 },
  radioRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#9ca3af',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: { borderColor: CHEF_ORANGE },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: CHEF_ORANGE,
  },
  radioTextWrap: { flex: 1 },
  radioLabel: { fontSize: 16, fontWeight: '600', color: '#101928' },
  radioHelper: { fontSize: 14, color: GRAY_600, marginTop: 2 },
  form: { marginTop: 8 },
  label: { fontSize: 14, color: GRAY_600, marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  locked: { backgroundColor: '#f3f4f6', color: GRAY_600 },
  cta: { marginTop: 8 },
  error: { color: ERROR_RED, marginTop: 12, fontSize: 14 },
});
