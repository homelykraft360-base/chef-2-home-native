import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { setPostLoginTab } from '../store/authSlice';
import type { RootState } from '../store';
import type { MainTabParamList } from './types';
import BookingScreen from '../screens/BookingScreen';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/Settings';
import SubscriptionScreen from '../screens/Subscription';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, color: focused ? '#e65100' : '#666' }}>
      {name}
    </Text>
  );
}

export default function MainTabs() {
  const tab = useSelector((state: RootState) => state.auth.postLoginTab);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (tab === 'Booking') {
      (navigation as { navigate: (s: string, p?: object) => void }).navigate(
        'Main',
        { screen: 'Booking' }
      );
      dispatch(setPostLoginTab(null));
    }
  }, [tab, navigation, dispatch]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name[0]} focused={focused} />
        ),
        tabBarActiveTintColor: '#e65100',
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Booking" component={BookingScreen} options={{ title: 'Booking' }} />
      <Tab.Screen name="Subscription" component={SubscriptionScreen} options={{ title: 'Subscription' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}
