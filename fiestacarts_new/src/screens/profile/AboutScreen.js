import React from 'react';
import { StyleSheet, ScrollView, View, Text, Image } from 'react-native';
import { ListItem, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';

const APP_VERSION = '1.0.0';

const FEATURES = [
  {
    title: 'Easy Booking',
    description: 'Book vendors and caterers with just a few taps',
    icon: 'event-available',
  },
  {
    title: 'Secure Payments',
    description: 'Safe and secure payment processing',
    icon: 'payment',
  },
  {
    title: 'Vendor Reviews',
    description: 'Read and write reviews for vendors',
    icon: 'star',
  },
  {
    title: 'Real-time Updates',
    description: 'Get instant notifications about your bookings',
    icon: 'notifications',
  },
];

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* App Logo and Version */}
      <View style={styles.header}>
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Vendors & Caterers</Text>
        <Text style={styles.version}>Version {APP_VERSION}</Text>
      </View>

      {/* App Description */}
      <View style={styles.section}>
        <Text style={styles.description}>
          Your one-stop platform for booking vendors and caterers for all your events.
          We make it easy to find, compare, and book the perfect service providers.
        </Text>
      </View>

      {/* Key Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Features</Text>
        {FEATURES.map((feature, index) => (
          <ListItem key={index} containerStyle={styles.featureItem}>
            <Icon name={feature.icon} color={colors.primary} />
            <ListItem.Content>
              <ListItem.Title style={styles.featureTitle}>
                {feature.title}
              </ListItem.Title>
              <ListItem.Subtitle style={styles.featureDescription}>
                {feature.description}
              </ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        ))}
      </View>

      {/* Credits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Credits</Text>
        <Text style={styles.credits}>
          Developed by Your Company Name{'\n'}
          © 2024 All rights reserved
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.md,
  },
  appName: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  version: {
    ...typography.caption,
    color: colors.textLight,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  featureItem: {
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  featureTitle: {
    ...typography.body,
    fontWeight: 'bold',
  },
  featureDescription: {
    ...typography.caption,
    color: colors.textLight,
  },
  credits: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textLight,
  },
}); 