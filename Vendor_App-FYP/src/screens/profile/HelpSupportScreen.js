import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Text, Card, Icon, Button, Divider } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data for FAQs
const mockFAQs = [
  {
    id: '1',
    question: 'How do I book a vendor?',
    answer: 'To book a vendor, browse through our listings, select a vendor, choose your desired package, and click the "Book Now" button. Follow the prompts to complete your booking.',
  },
  {
    id: '2',
    question: 'What payment methods are accepted?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and digital payment methods. Payment information can be securely saved in your account for future bookings.',
  },
  {
    id: '3',
    question: 'How can I cancel or modify a booking?',
    answer: 'You can cancel or modify your booking through the "My Bookings" section in your profile. Please note that cancellation policies may vary by vendor.',
  },
];

const supportCategories = [
  {
    id: '1',
    title: 'Account & Profile',
    icon: 'person',
    description: 'Manage your account settings and profile information',
  },
  {
    id: '2',
    title: 'Bookings & Payments',
    icon: 'payment',
    description: 'Issues with bookings, payments, and refunds',
  },
  {
    id: '3',
    title: 'Technical Support',
    icon: 'computer',
    description: 'App-related issues and technical difficulties',
  },
];

const FAQItem = ({ faq, isExpanded, onPress }) => (
  <Card containerStyle={styles.faqCard}>
    <TouchableOpacity onPress={onPress}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Icon
          name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          type="material"
          size={24}
          color="#636E72"
        />
      </View>
      {isExpanded && (
        <>
          <Divider style={styles.divider} />
          <Text style={styles.faqAnswer}>{faq.answer}</Text>
        </>
      )}
    </TouchableOpacity>
  </Card>
);

const SupportCategory = ({ category, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Card containerStyle={styles.categoryCard}>
      <View style={styles.categoryContent}>
        <View style={styles.categoryIcon}>
          <Icon
            name={category.icon}
            type="material"
            size={24}
            color="#ff4500"
          />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
        </View>
        <Icon
          name="chevron-right"
          type="material"
          size={24}
          color="#636E72"
        />
      </View>
    </Card>
  </TouchableOpacity>
);

const HelpSupportScreen = ({ navigation }) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const handleFAQPress = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleCategoryPress = (category) => {
    // Navigate to specific support category
    // navigation.navigate('SupportCategory', { category });
  };

  const handleContactSupport = () => {
    // Open email client with support email
    Linking.openURL('mailto:support@fiestacarts.com');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content}>

        <Card containerStyle={styles.contactCard}>
          <Text style={styles.contactTitle}>Need Help?</Text>
          <Text style={styles.contactDescription}>
            Our support team is here to help you with any questions or issues.
          </Text>
          <Button
            title="Contact Support"
            icon={
              <Icon
                name="email"
                type="material"
                size={20}
                color="#FFFFFF"
                style={styles.contactIcon}
              />
            }
            buttonStyle={styles.contactButton}
            onPress={handleContactSupport}
          />
        </Card>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Support Categories</Text>
          {supportCategories.map((category) => (
            <SupportCategory
              key={category.id}
              category={category}
              onPress={() => handleCategoryPress(category)}
            />
          ))}
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {mockFAQs.map((faq) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isExpanded={expandedFAQ === faq.id}
              onPress={() => handleFAQPress(faq.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6FA',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  contactCard: {
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#F5F6FA',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 10,
  },
  contactDescription: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 15,
  },
  contactButton: {
    backgroundColor: '#ff4500',
    borderRadius: 12,
    paddingVertical: 12,
  },
  contactIcon: {
    marginRight: 10,
  },
  categoriesSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 15,
    marginLeft: 10,
  },
  categoryCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    backgroundColor: '#fff1eb',
    padding: 10,
    borderRadius: 10,
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#636E72',
  },
  faqSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  faqCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
    marginRight: 10,
  },
  divider: {
    marginVertical: 10,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
  },
});

export default HelpSupportScreen; 