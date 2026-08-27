import { StyleSheet, View } from 'react-native';

import HouseholdTab from '../Settings/HouseholdTab';

export default function HouseholdScreen() {
  return (
    <View style={styles.container}>
      <HouseholdTab />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
});
