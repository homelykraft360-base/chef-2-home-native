import { ScrollView, StyleSheet } from 'react-native';

import useGetCurrentUserDetails from '../../hooks/useGetCurrentUserDetails';
import ChangePhoneCard from './components/ChangePhoneCard';

interface SecuritySettingsTabProps {
  onSaved?: () => void;
}

export default function SecuritySettingsTab({
  onSaved,
}: SecuritySettingsTabProps) {
  const { user, loading } = useGetCurrentUserDetails();

  if (loading || !user) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ChangePhoneCard user={user} onSaved={onSaved} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 24, paddingBottom: 48 },
});
