import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const TERMS_SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: 'By downloading, installing, or using the FiestaCarts mobile application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our app.',
  },
  {
    title: '2. Description of Service',
    content: 'FiestaCarts is a platform that connects users with event vendors and service providers. We facilitate bookings and payments between users and vendors but are not directly responsible for the services provided by vendors.',
  },
  {
    title: '3. User Accounts',
    content: 'You must create an account to use certain features of our app. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
  },
  {
    title: '4. Booking and Payments',
    content: 'When you book a vendor through our platform, you agree to pay the specified amount. All payments are processed securely through our payment partners. Cancellation policies vary by vendor.',
  },
  {
    title: '5. User Conduct',
    content: 'You agree not to use the app for any unlawful purpose or in any way that could damage, disable, or impair the app. You must not attempt to gain unauthorized access to any part of the app or its systems.',
  },
  {
    title: '6. Vendor Responsibilities',
    content: 'Vendors are independent contractors responsible for their own services. FiestaCarts does not guarantee the quality or availability of vendor services and is not liable for any issues arising from vendor services.',
  },
  {
    title: '7. Intellectual Property',
    content: 'The app and its content are owned by FiestaCarts and are protected by copyright and other intellectual property laws. You may not copy, modify, or distribute any part of the app without permission.',
  },
  {
    title: '8. Privacy',
    content: 'Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.',
  },
  {
    title: '9. Disclaimers',
    content: 'The app is provided "as is" without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to warranties of merchantability and fitness for a particular purpose.',
  },
  {
    title: '10. Limitation of Liability',
    content: 'FiestaCarts shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the app, even if we have been advised of the possibility of such damages.',
  },
  {
    title: '11. Changes to Terms',
    content: 'We reserve the right to modify these terms at any time. We will notify users of significant changes through the app or by email. Continued use of the app after changes constitutes acceptance of the new terms.',
  },
  {
    title: '12. Contact Information',
    content: 'If you have any questions about these Terms of Service, please contact us at legal@fiestacarts.com or through our support channels in the app.',
  },
];

export default function TermsScreen({ navigation }) {
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
            
            <Text style={styles.headerTitle}>Terms of Service</Text>
            
            <View style={styles.headerRight} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <View style={styles.introCard}>
            <View style={styles.introIconContainer}>
              <Ionicons name="document-text-outline" size={32} color="#8B5CF6" />
            </View>
            <Text style={styles.introTitle}>Terms of Service</Text>
            <Text style={styles.introSubtitle}>Last updated: March 2024</Text>
            <Text style={styles.introText}>
              Please read these Terms of Service carefully before using the FiestaCarts application.
            </Text>
          </View>
        </View>

        {/* Terms Sections */}
        <View style={styles.termsSection}>
          {TERMS_SECTIONS.map((section, index) => (
            <View key={index} style={styles.termCard}>
              <Text style={styles.termTitle}>{section.title}</Text>
              <Text style={styles.termContent}>{section.content}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <View style={styles.footerCard}>
            <Ionicons name="information-circle-outline" size={24} color="#8B5CF6" />
            <Text style={styles.footerTitle}>Questions?</Text>
            <Text style={styles.footerText}>
              If you have any questions about these terms, please contact our support team.
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
                <Ionicons name="mail-outline" size={18} color="#FFF" />
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
  termsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  termCard: {
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
  termTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  termContent: {
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