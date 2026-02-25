import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { signOut } from '../api/authApi';
import useGetCurrentUserDetails from '../hooks/useGetCurrentUserDetails';
import { signOutUser } from '../store/authSlice';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const { user, loading, error } = useGetCurrentUserDetails();

  const handleSignOut = async () => {
    await signOut();
    dispatch(signOutUser());
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Profile and preferences</Text>
      {user && (
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{user.phoneNumber}</Text>
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Button mode="outlined" onPress={handleSignOut} style={styles.signOutBtn}>
        Sign out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 48, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: { fontSize: 12, color: '#666', marginBottom: 4 },
  value: { fontSize: 16, marginBottom: 16 },
  errorText: { color: '#b00020', marginBottom: 16 },
  signOutBtn: { marginTop: 8 },
});
