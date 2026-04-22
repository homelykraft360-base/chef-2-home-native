import { ScrollView, StyleSheet } from 'react-native';

import useGetCurrentUserDetails from '../../hooks/useGetCurrentUserDetails';
import EditProfileCard from './components/EditProfileCard';

interface EditProfileTabProps {
  onSaved?: () => void;
}

export default function EditProfileTab({ onSaved }: EditProfileTabProps) {
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
      <EditProfileCard user={user} onSuccess={onSaved} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 24, paddingBottom: 48 },
});
