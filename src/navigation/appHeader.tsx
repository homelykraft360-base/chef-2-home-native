import type { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { CHEF_GREY, CHEF_ORANGE } from '../constants/theme';
import { currentUser } from '../store/authSlice';
import { getInitials } from '../utils/string.utils';

/** App / Expo icon at project root — same as `app.json` `icon`. */
const LOGO = require('../../assets/icon.png');

const LOGO_HEIGHT = 42;
const LOGO_WIDTH = LOGO_HEIGHT * 2.5;

const AVATAR_SIZE = 40;
const AVATAR_RADIUS = AVATAR_SIZE / 2;

/** Matches `HomeScreen` `UserInfoCard` avatar (initials in orange circle). */
function HeaderAvatar() {
  const user = useSelector(currentUser);
  const initials = getInitials(user?.firstName, user?.lastName);

  return (
    <View
      style={styles.avatar}
      accessibilityLabel={
        user?.firstName
          ? `Profile, ${user.firstName} ${user.lastName ?? ''}`.trim()
          : 'Profile'
      }
    >
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

/** Bottom tabs: logo left, profile avatar right. */
export function MainTabHeader(_props: BottomTabHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.shell, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <Image
          source={LOGO}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Chef2Home"
        />
        <HeaderAvatar />
      </View>
    </View>
  );
}

/** Stack (e.g. Booking): back + logo left, profile avatar right. */
export function StackScreenHeader({
  navigation,
  back,
}: NativeStackHeaderProps) {
  const insets = useSafeAreaInsets();
  const showBack = back != null && navigation.canGoBack();

  return (
    <View style={[styles.shell, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <View style={styles.leftGroup}>
          {showBack ? (
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backHit}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color={CHEF_GREY}
              />
            </Pressable>
          ) : null}
          <Image
            source={LOGO}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Chef2Home"
          />
        </View>
        <HeaderAvatar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingBottom: 12,
    paddingTop: 4,
    paddingHorizontal: 16,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0,
  },
  backHit: {
    padding: 8,
    marginRight: 4,
    marginLeft: -8,
  },
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_RADIUS,
    backgroundColor: CHEF_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
