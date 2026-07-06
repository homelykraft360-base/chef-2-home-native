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

import {
  CHEF_GREY,
  CHEF_ORANGE,
  GRAY_400,
  GRAY_600,
} from '../constants/theme';

type Props = {
  visible: boolean;
  value: string;
  onChange: (text: string) => void;
  onClose: () => void;
  readOnly?: boolean;
  title?: string;
};

export default function ShoppingNotesSheet({
  visible,
  value,
  onChange,
  onClose,
  readOnly = false,
  title = 'Shopping & Meal Notes',
}: Props) {
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
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.hint}>
            Brand preferences, substitutes, or items to avoid — shared with your
            chef for this week.
          </Text>
          {readOnly ? (
            <Text style={styles.readonly}>
              {value.trim() || 'No Shopping & Meal Notes added.'}
            </Text>
          ) : (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="e.g. Use Gino tomato paste, no cilantro"
              placeholderTextColor={GRAY_400}
              multiline
              maxLength={2000}
              textAlignVertical="top"
            />
          )}
          <Button
            mode="contained"
            onPress={onClose}
            style={styles.doneBtn}
            buttonColor={CHEF_ORANGE}
          >
            {readOnly ? 'Close' : 'Done'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
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
    maxHeight: '75%',
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
    marginBottom: 12,
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: CHEF_GREY,
    backgroundColor: '#fafafa',
  },
  readonly: {
    fontSize: 15,
    color: GRAY_600,
    lineHeight: 22,
    minHeight: 80,
  },
  doneBtn: {
    marginTop: 16,
    borderRadius: 12,
  },
});
