import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import BookingScreen from '../screens/BookingScreen';
import IngredientCheckoutScreen from '../screens/IngredientCheckoutScreen';
import IngredientReceiptScreen from '../screens/IngredientReceiptScreen';
import PaymentHistoryScreen from '../screens/PaymentHistoryScreen';
import SupportTicketDetailScreen from '../screens/SupportTicketDetailScreen';
import SupportTicketsScreen from '../screens/SupportTicketsScreen';
import { isAuthenticated } from '../store/authSlice';
import AuthStack from './AuthStack';
import { StackScreenHeader } from './appHeader';
import MainTabs from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const authenticated = useSelector(isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {authenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="Booking"
            component={BookingScreen}
            options={{
              headerShown: true,
              title: 'Subscribe',
              header: (props) => <StackScreenHeader {...props} />,
            }}
          />
          <Stack.Screen
            name="IngredientCheckout"
            component={IngredientCheckoutScreen}
            options={{
              headerShown: true,
              title: 'Ingredients',
              header: (props) => <StackScreenHeader {...props} />,
            }}
          />
          <Stack.Screen
            name="IngredientReceipt"
            component={IngredientReceiptScreen}
            options={{
              headerShown: true,
              title: 'Receipt',
              header: (props) => <StackScreenHeader {...props} />,
            }}
          />
          <Stack.Screen
            name="PaymentHistory"
            component={PaymentHistoryScreen}
            options={{
              headerShown: true,
              title: 'Payment history',
              header: (props) => <StackScreenHeader {...props} />,
            }}
          />
          <Stack.Screen
            name="SupportTickets"
            component={SupportTicketsScreen}
            options={{
              headerShown: true,
              title: 'Support',
              header: (props) => <StackScreenHeader {...props} />,
            }}
          />
          <Stack.Screen
            name="SupportTicketDetail"
            component={SupportTicketDetailScreen}
            options={{
              headerShown: true,
              title: 'Ticket',
              header: (props) => <StackScreenHeader {...props} />,
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
