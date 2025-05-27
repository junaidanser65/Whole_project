import React from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { Button, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function EmailVerificationScreen({ navigation, route }) {
  const { resendVerificationEmail } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [countdown, setCountdown] = React.useState(0);
  const email = route.params?.email;

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setError('');
    try {
      await resendVerificationEmail(email);
      Alert.alert(
        'Email Sent',
        'A new verification email has been sent to your inbox.'
      );
      setCountdown(60); // Start 60 second countdown
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Icon
          name="mail"
          size={80}
          color={colors.primary}
          containerStyle={styles.icon}
        />
        
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.description}>
          We've sent a verification email to:
        </Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.instructions}>
          Please check your email and click the verification link to continue.
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title={countdown > 0 ? `Resend Email (${countdown}s)` : "Resend Email"}
          onPress={handleResend}
          loading={loading && countdown === 0}
          disabled={countdown > 0}
          buttonStyle={[styles.resendButton, countdown > 0 && styles.disabledButton]}
          containerStyle={styles.buttonContainer}
        />

        <Button
          title="Back to Login"
          type="clear"
          onPress={() => navigation.navigate('Login')}
          titleStyle={styles.backButtonText}
          containerStyle={styles.buttonContainer}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.xl,
    justifyContent: 'center',
  },
  icon: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  email: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  instructions: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  resendButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  buttonContainer: {
    width: '100%',
    marginVertical: spacing.sm,
  },
  backButtonText: {
    color: colors.primary,
  },
  disabledButton: {
    backgroundColor: colors.textLight,
  },
}); 