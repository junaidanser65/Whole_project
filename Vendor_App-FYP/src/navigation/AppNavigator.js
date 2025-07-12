import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "react-native-elements";
import { useAuth } from "../contexts/AuthContext";
import { BookingsProvider } from "../contexts/BookingsContext";
import TimingsScreen from "../screens/timing/TimingsScreen";

// Auth Screens
import WelcomeScreen from "../screens/auth/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";

// Main App Screens
// import VendorListScreen from '../screens/vendor/VendorListScreen';
// import VendorDetailsScreen from '../screens/vendor/VendorDetailsScreen';
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import ProfileScreen from "../screens/dashboard/ProfileScreen";
import MenuScreen from "../screens/menu/MenuScreen";
import AllActivitiesScreen from "../screens/details/AllActivitiesScreen";
// import ContactVendorScreen from '../screens/vendor/ContactVendorScreen';

// Profile Screens
import BookingsScreen from "../screens/bookings/BookingsScreen";
import PaymentMethodsScreen from "../screens/profile/PaymentMethodsScreen";
import NotificationsScreen from "../screens/profile/NotificationsScreen";
import HelpSupportScreen from "../screens/profile/HelpSupportScreen";
import PrivacyPolicyScreen from "../screens/profile/PrivacyPolicyScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import BookingDetails from "../screens/bookings/BookingDetails";

// Money Management Screens
import ReceiveMoneyScreen from "../screens/money-management/ReceiveMoneyScreen";

// Detail Screens
import RevenueDetailsScreen from "../screens/details/RevenueDetailsScreen";
import CustomersListScreen from "../screens/details/CustomersListScreen";
import ReviewDetailsScreen from "../screens/details/ReviewDetailsScreen";
import ChatScreen from "../screens/chat/ChatScreen";

// Menu Screens
import AddMenuItemScreen from "../screens/menu/AddMenuItemScreen";
import MenuItemDetailsScreen from "../screens/menu/MenuItemDetailsScreen";
import EditMenuItemScreen from "../screens/menu/EditMenuItemScreen";

// Chat Screens
import ChatDetailsScreen from "../screens/chat/ChatDetailsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();
const DashboardStack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <ProfileStack.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          headerShown: false,
        }}
      />
      <ProfileStack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{
          headerShown: false,
        }}
      />
      <ProfileStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: false,
        }}
      />
      <ProfileStack.Screen
        name="Support"
        component={HelpSupportScreen}
        options={{
          headerShown: false,
        }}
      />
      <ProfileStack.Screen
        name="Privacy"
        component={PrivacyPolicyScreen}
        options={{
          headerShown: false,
        }}
      />
      <ProfileStack.Screen
        name="BookingDetails"
        component={BookingDetails}
        options={{
          headerShown: false,
        }}
      />
    </ProfileStack.Navigator>
  );
};

const DashboardStackNavigator = () => {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardMain" component={DashboardScreen} />
      <DashboardStack.Screen
        name="RevenueDetails"
        component={RevenueDetailsScreen}
      />
      <DashboardStack.Screen
        name="AllActivities"
        component={AllActivitiesScreen}
      />
      <DashboardStack.Screen
        name="ReviewDetails"
        component={ReviewDetailsScreen}
      />
      <DashboardStack.Screen
        name="CustomersList"
        component={CustomersListScreen}
      />
    </DashboardStack.Navigator>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = focused ? "dashboard" : "dashboard";
          } else if (route.name === "Menu") {
            iconName = focused ? "restaurant-menu" : "restaurant-menu";
          } else if (route.name === "Timings") {
            iconName = focused ? "schedule" : "schedule";
          } else if (route.name === "Chat") {
            iconName = focused ? "chat" : "chat-bubble-outline";
          }

          return (
            <Icon name={iconName} type="material" size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#94A3B8",
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStackNavigator} />
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Timings" component={TimingsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <BookingsProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="MainApp" component={MainTabNavigator} />
        <Stack.Screen name="Profile" component={ProfileStackNavigator} />
        <Stack.Screen name="Bookings" component={BookingsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Support" component={HelpSupportScreen} />
        <Stack.Screen name="Privacy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="ReceiveMoney" component={ReceiveMoneyScreen} />
        <Stack.Screen name="AllActivities" component={AllActivitiesScreen} />
        <Stack.Screen name="BookingDetails" component={BookingDetails} />
        <Stack.Screen
          name="ChatDetails"
          component={ChatDetailsScreen}
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="AddMenuItem"
          component={AddMenuItemScreen}
          options={{
            headerShown: false,
            title: "Add Menu Item",
          }}
        />
        <Stack.Screen
          name="MenuItemDetails"
          component={MenuItemDetailsScreen}
          options={{
            headerShown: false,
            title: "Menu Item Details",
          }}
        />
        <Stack.Screen
          name="EditMenuItem"
          component={EditMenuItemScreen}
          options={{
            headerShown: false,
            title: "Edit Menu Item",
          }}
        />
      </Stack.Navigator>
    </BookingsProvider>
  );
};

export default AppNavigator;
