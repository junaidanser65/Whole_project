import React from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { colors, spacing, typography } from '../../styles/theme';

const TERMS_SECTIONS = [
  {
    title: 'Acceptance of Terms',
    content: `By accessing or using the Vendors & Caterers Booking App, you agree to be bound by these Terms of Service and all applicable laws and regulations.`,
  },
  {
    title: 'User Accounts',
    content: `• You must provide accurate and complete information when creating an account
• You are responsible for maintaining the security of your account
• You must notify us immediately of any unauthorized access
• We reserve the right to suspend or terminate accounts`,
  },
  {
    title: 'Booking Services',
    content: `• All bookings are subject to vendor availability
• Prices and services are set by vendors
• Cancellation policies vary by vendor
• We act as a platform and are not responsible for vendor services`,
  },
  {
    title: 'Payments',
    content: `• All payments are processed securely through our platform
• Fees and charges will be clearly displayed
• Refunds are subject to vendor policies
• We may charge service or platform fees`,
  },
  {
    title: 'User Conduct',
    content: `You agree not to:
• Violate any laws or regulations
• Impersonate others
• Submit false information
• Interfere with platform operation
• Harass vendors or other users`,
  },
  {
    title: 'Intellectual Property',
    content: `• All content and materials are owned by us or our licensors
• You may not copy or reproduce without permission
• You retain ownership of your content`,
  },
  {
    title: 'Limitation of Liability',
    content: `• We are not liable for vendor services
• We provide the platform "as is"
• We are not responsible for indirect damages
• Maximum liability is limited to fees paid`,
  },
  {
    title: 'Changes to Terms',
    content: `We may modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms.`,
  },
];

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: March 15, 2024</Text>
        
        <Text style={styles.introduction}>
          Please read these Terms of Service carefully before using our platform.
        </Text>

        {TERMS_SECTIONS.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            If you have any questions about these Terms, please contact us at support@vendorsapp.com
          </Text>
        </View>
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
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
  },
}); 