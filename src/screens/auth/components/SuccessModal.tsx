import LottieView from 'lottie-react-native';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CHEF_ORANGE } from '../../../constants/theme';

type SuccessModalProps = {
  visible: boolean;
  onGoHome: () => void;
  onBookSession: () => void;
};

export default function SuccessModal({
  visible,
  onGoHome,
  onBookSession,
}: SuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onGoHome}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LottieView
            source={require('../../../../assets/animations/success.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={styles.title}>You're in!!</Text>
          <Text style={styles.subtitle}>
            Welcome to Chef2Home. We're glad to have you here!
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onBookSession}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Book your first Session</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={onGoHome}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
  },
  lottie: {
    width: 160,
    height: 160,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#101928',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: CHEF_ORANGE,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#4b5563',
  },
});
