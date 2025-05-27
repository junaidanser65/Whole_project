import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch } from 'react-native';
import { Icon, Divider } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    darkMode: false,
    locationServices: true,
    autoPlay: false,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="notifications" color={colors.primary} size={24} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive push notifications for bookings and updates
              </Text>
            </View>
          </View>
          <Switch
            value={settings.pushNotifications}
            onValueChange={() => toggleSetting('pushNotifications')}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        <Divider style={styles.divider} />
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="email" color={colors.primary} size={24} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Email Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive booking confirmations and reminders via email
              </Text>
            </View>
          </View>
          <Switch
            value={settings.emailNotifications}
            onValueChange={() => toggleSetting('emailNotifications')}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="dark-mode" color={colors.primary} size={24} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Switch between light and dark theme
              </Text>
            </View>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={() => toggleSetting('darkMode')}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        <Divider style={styles.divider} />
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="location-on" color={colors.primary} size={24} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Location Services</Text>
              <Text style={styles.settingDescription}>
                Allow app to access your location
              </Text>
            </View>
          </View>
          <Switch
            value={settings.locationServices}
            onValueChange={() => toggleSetting('locationServices')}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Version</Text>
        <Text style={styles.versionText}>1.0.0</Text>
      </View>
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
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  settingText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textLight,
  },
  divider: {
    marginVertical: spacing.sm,
  },
  versionText: {
    ...typography.body,
    color: colors.textLight,
  },
}); 