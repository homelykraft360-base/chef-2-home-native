import { StyleSheet, Text, View } from 'react-native';

import { CHEF_GREY, GRAY_600 } from '../../../constants/theme';

type AuthHeaderProps = {
  title: string;
  subtitle: string;
};

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginBottom: 24 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: CHEF_GREY,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: GRAY_600,
    textAlign: 'center',
  },
});
