import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';

import { CHEF_GREY, CHEF_ORANGE, GRAY_600 } from '../constants/theme';
import useServiceZones from '../hooks/useServiceZones';
import type { LagosLocation } from '../types';
import {
  householdMemberAreaOptions,
  localAreaLabel,
  localAreasForZone,
  zoneOptions,
} from '../utils/serviceZones.utils';

const WIDE_LAYOUT_MIN_WIDTH = 640;

type Props = {
  visitLocation: LagosLocation | '';
  localArea: string;
  onVisitLocationChange: (value: LagosLocation | '') => void;
  onLocalAreaChange: (value: string) => void;
  disabled?: boolean;
  payerVisitLocation?: LagosLocation | '' | null;
  /** Horizontal gap between columns on wide layouts — match city/state row (16 or 12). */
  columnGap?: number;
};

export default function LagosAreaFields({
  visitLocation,
  localArea,
  onVisitLocationChange,
  onLocalAreaChange,
  disabled,
  payerVisitLocation,
  columnGap = 16,
}: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_LAYOUT_MIN_WIDTH;
  const [pickerOpen, setPickerOpen] = useState(false);
  const { zones, loading, error, refetch } = useServiceZones();
  const fieldsDisabled = disabled || loading;
  const allowedAreas = useMemo(
    () =>
      payerVisitLocation != null && payerVisitLocation !== ''
        ? householdMemberAreaOptions(zones, payerVisitLocation)
        : zoneOptions(zones),
    [zones, payerVisitLocation],
  );
  const localOptions = useMemo(
    () => localAreasForZone(zones, visitLocation),
    [zones, visitLocation],
  );

  const handleAreaChange = (value: LagosLocation) => {
    onVisitLocationChange(value);
    onLocalAreaChange('');
  };

  return (
    <View style={[isWide && styles.row, isWide && { gap: columnGap }]}>
      <View style={[styles.field, isWide && styles.halfField]}>
        <Text style={styles.label}>Area</Text>
        {loading ? (
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color={CHEF_ORANGE} />
            <Text style={styles.statusText}>Loading areas…</Text>
          </View>
        ) : null}
        {error ? (
          <View style={styles.statusRow}>
            <Text style={styles.errorText}>Could not load service areas.</Text>
            <Button compact mode="text" onPress={refetch}>
              Retry
            </Button>
          </View>
        ) : null}
        <View style={styles.segmentRow}>
          {allowedAreas.map((area) => (
            <Button
              key={area.value}
              mode={visitLocation === area.value ? 'contained' : 'outlined'}
              onPress={() => handleAreaChange(area.value)}
              style={styles.segmentBtn}
              compact
              disabled={fieldsDisabled}
            >
              {area.label}
            </Button>
          ))}
        </View>
      </View>

      <View style={[styles.field, isWide && styles.halfField]}>
        <Text style={styles.label}>Area / LGA</Text>
        <TouchableOpacity
          style={[
            styles.selectTrigger,
            (!visitLocation || fieldsDisabled) && styles.selectTriggerDisabled,
          ]}
          onPress={() => {
            if (!fieldsDisabled && visitLocation) setPickerOpen(true);
          }}
          disabled={fieldsDisabled || !visitLocation}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.selectText,
              !localArea && styles.selectPlaceholder,
            ]}
          >
            {localArea
              ? localAreaLabel(zones, visitLocation, localArea)
              : visitLocation
                ? 'Select Area / LGA'
                : 'Select area first'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={pickerOpen} transparent animationType="slide">
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Area / LGA</Text>
          <ScrollView style={styles.modalList}>
            {localOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.modalOption}
                onPress={() => {
                  onLocalAreaChange(opt.value);
                  setPickerOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    localArea === opt.value && styles.modalOptionSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  field: {
    marginBottom: 16,
  },
  halfField: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: CHEF_GREY,
    marginBottom: 6,
  },
  segmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segmentBtn: { flexGrow: 1 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusText: { fontSize: 13, color: GRAY_600 },
  errorText: { fontSize: 13, color: '#dc2626' },
  selectTrigger: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  selectTriggerDisabled: {
    backgroundColor: '#f3f4f6',
  },
  selectText: { fontSize: 16, color: CHEF_GREY },
  selectPlaceholder: { color: GRAY_600 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '55%',
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CHEF_GREY,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  modalList: { paddingHorizontal: 8 },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  modalOptionText: { fontSize: 16, color: CHEF_GREY },
  modalOptionSelected: { color: CHEF_ORANGE, fontWeight: '600' },
});
