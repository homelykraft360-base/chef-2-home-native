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

import {
  CHEF_GREY,
  CHEF_ORANGE,
  ERROR_RED,
  GRAY_400,
  GRAY_600,
} from '../constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, message: string) => void;
  loading?: boolean;
};

export default function CreateSupportTicketSheet({
  visible,
  onClose,
  onSubmit,
  loading = false,
}: Props) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setTitle('');
    setMessage('');
    setError(null);
  }, [visible]);

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();
    if (!trimmedTitle) {
      setError('Please enter a title.');
      return;
    }
    if (!trimmedMessage) {
      setError('Please describe your issue.');
      return;
    }
    setError(null);
    onSubmit(trimmedTitle, trimmedMessage);
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
          <Text style={styles.title}>New support ticket</Text>
          <Text style={styles.hint}>
            Tell us what you need help with. We typically respond within one business day.
          </Text>

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Issue with this week's meal plan"
            placeholderTextColor={GRAY_400}
            maxLength={200}
            editable={!loading}
          />

          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue in detail"
            placeholderTextColor={GRAY_400}
            multiline
            textAlignVertical="top"
            editable={!loading}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            buttonColor={CHEF_ORANGE}
            style={styles.submitBtn}
          >
            Submit ticket
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
    maxHeight: '85%',
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: CHEF_GREY,
    marginBottom: 6,
    marginTop: 8,
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
  messageInput: { minHeight: 120 },
  error: { color: ERROR_RED, fontSize: 14, marginTop: 12 },
  submitBtn: { marginTop: 20, borderRadius: 12 },
});
