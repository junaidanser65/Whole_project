import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Text,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data for FAQs
const mockFAQs = [
  {
    id: '1',
    question: 'How do I manage my vendor bookings?',
    answer: 'As a vendor, you can view and manage all your bookings through the "Bookings" section in the app. You can accept or decline booking requests, update booking status, and communicate with customers directly through our chat feature.',
  },
  {
    id: '2',
    question: 'How do I set up payment methods?',
    answer: 'Go to "Payment Methods" in your profile settings to add credit cards, debit cards, or connect your PayPal account. We accept all major payment methods and ensure secure processing for all transactions.',
  },
  {
    id: '3',
    question: 'How can I update my service availability?',
    answer: 'You can update your availability through the "Timings" section. Set your working hours, block specific dates when you\'re not available, and manage your calendar to ensure accurate booking availability.',
  },
  {
    id: '4',
    question: 'How do I handle customer cancellations?',
    answer: 'Customer cancellations are handled automatically based on your cancellation policy. You can set up your cancellation terms in your vendor settings, and the system will process refunds according to your policy.',
  },
  {
    id: '5',
    question: 'What if I encounter technical issues?',
    answer: 'For technical issues, you can contact our support team directly through the app or email us at tech-support@fiestacarts.com. We provide 24/7 technical support to ensure your business runs smoothly.',
  },
];

const supportCategories = [
  {
    id: '1',
    title: 'Account Management',
    icon: 'person-circle-outline',
    description: 'Profile settings, account verification, and business information',
    color: '#6366F1',
  },
  {
    id: '2',
    title: 'Booking Management',
    icon: 'calendar-outline',
    description: 'Managing bookings, availability, and customer interactions',
    color: '#10B981',
  },
  {
    id: '3',
    title: 'Payments & Billing',
    icon: 'card-outline',
    description: 'Payment processing, billing issues, and financial reports',
    color: '#F59E0B',
  },
  {
    id: '4',
    title: 'Technical Support',
    icon: 'settings-outline',
    description: 'App-related issues, bugs, and technical difficulties',
    color: '#EF4444',
  },
  {
    id: '5',
    title: 'Business Growth',
    icon: 'trending-up-outline',
    description: 'Marketing tips, optimization, and growing your business',
    color: '#8B5CF6',
  },
];

const FAQItem = ({ faq, isExpanded, onPress }) => (
  <TouchableOpacity 
    style={[styles.faqCard, isExpanded && styles.faqCardExpanded]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.faqHeader}>
      <Text style={styles.faqQuestion}>{faq.question}</Text>
      <Ionicons
        name={isExpanded ? 'chevron-up' : 'chevron-down'}
        size={20}
        color="#6366F1"
      />
    </View>
    {isExpanded && (
      <View style={styles.faqAnswerContainer}>
        <Text style={styles.faqAnswer}>{faq.answer}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const SupportCategory = ({ category, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <View style={styles.categoryCard}>
      <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
        <Ionicons
          name={category.icon}
          size={24}
          color={category.color}
        />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color="#94A3B8"
      />
    </View>
  </TouchableOpacity>
);

const HelpSupportScreen = ({ navigation }) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const handleFAQPress = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleCategoryPress = (category) => {
    Alert.alert(
      category.title,
      `Get help with ${category.description.toLowerCase()}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Contact Support', 
          onPress: () => handleContactSupport(category.title)
        },
      ]
    );
  };

  const handleContactSupport = (subject = 'General Inquiry') => {
    const emailSubject = `Vendor Support: ${subject}`;
    const emailBody = `Hi Fiestacarts Support Team,\n\nI need help with: ${subject}\n\nPlease describe your issue here...\n\nBest regards,\n[Your Name]`;
    
    Linking.openURL(`mailto:support@fiestacarts.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`).catch(() => {
      Alert.alert('Error', 'Unable to open email client. Please contact us at support@fiestacarts.com');
    });
  };

  const handlePhoneSupport = () => {
    Alert.alert(
      'Call Support',
      'Would you like to call our support team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call Now', 
          onPress: () => {
            Linking.openURL('tel:+15551234567').catch(() => {
              Alert.alert('Error', 'Unable to make phone call. Please dial +1 (555) 123-4567');
            });
          }
        },
      ]
    );
  };

  const handleLiveChat = () => {
    Alert.alert('Live Chat', 'Live chat feature coming soon! For immediate assistance, please email us or call our support line.');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSubtitle}>We're here to help you</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => handleContactSupport()}
        >
          <Ionicons name="mail-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Immediate Help</Text>
          
          <View style={styles.quickContactRow}>
            <TouchableOpacity
              style={[styles.quickContactButton, { backgroundColor: '#EEF2FF' }]}
              onPress={() => handleContactSupport()}
              activeOpacity={0.7}
            >
              <Ionicons name="mail" size={20} color="#6366F1" />
              <Text style={[styles.quickContactText, { color: '#6366F1' }]}>Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickContactButton, { backgroundColor: '#F0FDF4' }]}
              onPress={handlePhoneSupport}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={20} color="#10B981" />
              <Text style={[styles.quickContactText, { color: '#10B981' }]}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickContactButton, { backgroundColor: '#FEF3F2' }]}
              onPress={handleLiveChat}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble" size={20} color="#EF4444" />
              <Text style={[styles.quickContactText, { color: '#EF4444' }]}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          {supportCategories.map((category) => (
            <SupportCategory
              key={category.id}
              category={category}
              onPress={() => handleCategoryPress(category)}
            />
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
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

        {/* Contact Information */}
        <View style={styles.section}>
          <View style={styles.contactHeader}>
            <Ionicons name="headset" size={20} color="#6366F1" />
            <Text style={styles.contactTitle}>Contact Information</Text>
          </View>
          
          <View style={styles.contactMethods}>
            <TouchableOpacity 
              style={styles.contactMethod}
              onPress={() => handleContactSupport()}
            >
              <Ionicons name="mail-outline" size={16} color="#6366F1" />
              <Text style={styles.contactMethodText}>support@fiestacarts.com</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactMethod}
              onPress={handlePhoneSupport}
            >
              <Ionicons name="call-outline" size={16} color="#10B981" />
              <Text style={styles.contactMethodText}>+1 (555) 123-4567</Text>
            </TouchableOpacity>
            
            <View style={styles.contactMethod}>
              <Ionicons name="time-outline" size={16} color="#F59E0B" />
              <Text style={styles.contactMethodText}>24/7 Support Available</Text>
            </View>
          </View>
        </View>

        <View style={styles.spacing} />
      </ScrollView>

      {/* Contact Support Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.contactSupportButton}
          onPress={() => handleContactSupport()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.contactSupportButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="mail" size={20} color="white" />
            <Text style={styles.contactSupportButtonText}>Contact Support</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 20,
  },
  quickContactRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickContactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  quickContactText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  faqCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqCardExpanded: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginRight: 12,
    lineHeight: 22,
  },
  faqAnswerContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
  },
  contactMethods: {
    gap: 12,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactMethodText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  contactSupportButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  contactSupportButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  contactSupportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  spacing: {
    height: 24,
  },
});

export default HelpSupportScreen; 