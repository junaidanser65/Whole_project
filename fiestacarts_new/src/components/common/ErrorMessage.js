import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors, typography, spacing } from '../../styles/theme';

const ErrorMessage = ({ message = 'An error occurred' }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  message: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
});

export default ErrorMessage; 