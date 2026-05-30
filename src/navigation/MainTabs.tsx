import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import useRegisterPushOnLogin from '../notifications/useRegisterPushOnLogin';
import HomeScreen from '../screens/HomeScreen';
import MealsScreen from '../screens/MealsScreen';
import SettingsScreen from '../screens/Settings';
import SubscriptionScreen from '../screens/Subscription';
import { setPostLoginTab } from '../store/authSlice';
import type { RootState } from '../store';
import { MainTabHeader } from './appHeader';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

type MciName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function tabIconName(routeName: string, focused: boolean): MciName {
  switch (routeName) {
    case 'Home':
      return focused ? 'home' : 'home-outline';
    case 'Meals':
      return focused ? 'silverware-fork-knife' : 'silverware';
    case 'Subscription':
      return focused ? 'card-account-details' : 'card-account-details-outline';
    case 'Settings':
      return focused ? 'cog' : 'cog-outline';
    default:
      return 'circle-outline';
  }
}

export default function MainTabs() {
  const tab = useSelector((state: RootState) => state.auth.postLoginTab);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useRegisterPushOnLogin();

  useEffect(() => {
    if (tab !== 'Booking') return;
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('Booking');
    } else {
      (navigation as { navigate: (name: string) => void }).navigate('Booking');
    }
    dispatch(setPostLoginTab(null));
  }, [tab, navigation, dispatch]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: (props) => <MainTabHeader {...props} />,
        tabBarIcon: ({ color, size, focused }) => (
          <MaterialCommunityIcons
            name={tabIconName(route.name, focused)}
            size={size ?? 24}
            color={color}
          />
        ),
        tabBarActiveTintColor: '#e65100',
        tabBarInactiveTintColor: '#666',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Meals" component={MealsScreen} options={{ title: 'Meals' }} />
      <Tab.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ title: 'Subscription' }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}
