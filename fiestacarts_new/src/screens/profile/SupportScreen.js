import React from 'react';
import { StyleSheet, ScrollView, View, Text, Linking } from 'react-native';
import { ListItem, Icon, Button } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';

const FAQ_ITEMS = [
  {
    question: 'How do I book a vendor?',
    answer: 'Browse vendors, select one you like, choose your desired services and date, then proceed to payment to confirm your booking.',
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'Cancellation policies vary by vendor. Please check the specific vendor\'s terms before booking. Generally, cancellations made 48 hours before the event may be eligible for a refund.',
  },
  {
    question: 'How do I contact a vendor?',
    answer: 'Once you\'ve made a booking, you can communicate with the vendor through our in-app messaging system.',
  },
  {
    question: 'Is my payment secure?',
    answer: 'Yes, we use industry-standard encryption and secure payment processors to protect your payment information.',
  },
];

const CONTACT_METHODS = [
  {
    title: 'Email Support',
    icon: 'email',
    action: 'support@vendorsapp.com',
    type: 'email',
  },
  {
    title: 'Phone Support',
    icon: 'phone',
    action: '+1-800-VENDORS',
    type: 'phone',
  },
  {
    title: 'Live Chat',
    icon: 'chat',
    action: 'Start Chat',
    type: 'chat',
  },
];

export default function SupportScreen() {
  const handleContact = (method) => {
    switch (method.type) {
      case 'email':
        Linking.openURL(`mailto:${method.action}`);
        break;
      case 'phone':
        Linking.openURL(`tel:${method.action}`);
        break;
      case 'chat':
        // TODO: Implement live chat
        console.log('Opening live chat...');
        break;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Contact Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.sectionDescription}>
          Need help? Choose your preferred way to reach us.
        </Text>
        {CONTACT_METHODS.map((method, index) => (
          <ListItem
            key={index}
            onPress={() => handleContact(method)}
            containerStyle={styles.contactItem}
          >
            <Icon name={method.icon} color={colors.primary} />
            <ListItem.Content>
              <ListItem.Title style={styles.contactTitle}>
                {method.title}
              </ListItem.Title>
              <ListItem.Subtitle style={styles.contactSubtitle}>
                {method.action}
              </ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        ))}
      </View>

      {/* FAQ Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {FAQ_ITEMS.map((item, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.answer}>{item.answer}</Text>
          </View>
        ))}
      </View>

      {/* Submit Ticket Button */}
      <Button
        title="Submit Support Ticket"
        icon={<Icon name="ticket" color={colors.background} style={styles.buttonIcon} />}
        buttonStyle={styles.submitButton}
        containerStyle={styles.submitButtonContainer}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.lg,
  },
  contactItem: {
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  contactTitle: {
    ...typography.body,
    fontWeight: 'bold',
  },
  contactSubtitle: {
    ...typography.caption,
    color: colors.textLight,
  },
  faqItem: {
    marginBottom: spacing.lg,
  },
  question: {
    ...typography.body,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  answer: {
    ...typography.body,
    color: colors.textLight,
  },
  submitButtonContainer: {
    padding: spacing.lg,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
}); 