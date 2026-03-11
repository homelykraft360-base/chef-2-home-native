import { StyleSheet, Text, View } from 'react-native';

export default function PreferencesTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Preferences</Text>
      <Text style={styles.sub}>Cooking and notification preferences coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 24 },
  placeholder: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  sub: { fontSize: 14, color: '#6b7280' },
});
