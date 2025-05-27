import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { BookingProvider } from './src/contexts/BookingContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { colors } from './src/styles/theme';
import { FavoritesProvider } from './src/contexts/FavoritesContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <AuthProvider>
        <BookingProvider>
          <ActionSheetProvider>
            <FavoritesProvider>
              <AppNavigator />
            </FavoritesProvider>
          </ActionSheetProvider>
        </BookingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
