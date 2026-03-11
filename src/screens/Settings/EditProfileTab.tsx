import { ScrollView, StyleSheet } from 'react-native';

import useGetCurrentUserDetails from '../../hooks/useGetCurrentUserDetails';
import ChangePhoneCard from './components/ChangePhoneCard';
import EditProfileCard from './components/EditProfileCard';

export default function EditProfileTab() {
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
      <EditProfileCard user={user} />
      <ChangePhoneCard user={user} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 24, paddingBottom: 48 },
});
