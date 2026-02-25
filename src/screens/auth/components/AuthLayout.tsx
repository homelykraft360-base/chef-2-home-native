import type { ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import AuthHeader from './AuthHeader';

const LOGO_SIZE = 98;

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  showImage?: boolean;
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  showImage = true,
}: AuthLayoutProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {showImage && (
          <View style={styles.bgImage}>
            <Image
              source={require('../../../../assets/auth-bg.jpg')}
              style={styles.bgImage}
              resizeMode="cover"
              accessibilityLabel="Chef2Home background image"
            />
          </View>
        )}
        <View style={styles.logoRow}>
          <Image
            source={require('../../../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Chef2Home logo"
          />
        </View>
        <AuthHeader title={title} subtitle={subtitle} />
        <View style={styles.form}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: {
    // paddingHorizontal: 24,
    paddingBottom: 32,
    // paddingTop: 24,
  },
  imagePlaceholder: {
    height: 120,
    width: '100%',
    backgroundColor: '#f7f9fc',
    marginBottom: 16,
    borderRadius: 8,
  },
  bgImage: {
    height: 160,
    width: '100%',
    backgroundColor: '#f7f9fc',
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 24
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  form: {
    paddingHorizontal: 24,
  },
});
