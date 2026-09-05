import { useMemo, useState } from 'react';
import {
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

import {
  householdMemberAreaOptions,
  localAreaLabel,
  localAreasForVisitLocation,
  type LagosLocation,
} from '../constants/lagosAreas';
import { CHEF_GREY, CHEF_ORANGE, GRAY_600 } from '../constants/theme';

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

const AREA_BUTTON_LABELS: Record<LagosLocation, string> = {
  'lagos-all': 'All',
  'lagos-island': 'Island',
  'lagos-mainland': 'Mainland',
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
  const allowedAreas = useMemo(
    () =>
      payerVisitLocation != null && payerVisitLocation !== ''
        ? householdMemberAreaOptions(payerVisitLocation)
        : (['lagos-all', 'lagos-island', 'lagos-mainland'] as LagosLocation[]),
    [payerVisitLocation],
  );
  const localOptions = useMemo(
    () => localAreasForVisitLocation(visitLocation),
    [visitLocation],
  );

  const handleAreaChange = (value: LagosLocation) => {
    onVisitLocationChange(value);
    onLocalAreaChange('');
  };

  return (
    <View style={[isWide && styles.row, isWide && { gap: columnGap }]}>
      <View style={[styles.field, isWide && styles.halfField]}>
        <Text style={styles.label}>Area</Text>
        <View style={styles.segmentRow}>
          {allowedAreas.map((area) => (
            <Button
              key={area}
              mode={visitLocation === area ? 'contained' : 'outlined'}
              onPress={() => handleAreaChange(area)}
              style={styles.segmentBtn}
              compact
              disabled={disabled}
            >
              {AREA_BUTTON_LABELS[area]}
            </Button>
          ))}
        </View>
      </View>

      <View style={[styles.field, isWide && styles.halfField]}>
        <Text style={styles.label}>Local area</Text>
        <TouchableOpacity
          style={[
            styles.selectTrigger,
            (!visitLocation || disabled) && styles.selectTriggerDisabled,
          ]}
          onPress={() => {
            if (!disabled && visitLocation) setPickerOpen(true);
          }}
          disabled={disabled || !visitLocation}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.selectText,
              !localArea && styles.selectPlaceholder,
            ]}
          >
            {localArea
              ? localAreaLabel(visitLocation, localArea)
              : visitLocation
                ? 'Select local area'
                : 'Select area first'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={pickerOpen} transparent animationType="slide">
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Local area</Text>
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
  segmentRow: { flexDirection: 'row', gap: 8 },
  segmentBtn: { flex: 1 },
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
