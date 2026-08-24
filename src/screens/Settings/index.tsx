import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon, Snackbar } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { signOut } from '../../api/authApi';
import useGetCurrentUserDetails from '../../hooks/useGetCurrentUserDetails';
import { signOutUser } from '../../store/authSlice';
import { CHEF_ORANGE, GRAY_600 } from '../../constants/theme';

import EditProfileTab from './EditProfileTab';
import HouseholdTab from './HouseholdTab';
import PreferencesTab from './PreferencesTab';
import SecuritySettingsTab from './SecuritySettingsTab';
import useHouseholdEntitlement from '../../hooks/useHouseholdEntitlement';

type TabId = 'edit' | 'preferences' | 'security' | 'household';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const { user, loading } = useGetCurrentUserDetails();
  const { isPayer } = useHouseholdEntitlement();
  const [tab, setTab] = useState<TabId>('edit');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const notifySaved = useCallback(() => {
    setSnackbarVisible(true);
  }, []);

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={styles.tabRow}
        >
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
          <TouchableOpacity
            onPress={() => setTab('security')}
            style={styles.tab}
          >
            <Text
              style={[
                styles.tabText,
                tab === 'security' && styles.tabTextActive,
              ]}
            >
              Security Settings
            </Text>
            {tab === 'security' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          {isPayer ? (
            <TouchableOpacity
              onPress={() => setTab('household')}
              style={styles.tab}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === 'household' && styles.tabTextActive,
                ]}
              >
                Household
              </Text>
              {tab === 'household' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </View>
      <View style={styles.tabContent}>
        {tab === 'edit' && user ? <EditProfileTab onSaved={notifySaved} /> : null}
        {tab === 'preferences' ? <PreferencesTab onSaved={notifySaved} /> : null}
        {tab === 'security' && user ? (
          <SecuritySettingsTab onSaved={notifySaved} />
        ) : null}
        {tab === 'household' && isPayer ? <HouseholdTab /> : null}
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
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        style={styles.snackbar}
      >
        Settings updated
      </Snackbar>
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
  tabScroll: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabRow: {
    flexDirection: 'row',
    paddingRight: 24,
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
    fontWeight: '700',
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
  snackbar: {
    marginBottom: 24,
    marginHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#101928',
  },
});
