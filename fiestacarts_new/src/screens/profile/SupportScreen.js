import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform, TextInput, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SUPPORT_OPTIONS = [
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions',
    icon: 'help-circle-outline',
    action: 'navigate',
  },
  {
    id: 'chat',
    title: 'Live Chat',
    description: 'Chat with our support team',
    icon: 'chatbubble-outline',
    action: 'chat',
    available: true,
  },
  {
    id: 'email',
    title: 'Email Support',
    description: 'Send us an email',
    icon: 'mail-outline',
    action: 'email',
    contact: 'support@fiestacarts.com',
  },
  {
    id: 'phone',
    title: 'Phone Support',
    description: 'Call our support line',
    icon: 'call-outline',
    action: 'phone',
    contact: '+1 (555) 123-4567',
    hours: 'Mon-Fri 9AM-6PM EST',
  },
];

const FAQ_ITEMS = [
  {
    id: '1',
    question: 'How do I book a vendor?',
    answer: 'Browse vendors, select your preferred one, choose your date and time, then proceed with booking and payment.',
  },
  {
    id: '2',
    question: 'Can I cancel my booking?',
    answer: 'Yes, you can cancel bookings up to 24 hours before the event date. Cancellation fees may apply.',
  },
  {
    id: '3',
    question: 'How do I contact a vendor?',
    answer: 'You can message vendors directly through the app after making a booking.',
  },
  {
    id: '4',
    question: 'What payment methods are accepted?',
    answer: 'We accept all major credit cards, debit cards, and digital payment methods.',
  },
];

export default function SupportScreen({ navigation }) {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  });

  const handleSupportAction = async (option) => {
    switch (option.action) {
      case 'chat':
        Alert.alert('Live Chat', 'Live chat feature will be available soon!');
        break;
      case 'email':
        try {
          await Linking.openURL(`mailto:${option.contact}`);
        } catch (error) {
          Alert.alert('Error', 'Could not open email app');
        }
        break;
      case 'phone':
        try {
          await Linking.openURL(`tel:${option.contact}`);
        } catch (error) {
          Alert.alert('Error', 'Could not open phone app');
        }
        break;
      default:
        break;
    }
  };

  const handleSubmitContact = () => {
    if (!contactForm.subject || !contactForm.message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    Alert.alert('Success', 'Your message has been sent. We will get back to you soon!');
    setContactForm({ subject: '', message: '' });
  };

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      {/* Header */}
      <LinearGradient
        colors={["#6366F1", "#8B5CF6", "#A855F7"]}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Help & Support</Text>
            
            <View style={styles.headerRight} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Support Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          <View style={styles.supportGrid}>
            {SUPPORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.supportOption}
                onPress={() => handleSupportAction(option)}
                activeOpacity={0.7}
              >
                <View style={styles.supportIconContainer}>
                  <Ionicons name={option.icon} size={32} color="#8B5CF6" />
                </View>
                <Text style={styles.supportTitle}>{option.title}</Text>
                <Text style={styles.supportDescription}>{option.description}</Text>
                {option.contact && (
                  <Text style={styles.supportContact}>{option.contact}</Text>
                )}
                {option.hours && (
                  <Text style={styles.supportHours}>{option.hours}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqCard}>
            {FAQ_ITEMS.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity
                  style={styles.faqItem}
                  onPress={() => toggleFaq(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Ionicons 
                    name={expandedFaq === item.id ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
                {expandedFaq === item.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
                {index < FAQ_ITEMS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          <View style={styles.contactCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="What can we help you with?"
                  value={contactForm.subject}
                  onChangeText={(text) => setContactForm({...contactForm, subject: text})}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Describe your issue or question..."
                  value={contactForm.message}
                  onChangeText={(text) => setContactForm({...contactForm, message: text})}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitContact}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                style={styles.submitButtonGradient}
              >
                <Ionicons name="send-outline" size={20} color="#FFF" />
                <Text style={styles.submitButtonText}>Send Message</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    marginTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  supportOption: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  supportIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  supportContact: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    textAlign: 'center',
  },
  supportHours: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  faqCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textAreaContainer: {
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 20,
  },
  bottomPadding: {
    height: 100,
  },
}); 