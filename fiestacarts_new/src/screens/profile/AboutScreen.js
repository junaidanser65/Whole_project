import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const APP_INFO = {
  version: '1.0.0',
  buildNumber: '2024.03.001',
  releaseDate: 'March 2024',
  description: 'FiestaCarts is your one-stop platform for discovering and booking the best event vendors. From catering to decoration, photography to music, we connect you with trusted professionals to make your events memorable.',
};

const TEAM_MEMBERS = [
  {
    name: 'Development Team',
    role: 'Mobile & Backend Development',
    icon: 'code-outline',
  },
  {
    name: 'Design Team',
    role: 'UI/UX Design',
    icon: 'color-palette-outline',
  },
  {
    name: 'Product Team',
    role: 'Product Strategy',
    icon: 'bulb-outline',
  },
];

const SOCIAL_LINKS = [
  {
    name: 'Website',
    url: 'https://fiestacarts.com',
    icon: 'globe-outline',
  },
  {
    name: 'Facebook',
    url: 'https://facebook.com/fiestacarts',
    icon: 'logo-facebook',
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com/fiestacarts',
    icon: 'logo-twitter',
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/fiestacarts',
    icon: 'logo-instagram',
  },
];

export default function AboutScreen({ navigation }) {
  const handleSocialLink = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Could not open URL:', error);
    }
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
            
            <Text style={styles.headerTitle}>About</Text>
            
            <View style={styles.headerRight} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfoCard}>
            <View style={styles.appIconContainer}>
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                style={styles.appIcon}
              >
                <Ionicons name="storefront" size={48} color="#FFF" />
              </LinearGradient>
            </View>
            <Text style={styles.appName}>FiestaCarts</Text>
            <Text style={styles.appTagline}>Your Event, Our Vendors</Text>
            <Text style={styles.appDescription}>{APP_INFO.description}</Text>
          </View>
        </View>

        {/* Version Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Ionicons name="information-circle-outline" size={20} color="#8B5CF6" />
                <Text style={styles.infoLabel}>Version</Text>
              </View>
              <Text style={styles.infoValue}>{APP_INFO.version}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Ionicons name="build-outline" size={20} color="#8B5CF6" />
                <Text style={styles.infoLabel}>Build</Text>
              </View>
              <Text style={styles.infoValue}>{APP_INFO.buildNumber}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Ionicons name="calendar-outline" size={20} color="#8B5CF6" />
                <Text style={styles.infoLabel}>Release Date</Text>
              </View>
              <Text style={styles.infoValue}>{APP_INFO.releaseDate}</Text>
            </View>
          </View>
        </View>

        {/* Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Team</Text>
          <View style={styles.teamCard}>
            {TEAM_MEMBERS.map((member, index) => (
              <View key={index}>
                <View style={styles.teamMember}>
                  <View style={styles.teamMemberLeft}>
                    <View style={styles.teamMemberIcon}>
                      <Ionicons name={member.icon} size={24} color="#8B5CF6" />
                    </View>
                    <View>
                      <Text style={styles.teamMemberName}>{member.name}</Text>
                      <Text style={styles.teamMemberRole}>{member.role}</Text>
                    </View>
                  </View>
                </View>
                {index < TEAM_MEMBERS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect With Us</Text>
          <View style={styles.socialGrid}>
            {SOCIAL_LINKS.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={styles.socialButton}
                onPress={() => handleSocialLink(link.url)}
                activeOpacity={0.7}
              >
                <View style={styles.socialIconContainer}>
                  <Ionicons name={link.icon} size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.socialName}>{link.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.legalCard}>
            <TouchableOpacity
              style={styles.legalItem}
              onPress={() => navigation.navigate('Terms')}
              activeOpacity={0.7}
            >
              <View style={styles.legalLeft}>
                <Ionicons name="document-text-outline" size={20} color="#8B5CF6" />
                <Text style={styles.legalLabel}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.legalItem}
              onPress={() => navigation.navigate('PrivacyPolicy')}
              activeOpacity={0.7}
            >
              <View style={styles.legalLeft}>
                <Ionicons name="shield-outline" size={20} color="#8B5CF6" />
                <Text style={styles.legalLabel}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>
            © 2024 FiestaCarts. All rights reserved.
          </Text>
          <Text style={styles.copyrightSubtext}>
            Made with ❤️ for amazing events
          </Text>
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
  appInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  appIconContainer: {
    marginBottom: 16,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: 16,
  },
  appDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  teamCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  teamMember: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  teamMemberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamMemberIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  teamMemberName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  teamMemberRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  socialButton: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  socialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  socialName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  legalCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  legalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  legalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 20,
  },
  copyrightSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  copyrightText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  copyrightSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bottomPadding: {
    height: 50,
  },
}); 