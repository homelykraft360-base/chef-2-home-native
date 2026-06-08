import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useDispatch } from 'react-redux';

import { deleteMyAccount } from '../../api/userApi';
import useGetCurrentUserDetails from '../../hooks/useGetCurrentUserDetails';
import { signOutUser } from '../../store/authSlice';
import ChangePhoneCard from './components/ChangePhoneCard';

interface SecuritySettingsTabProps {
  onSaved?: () => void;
}

export default function SecuritySettingsTab({
  onSaved,
}: SecuritySettingsTabProps) {
  const dispatch = useDispatch();
  const { user, loading } = useGetCurrentUserDetails();
  const [deleting, setDeleting] = useState(false);

  if (loading || !user) {
    return null;
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      "This will permanently delete your account and remove your personal data from Chef2Home. This can't be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: deleting ? 'Deleting...' : 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            if (deleting) return;
            setDeleting(true);
            const { error } = await deleteMyAccount();
            setDeleting(false);
            if (error) {
              Alert.alert('Unable to delete account', error);
              return;
            }
            dispatch(signOutUser());
            Alert.alert('Account deleted', 'Your account has been deleted.');
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ChangePhoneCard user={user} onSaved={onSaved} />
      <TouchableOpacity
        onPress={handleDeleteAccount}
        disabled={deleting}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Delete Account"
        style={[styles.deleteButton, deleting && { opacity: 0.6 }]}
      >
        <Text style={styles.deleteButtonText}>
          {deleting ? 'Deleting…' : 'Delete Account'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 24, paddingBottom: 48 },
  deleteButton: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6', // faded gray
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 16,
  },
});
