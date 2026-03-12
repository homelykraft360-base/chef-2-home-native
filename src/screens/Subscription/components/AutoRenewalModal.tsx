import { StyleSheet, Text } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';

import { CHEF_ORANGE } from '../../../constants/theme';

interface AutoRenewalModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  isActive: boolean;
}

export default function AutoRenewalModal({
  visible,
  onClose,
  onConfirm,
  loading,
  isActive,
}: AutoRenewalModalProps) {
  const action = isActive ? 'Disable' : 'Enable';
  const subText = isActive
    ? "You're about to disable automatic subscription renewal. This means your current subscription would be cancelled at the end date. Do you want to proceed?"
    : "You're about to enable automatic subscription renewal. This means your current subscription will be automatically renewed at the end date. Do you want to proceed?";

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
        <Dialog.Title>{action} automatic subscription renewal?</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.subText}>{subText}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onPress={onConfirm}
            loading={loading}
            disabled={loading}
            textColor={CHEF_ORANGE}
          >
            {action} auto-renewal
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: { borderRadius: 16 },
  subText: { fontSize: 14, color: '#6b7280', lineHeight: 22 },
});
