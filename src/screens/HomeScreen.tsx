import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

import { currentUser } from '../store/authSlice';

export default function HomeScreen() {
  const user = useSelector(currentUser);
  const name = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>
        {name ? `Welcome back, ${name}` : 'Welcome to Chef2Home'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666' },
});
