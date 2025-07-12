import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const PolicySection = ({ title, content, icon }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIcon, { backgroundColor: `#6366F115` }]}>
        <Ionicons name={icon} size={20} color="#6366F1" />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <Text style={styles.sectionContent}>{content}</Text>
  </View>
);

const PrivacyPolicyScreen = ({ navigation }) => {
  const policyContent = [
    {
      title: 'Information We Collect',
      icon: 'information-circle-outline',
      content: 'We collect information that you provide directly to us, including your name, email address, phone number, business information, and payment details. We also collect information about your use of our services, including your booking history, preferences, and app usage patterns to improve your experience.',
    },
    {
      title: 'How We Use Your Information',
      icon: 'settings-outline',
      content: 'We use the information we collect to provide and improve our services, process your bookings and payments, communicate with you about your account and services, send you marketing communications (with your consent), personalize your experience, and ensure the security of our platform.',
    },
    {
      title: 'Information Sharing',
      icon: 'share-outline',
      content: 'We may share your information with vendors you book through our platform (limited to necessary booking details), payment processors for transaction processing, and trusted service providers who assist in operating our platform. We never sell your personal information to third parties for marketing purposes.',
    },
    {
      title: 'Data Security',
      icon: 'shield-checkmark-outline',
      content: 'We implement industry-standard security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, regular security audits, and staff training on data protection.',
    },
    {
      title: 'Your Rights',
      icon: 'key-outline',
      content: 'You have the right to access, correct, or delete your personal information. You can also opt out of marketing communications, modify your notification preferences, request data portability, and withdraw consent for data processing where applicable under local privacy laws.',
    },
    {
      title: 'Cookies and Tracking',
      icon: 'eye-outline',
      content: 'We use cookies and similar tracking technologies to improve your experience on our platform, remember your preferences, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser or device preferences.',
    },
    {
      title: 'Data Retention',
      icon: 'time-outline',
      content: 'We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When data is no longer needed, we securely delete or anonymize it.',
    },
    {
      title: 'Changes to Privacy Policy',
      icon: 'refresh-outline',
      content: 'We may update this privacy policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the new policy on this page, updating the effective date, and sending you a notification if required by law.',
    },
  ];

  const lastUpdated = 'March 25, 2024';

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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.headerSubtitle}>Last updated {lastUpdated}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {
            // Share or download functionality
            console.log('Share privacy policy');
          }}
        >
          <Ionicons name="share-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <View style={styles.introHeader}>
            <Ionicons name="document-text" size={24} color="#6366F1" />
            <Text style={styles.introTitle}>Our Commitment to Privacy</Text>
          </View>
          <Text style={styles.introduction}>
            Welcome to Fiestacarts. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you use our mobile application 
            and services. Your privacy is important to us, and we are committed to protecting 
            your personal information while providing you with the best possible experience.
          </Text>
        </View>

        {/* Policy Content */}
        {policyContent.map((section, index) => (
          <PolicySection
            key={index}
            title={section.title}
            content={section.content}
            icon={section.icon}
          />
        ))}

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <View style={styles.contactHeader}>
            <Ionicons name="mail" size={20} color="#6366F1" />
            <Text style={styles.contactTitle}>Contact Us</Text>
          </View>
          <Text style={styles.contactDescription}>
            If you have any questions about this privacy policy or our practices, 
            please don't hesitate to contact us:
          </Text>
          
          <View style={styles.contactMethods}>
            <TouchableOpacity style={styles.contactMethod}>
              <Ionicons name="mail-outline" size={16} color="#6366F1" />
              <Text style={styles.contactMethodText}>privacy@fiestacarts.com</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactMethod}>
              <Ionicons name="call-outline" size={16} color="#6366F1" />
              <Text style={styles.contactMethodText}>+1 (555) 123-4567</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactMethod}>
              <Ionicons name="location-outline" size={16} color="#6366F1" />
              <Text style={styles.contactMethodText}>123 Privacy Street, Data City, DC 12345</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Agreement */}
        <View style={styles.footerSection}>
          <View style={styles.agreementCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <View style={styles.agreementContent}>
              <Text style={styles.agreementTitle}>Your Consent</Text>
              <Text style={styles.agreementText}>
                By using Fiestacarts, you agree to the collection and use of information 
                in accordance with this policy. We will continue to protect your privacy 
                and keep you informed of any changes.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.spacing} />
      </ScrollView>
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
  introSection: {
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
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 12,
  },
  introduction: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  sectionContent: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  contactSection: {
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
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
  },
  contactDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
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
  footerSection: {
    marginBottom: 16,
  },
  agreementCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  agreementContent: {
    flex: 1,
    marginLeft: 16,
  },
  agreementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  agreementText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  spacing: {
    height: 24,
  },
});

export default PrivacyPolicyScreen; 