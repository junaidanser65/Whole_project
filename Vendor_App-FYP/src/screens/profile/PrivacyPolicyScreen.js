import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import { Text, Divider } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

const PolicySection = ({ title, content }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionContent}>{content}</Text>
  </View>
);

const PrivacyPolicyScreen = () => {
  const policyContent = [
    {
      title: 'Information We Collect',
      content: 'We collect information that you provide directly to us, including your name, email address, phone number, and payment information. We also collect information about your use of our services, including your booking history and preferences.',
    },
    {
      title: 'How We Use Your Information',
      content: 'We use the information we collect to provide and improve our services, process your bookings, communicate with you about your bookings and our services, and personalize your experience.',
    },
    {
      title: 'Information Sharing',
      content: 'We may share your information with vendors you book through our platform, payment processors, and service providers who assist in operating our platform. We do not sell your personal information to third parties.',
    },
    {
      title: 'Data Security',
      content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
    },
    {
      title: 'Your Rights',
      content: 'You have the right to access, correct, or delete your personal information. You can also opt out of marketing communications and modify your notification preferences in your account settings.',
    },
    {
      title: 'Cookies and Tracking',
      content: 'We use cookies and similar tracking technologies to improve your experience on our platform. You can control cookie settings through your browser preferences.',
    },
    {
      title: 'Changes to Privacy Policy',
      content: 'We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the effective date.',
    },
    {
      title: 'Contact Us',
      content: 'If you have any questions about this privacy policy or our practices, please contact us at privacy@fiestacarts.com.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView style={styles.content}>
        <Text style={styles.introduction}>
          Welcome to Fiestacarts. This Privacy Policy explains how we collect, use, 
          disclose, and safeguard your information when you use our mobile application 
          and services. Please read this privacy policy carefully.
        </Text>

        <Divider style={styles.divider} />

        {policyContent.map((section, index) => (
          <React.Fragment key={index}>
            <PolicySection
              title={section.title}
              content={section.content}
            />
            {index < policyContent.length - 1 && (
              <Divider style={styles.divider} />
            )}
          </React.Fragment>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Fiestacarts, you agree to the collection and use of information 
            in accordance with this policy.
          </Text>
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
  header: {
    padding: 20,
    backgroundColor: '#F5F6FA',
  },
  title: {
    color: '#2D3436',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  lastUpdated: {
    color: '#636E72',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  introduction: {
    fontSize: 16,
    color: '#2D3436',
    lineHeight: 24,
    marginBottom: 20,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 22,
  },
  divider: {
    marginVertical: 15,
    backgroundColor: '#DFE6E9',
  },
  footer: {
    marginTop: 30,
    marginBottom: 40,
    padding: 15,
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PrivacyPolicyScreen; 