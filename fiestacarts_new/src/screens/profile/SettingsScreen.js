import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SETTINGS_SECTIONS = [
  {
    title: 'Notifications',
    settings: [
      {
        id: 'pushNotifications',
        title: 'Push Notifications',
        description: 'Receive push notifications for bookings and updates',
        icon: 'notifications-outline',
        type: 'toggle',
      },
      {
        id: 'emailNotifications',
        title: 'Email Notifications',
        description: 'Receive booking confirmations and reminders via email',
        icon: 'mail-outline',
        type: 'toggle',
      },
      {
        id: 'smsNotifications',
        title: 'SMS Notifications',
        description: 'Receive SMS alerts for important updates',
        icon: 'chatbubble-outline',
        type: 'toggle',
      },
    ],
  },
  {
    title: 'App Preferences',
    settings: [
      {
        id: 'darkMode',
        title: 'Dark Mode',
        description: 'Switch between light and dark theme',
        icon: 'moon-outline',
        type: 'toggle',
      },
      {
        id: 'locationServices',
        title: 'Location Services',
        description: 'Allow app to access your location for better recommendations',
        icon: 'location-outline',
        type: 'toggle',
      },
      {
        id: 'autoPlay',
        title: 'Auto-play Videos',
        description: 'Automatically play videos in vendor galleries',
        icon: 'play-circle-outline',
        type: 'toggle',
      },
    ],
  },
  {
    title: 'Privacy & Security',
    settings: [
      {
        id: 'faceId',
        title: 'Face ID / Touch ID',
        description: 'Use biometric authentication for app access',
        icon: 'finger-print-outline',
        type: 'toggle',
      },
      {
        id: 'dataSharing',
        title: 'Data Sharing',
        description: 'Share usage data to improve app experience',
        icon: 'analytics-outline',
        type: 'toggle',
      },
    ],
  },
  {
    title: 'App Info',
    settings: [
      {
        id: 'version',
        title: 'App Version',
        description: '1.0.0',
        icon: 'information-circle-outline',
        type: 'info',
      },
      {
        id: 'storage',
        title: 'Storage Used',
        description: '45.2 MB',
        icon: 'folder-outline',
        type: 'info',
      },
    ],
  },
];

export default function SettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    locationServices: true,
    autoPlay: false,
    faceId: true,
    dataSharing: false,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderSettingItem = (setting) => {
    if (setting.type === 'toggle') {
      return (
        <View key={setting.id} style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Ionicons name={setting.icon} size={22} color="#8B5CF6" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDescription}>{setting.description}</Text>
            </View>
          </View>
          <Switch
            value={settings[setting.id]}
            onValueChange={() => toggleSetting(setting.id)}
            trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
            thumbColor={settings[setting.id] ? '#FFF' : '#F3F4F6'}
            ios_backgroundColor="#E5E7EB"
          />
        </View>
      );
    } else if (setting.type === 'info') {
      return (
        <View key={setting.id} style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Ionicons name={setting.icon} size={22} color="#8B5CF6" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDescription}>{setting.description}</Text>
            </View>
          </View>
        </View>
      );
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
            
            <Text style={styles.headerTitle}>Settings</Text>
            
            <View style={styles.headerRight} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {SETTINGS_SECTIONS.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.settings.map((setting, settingIndex) => (
                <View key={setting.id}>
                  {renderSettingItem(setting)}
                  {settingIndex < section.settings.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
        
        {/* Additional Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                // Handle clear cache
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Ionicons name="trash-outline" size={22} color="#EF4444" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Clear Cache</Text>
                  <Text style={styles.settingDescription}>Free up storage space</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                // Handle reset settings
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Ionicons name="refresh-outline" size={22} color="#F59E0B" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Reset Settings</Text>
                  <Text style={styles.settingDescription}>Restore default settings</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
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
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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