import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '@rneui/themed';
import { useAuth } from '../contexts/AuthContext';
import { colors, typography } from '../styles/theme';

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import MainDashboardScreen from '../screens/dashboard/MainDashboardScreen';
import ProfileScreen from '../screens/profile/UserProfileScreen';
import BookingCartScreen from '../screens/booking/BookingCartScreen';
import VendorDetailsScreen from '../screens/vendor/VendorDetailsScreen';
import BookingFormScreen from '../screens/booking/BookingFormScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import PaymentSuccessScreen from '../screens/payment/PaymentSuccessScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import BookingHistoryScreen from '../screens/profile/BookingHistoryScreen';
import BookingDetailsScreen from '../screens/booking/BookingDetailsScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import TermsScreen from '../screens/profile/TermsScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import AboutScreen from '../screens/profile/AboutScreen';
import LoadingScreen from '../screens/common/LoadingScreen';
import FullMapScreen from '../screens/map/FullMapScreen';
import SavedVendorsScreen from '../screens/profile/SavedVendorsScreen';
import SearchFiltersScreen from '../screens/vendor/SearchFiltersScreen';
import VendorSearchScreen from '../screens/vendor/VendorSearchScreen';
import AddReviewScreen from '../screens/vendor/AddReviewScreen';
import BookingSuccess from '../screens/booking/BookingSuccess';
import ChatScreen from '../screens/chat/ChatScreen';
import ChatDetailsScreen from '../screens/chat/ChatDetailsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Create a stack navigator for each tab
const DashboardStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
    }}
  >
    <Stack.Screen name="DashboardMain" component={MainDashboardScreen} />
    <Stack.Screen name="VendorDetails" component={VendorDetailsScreen} />
    <Stack.Screen name="FullMap" component={FullMapScreen} />
    <Stack.Screen name="BookingForm" component={BookingFormScreen} />
    <Stack.Screen name="BookingSuccess" component={BookingSuccess} />
    <Stack.Screen
      name="VendorSearch"
      component={VendorSearchScreen}
      options={{
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);

const BookingsStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
    }}
  >
    <Stack.Screen name="BookingsMain" component={BookingCartScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
    }}
  >
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="BookingHistory" component={BookingHistoryScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen
      name="PaymentMethods"
      component={PaymentMethodsScreen}
      options={{
        headerShown: true,
        headerTitle: 'Payment Methods',
        headerBackTitle: 'Back',
      }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{
        headerShown: false,
        headerTitle: 'Notifications',
        headerBackTitle: 'Back',
      }}
    />
    <Stack.Screen
      name="Privacy"
      component={PrivacyPolicyScreen}
      options={{
        headerShown: false,
        headerTitle: 'Privacy Policy',
        headerBackTitle: 'Back',
      }}
    />
    <Stack.Screen
      name="Terms"
      component={TermsScreen}
      options={{
        headerShown: false,
        headerTitle: 'Terms of Service',
        headerBackTitle: 'Back',
      }}
    />
    <Stack.Screen
      name="Support"
      component={SupportScreen}
      options={{
        headerShown: false,
        headerTitle: 'Help & Support',
        headerBackTitle: 'Back',
      }}
    />
    <Stack.Screen
      name="About"
      component={AboutScreen}
      options={{
        headerShown: false,
        headerTitle: 'About',
        headerBackTitle: 'Back',
      }}
    />
    <Stack.Screen
      name="SavedVendors"
      component={SavedVendorsScreen}
      options={{
        headerShown: false,
        headerTitle: 'Saved Vendors',
        headerBackTitle: 'Back',
      }}
    />
    <Stack.Screen
      name="SearchFilters"
      component={SearchFiltersScreen}
      options={{
        headerShown: true,
        headerTitle: 'Search Filters',
        headerBackTitle: 'Back',
      }}
    />
    <Stack.Screen
      name="AddReview"
      component={AddReviewScreen}
      options={{
        headerTitle: 'Add Review',
        headerBackTitle: 'Back',
      }}
    />
  </Stack.Navigator>
);

const ChatStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
    }}
  >
    <Stack.Screen name="ChatMain" component={ChatScreen} />
    <Stack.Screen name="ChatDetails" component={ChatDetailsScreen} />
  </Stack.Navigator>
);

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'home';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else if (route.name === 'Bookings') {
            iconName = 'shopping-cart';
          } else if (route.name === 'Chat') {
            iconName = 'chat';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          borderTopColor: colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Bookings" component={BookingsStack} />
      <Tab.Screen name="Chat" component={ChatStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

const linking = {
  prefixes: ['vendorapp://'],
  config: {
    screens: {
      Login: 'login',
      Signup: 'signup',
      MainApp: {
        screens: {
          Profile: 'profile',
        },
      },
    },
  },
};

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        ) : (
          // Main App Stack with Tabs
          <Stack.Screen name="MainApp" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 