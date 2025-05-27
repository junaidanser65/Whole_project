import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "react-native-elements";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ProfileProvider } from "./src/contexts/ProfileContext";

const theme = {
  colors: {
    primary: "#FF6B6B",
    secondary: "#4ECDC4",
    background: "#FFFFFF",
    text: "#2D3436",
    error: "#FF5252",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <ProfileProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </ProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
