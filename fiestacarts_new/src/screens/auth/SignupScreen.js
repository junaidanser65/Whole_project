import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Input, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phoneNumber) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { message } = await signup(formData);
      navigation.navigate('EmailVerification', { email: formData.email });
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.nameInputs}>
          <Input
            placeholder="First Name"
            value={formData.firstName}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, firstName: text }));
              setError('');
            }}
            containerStyle={[styles.inputContainer, styles.halfInput]}
            inputContainerStyle={styles.input}
          />
          <Input
            placeholder="Last Name"
            value={formData.lastName}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, lastName: text }));
              setError('');
            }}
            containerStyle={[styles.inputContainer, styles.halfInput]}
            inputContainerStyle={styles.input}
          />
        </View>

        <Input
          placeholder="Email"
          value={formData.email}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, email: text }));
            setError('');
          }}
          leftIcon={<Icon name="email" color={colors.primary} size={20} />}
          autoCapitalize="none"
          keyboardType="email-address"
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.input}
        />

        <Input
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, phoneNumber: text }));
            setError('');
          }}
          leftIcon={<Icon name="phone" color={colors.primary} size={20} />}
          keyboardType="phone-pad"
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.input}
        />

        <Input
          placeholder="Password"
          value={formData.password}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, password: text }));
            setError('');
          }}
          leftIcon={<Icon name="lock" color={colors.primary} size={20} />}
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'visibility-off' : 'visibility'}
                color={colors.textLight}
                size={20}
              />
            </TouchableOpacity>
          }
          secureTextEntry={!showPassword}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.input}
        />

        <Input
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, confirmPassword: text }));
            setError('');
          }}
          leftIcon={<Icon name="lock" color={colors.primary} size={20} />}
          secureTextEntry={!showPassword}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.input}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title="Sign Up"
          onPress={handleSignup}
          loading={loading}
          buttonStyle={styles.signupButton}
          containerStyle={styles.buttonContainer}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By signing up, you agree to our{' '}
          <Text 
            style={styles.termsLink}
            onPress={() => navigation.navigate('Terms')}
          >
            Terms of Service
          </Text>
          {' '}and{' '}
          <Text 
            style={styles.termsLink}
            onPress={() => navigation.navigate('Privacy')}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textLight,
  },
  form: {
    marginBottom: spacing.xl,
  },
  nameInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: spacing.md,
  },
  halfInput: {
    width: '48%',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  signupButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  buttonContainer: {
    marginVertical: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  footerText: {
    ...typography.body,
    marginRight: spacing.xs,
  },
  loginText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
  termsContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  termsText: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.textLight,
  },
  termsLink: {
    color: colors.primary,
  },
}); 