import { StyleSheet, Text, View } from 'react-native';

import { CHEF_GREY } from '../constants/theme';

export default function MealsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fafafa',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: CHEF_GREY,
  },
});
