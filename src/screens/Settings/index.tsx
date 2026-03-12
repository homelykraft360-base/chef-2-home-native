import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { signOut } from '../../api/authApi';
import useGetCurrentUserDetails from '../../hooks/useGetCurrentUserDetails';
import { signOutUser } from '../../store/authSlice';
import { CHEF_ORANGE, GRAY_600 } from '../../constants/theme';

import EditProfileTab from './EditProfileTab';
import PreferencesTab from './PreferencesTab';

type TabId = 'edit' | 'preferences';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const { user, loading } = useGetCurrentUserDetails();
  const [tab, setTab] = useState<TabId>('edit');

  const handleSignOut = async () => {
    await signOut();
    dispatch(signOutUser());
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={CHEF_ORANGE} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Account settings</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => setTab('edit')}
            style={styles.tab}
          >
            <Text
              style={[
                styles.tabText,
                tab === 'edit' && styles.tabTextActive,
              ]}
            >
              Edit profile
            </Text>
            {tab === 'edit' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab('preferences')}
            style={styles.tab}
          >
            <Text
              style={[
                styles.tabText,
                tab === 'preferences' && styles.tabTextActive,
              ]}
            >
              Preferences
            </Text>
            {tab === 'preferences' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.tabContent}>
        {tab === 'edit' && user ? <EditProfileTab /> : null}
        {tab === 'preferences' ? <PreferencesTab /> : null}
      </View>
      <TouchableOpacity
        style={styles.signOutFab}
        onPress={handleSignOut}
        activeOpacity={0.8}
        accessibilityLabel="Sign out"
        accessibilityRole="button"
      >
        <Icon source="power" size={22} color={CHEF_ORANGE} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#101928',
    marginBottom: 24,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginRight: 24,
  },
  tabText: {
    fontSize: 16,
    color: GRAY_600,
  },
  tabTextActive: {
    color: '#101928',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: CHEF_ORANGE,
  },
  tabContent: { flex: 1, paddingHorizontal: 24 },
  signOutFab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
