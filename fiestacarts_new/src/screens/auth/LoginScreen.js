import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Button, Input, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
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

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title="Login"
          onPress={handleLogin}
          loading={loading}
          buttonStyle={styles.loginButton}
          containerStyle={styles.buttonContainer}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.socialLogin}>
        <Text style={styles.socialText}>Or continue with</Text>
        <View style={styles.socialButtons}>
          <Button
            icon={<Icon name="google" type="font-awesome" color={colors.text} />}
            buttonStyle={styles.socialButton}
            containerStyle={styles.socialButtonContainer}
            onPress={signInWithGoogle}
          />
          <Button
            icon={<Icon name="facebook" type="font-awesome" color={colors.text} />}
            buttonStyle={styles.socialButton}
            containerStyle={styles.socialButtonContainer}
            onPress={signInWithFacebook}
          />
          <Button
            icon={<Icon name="apple" type="font-awesome" color={colors.text} />}
            buttonStyle={styles.socialButton}
            containerStyle={styles.socialButtonContainer}
            onPress={signInWithApple}
          />
        </View>
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
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.lg,
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
  inputContainer: {
    paddingHorizontal: 0,
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
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  buttonContainer: {
    marginVertical: spacing.md,
  },
  forgotPassword: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    ...typography.body,
    color: colors.primary,
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
  signupText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
  socialLogin: {
    alignItems: 'center',
  },
  socialText: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    width: 50,
    height: 50,
  },
  socialButtonContainer: {
    marginHorizontal: spacing.sm,
  },
}); 