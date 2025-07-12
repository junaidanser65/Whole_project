import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const PRIVACY_SECTIONS = [
  {
    title: '1. Information We Collect',
    content: 'We collect information you provide directly to us, such as when you create an account, book services, or contact us. This includes your name, email address, phone number, payment information, and any other information you choose to provide.',
  },
  {
    title: '2. How We Use Your Information',
    content: 'We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and events.',
  },
  {
    title: '3. Information Sharing',
    content: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with vendors you book, payment processors, and service providers who assist us.',
  },
  {
    title: '4. Data Security',
    content: 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.',
  },
  {
    title: '5. Data Retention',
    content: 'We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account and data at any time.',
  },
  {
    title: '6. Your Rights',
    content: 'You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us. Contact us if you wish to exercise these rights.',
  },
  {
    title: '7. Cookies and Tracking',
    content: 'We use cookies and similar tracking technologies to collect information about your use of our app and services. You can control cookies through your device settings.',
  },
  {
    title: '8. Third-Party Services',
    content: 'Our app may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.',
  },
  {
    title: '9. Children\'s Privacy',
    content: 'Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information immediately.',
  },
  {
    title: '10. International Data Transfers',
    content: 'Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information during such transfers.',
  },
  {
    title: '11. Changes to This Policy',
    content: 'We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy in the app and updating the "last updated" date.',
  },
  {
    title: '12. Contact Us',
    content: 'If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@fiestacarts.com or through our support channels.',
  },
];

export default function PrivacyPolicyScreen({ navigation }) {
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
            
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            
            <View style={styles.headerRight} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <View style={styles.introCard}>
            <View style={styles.introIconContainer}>
              <Ionicons name="shield-checkmark-outline" size={32} color="#8B5CF6" />
            </View>
            <Text style={styles.introTitle}>Privacy Policy</Text>
            <Text style={styles.introSubtitle}>Last updated: March 2024</Text>
            <Text style={styles.introText}>
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information when you use FiestaCarts.
            </Text>
          </View>
        </View>

        {/* Privacy Sections */}
        <View style={styles.privacySection}>
          {PRIVACY_SECTIONS.map((section, index) => (
            <View key={index} style={styles.privacyCard}>
              <Text style={styles.privacyTitle}>{section.title}</Text>
              <Text style={styles.privacyContent}>{section.content}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <View style={styles.footerCard}>
            <Ionicons name="mail-outline" size={24} color="#8B5CF6" />
            <Text style={styles.footerTitle}>Questions About Privacy?</Text>
            <Text style={styles.footerText}>
              If you have any questions about this privacy policy or how we handle your data, please don't hesitate to contact us.
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => navigation.navigate('Support')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                style={styles.contactButtonGradient}
              >
                <Ionicons name="help-circle-outline" size={18} color="#FFF" />
                <Text style={styles.contactButtonText}>Contact Support</Text>
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
  introSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  introCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  introIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  introSubtitle: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: 16,
  },
  introText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  privacySection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  privacyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  privacyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  privacyContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  footerSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  footerCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  contactButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  contactButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 6,
  },
  bottomPadding: {
    height: 100,
  },
}); 