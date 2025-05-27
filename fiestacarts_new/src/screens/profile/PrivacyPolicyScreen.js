import React from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { colors, spacing, typography } from '../../styles/theme';

const PRIVACY_SECTIONS = [
  {
    title: 'Information We Collect',
    content: `We collect information that you provide directly to us, including:
• Personal information (name, email, phone number)
• Location data when you use our services
• Payment information
• Device information and usage data`,
  },
  {
    title: 'How We Use Your Information',
    content: `We use the information we collect to:
• Provide and improve our services
• Process your bookings and payments
• Send you updates and notifications
• Personalize your experience
• Ensure platform security`,
  },
  {
    title: 'Information Sharing',
    content: `We may share your information with:
• Vendors you book with
• Payment processors
• Service providers
• Law enforcement when required

We never sell your personal information to third parties.`,
  },
  {
    title: 'Your Rights',
    content: `You have the right to:
• Access your personal information
• Update or correct your data
• Delete your account
• Opt-out of marketing communications
• Control location sharing`,
  },
  {
    title: 'Data Security',
    content: `We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or destruction.`,
  },
  {
    title: 'Contact Us',
    content: `If you have any questions about our Privacy Policy, please contact us at:
support@vendorsapp.com`,
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: March 15, 2024</Text>
        
        <Text style={styles.introduction}>
          This Privacy Policy describes how we collect, use, and share your personal information when you use our Vendors & Caterers Booking App.
        </Text>

        {PRIVACY_SECTIONS.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  lastUpdated: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: spacing.lg,
  },
  introduction: {
    ...typography.body,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
    color: colors.primary,
  },
  sectionContent: {
    ...typography.body,
    lineHeight: 24,
  },
}); 