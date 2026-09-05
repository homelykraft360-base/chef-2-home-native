import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import useHouseholdEntitlement from '../hooks/useHouseholdEntitlement';
import useRegisterPushOnLogin from '../notifications/useRegisterPushOnLogin';
import HomeScreen from '../screens/HomeScreen';
import HouseholdScreen from '../screens/Household';
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
    case 'Household':
      return focused ? 'account-group' : 'account-group-outline';
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
  const pendingInviteToken = useSelector(
    (state: RootState) => state.auth.pendingInviteToken,
  );
  const { role, isPayer } = useHouseholdEntitlement();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useRegisterPushOnLogin();

  useEffect(() => {
    const parent = navigation.getParent();
    const navigateRoot = (name: string, params?: object) => {
      if (parent) {
        (parent as { navigate: (n: string, p?: object) => void }).navigate(name, params);
      } else {
        (navigation as { navigate: (n: string, p?: object) => void }).navigate(name, params);
      }
    };

    if (tab === 'Booking') {
      navigateRoot('Booking');
      dispatch(setPostLoginTab(null));
      return;
    }

    if (tab === 'AcceptInvite' || role === 'invited' || pendingInviteToken) {
      navigateRoot('AcceptInvite', {
        token: pendingInviteToken ?? undefined,
      });
      if (tab === 'AcceptInvite') {
        dispatch(setPostLoginTab(null));
      }
    }
  }, [tab, navigation, dispatch, pendingInviteToken, role]);

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
      {isPayer ? (
        <Tab.Screen
          name="Household"
          component={HouseholdScreen}
          options={{ title: 'Household' }}
        />
      ) : null}
      <Tab.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ title: 'Subscription' }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}
