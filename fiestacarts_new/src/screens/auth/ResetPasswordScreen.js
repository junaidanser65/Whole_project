import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Button, Input, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'At least 6 characters', regex: /.{6,}/ },
  { id: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/ },
  { id: 'lowercase', label: 'One lowercase letter', regex: /[a-z]/ },
  { id: 'number', label: 'One number', regex: /[0-9]/ },
  { id: 'special', label: 'One special character', regex: /[!@#$%^&*]/ },
];

export default function ResetPasswordScreen({ navigation, route }) {
  const { updatePassword } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requirements, setRequirements] = useState(
    PASSWORD_REQUIREMENTS.reduce((acc, req) => ({ ...acc, [req.id]: false }), {})
  );

  const checkPasswordStrength = (password) => {
    const newRequirements = {};
    PASSWORD_REQUIREMENTS.forEach(req => {
      newRequirements[req.id] = req.regex.test(password);
    });
    setRequirements(newRequirements);
    return Object.values(newRequirements).every(Boolean);
  };

  const handleResetPassword = async () => {
    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!checkPasswordStrength(formData.password)) {
      setError('Password does not meet all requirements');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updatePassword(formData.password);
      Alert.alert(
        'Password Reset Successful',
        'Your password has been updated. Please login with your new password.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (text) => {
    setFormData(prev => ({ ...prev, password: text }));
    checkPasswordStrength(text);
    setError('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>
          Please enter your new password below
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          placeholder="New Password"
          value={formData.password}
          onChangeText={handlePasswordChange}
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

        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          {PASSWORD_REQUIREMENTS.map(req => (
            <View key={req.id} style={styles.requirementRow}>
              <Icon
                name={requirements[req.id] ? 'check-circle' : 'radio-button-unchecked'}
                color={requirements[req.id] ? colors.success : colors.textLight}
                size={16}
              />
              <Text style={[
                styles.requirementText,
                requirements[req.id] && styles.requirementMet
              ]}>
                {req.label}
              </Text>
            </View>
          ))}
        </View>

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
          errorMessage={error}
        />

        <Button
          title="Reset Password"
          onPress={handleResetPassword}
          loading={loading}
          buttonStyle={styles.resetButton}
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
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginHorizontal: spacing.xl,
  },
  form: {
    marginTop: spacing.xl,
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
  },
  resetButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  buttonContainer: {
    marginVertical: spacing.sm,
  },
  requirementsContainer: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  requirementsTitle: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  requirementText: {
    ...typography.caption,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },
  requirementMet: {
    color: colors.success,
  },
}); 