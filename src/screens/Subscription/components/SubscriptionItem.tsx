import { StyleSheet, Text, View } from 'react-native';

interface SubscriptionItemProps {
  label: string;
  value: string;
  isLast?: boolean;
}

export default function SubscriptionItem({ label, value, isLast }: SubscriptionItemProps) {
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowLast: { borderBottomWidth: 0 },
  label: { fontSize: 14, color: '#6b7280' },
  value: { fontSize: 14, color: '#101928', fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 16 },
});
