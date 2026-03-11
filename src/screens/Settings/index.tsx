import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';
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
      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={styles.signOutBtn}
        >
          Sign out
        </Button>
      </View>
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
  footer: { padding: 24, paddingBottom: 48 },
  signOutBtn: {},
});
