import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch } from 'react-native';
import { ListItem, Icon, Divider } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';

// Mock data - will be replaced with real API data later
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Booking Confirmed',
    message: 'Your booking with Gourmet Catering Co. has been confirmed.',
    type: 'booking',
    timestamp: new Date('2024-03-10T10:30:00'),
    isRead: true,
  },
  {
    id: '2',
    title: 'Payment Successful',
    message: 'Payment of $2,500 has been processed successfully.',
    type: 'payment',
    timestamp: new Date('2024-03-09T15:45:00'),
    isRead: true,
  },
  {
    id: '3',
    title: 'Special Offer',
    message: 'Get 15% off on your next booking!',
    type: 'promotion',
    timestamp: new Date('2024-03-08T09:00:00'),
    isRead: false,
  },
];

const NOTIFICATION_SETTINGS = [
  {
    id: 'booking_updates',
    title: 'Booking Updates',
    description: 'Notifications about your bookings and updates',
    defaultValue: true,
  },
  {
    id: 'payment_alerts',
    title: 'Payment Alerts',
    description: 'Notifications about payments and transactions',
    defaultValue: true,
  },
  {
    id: 'promotions',
    title: 'Promotions',
    description: 'Special offers and promotional messages',
    defaultValue: false,
  },
  {
    id: 'vendor_updates',
    title: 'Vendor Updates',
    description: 'Updates from vendors you\'ve booked with',
    defaultValue: true,
  },
];

const NotificationItem = ({ notification }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'booking':
        return 'event';
      case 'payment':
        return 'payment';
      case 'promotion':
        return 'local-offer';
      default:
        return 'notifications';
    }
  };

  return (
    <ListItem
      containerStyle={[
        styles.notificationItem,
        !notification.isRead && styles.unreadNotification,
      ]}
    >
      <Icon
        name={getIcon(notification.type)}
        color={colors.primary}
        size={24}
      />
      <ListItem.Content>
        <ListItem.Title style={styles.notificationTitle}>
          {notification.title}
        </ListItem.Title>
        <ListItem.Subtitle style={styles.notificationMessage}>
          {notification.message}
        </ListItem.Subtitle>
        <Text style={styles.timestamp}>
          {notification.timestamp.toLocaleString()}
        </Text>
      </ListItem.Content>
      {!notification.isRead && (
        <View style={styles.unreadDot} />
      )}
    </ListItem>
  );
};

export default function NotificationsScreen() {
  const [settings, setSettings] = useState(
    NOTIFICATION_SETTINGS.reduce((acc, setting) => ({
      ...acc,
      [setting.id]: setting.defaultValue,
    }), {})
  );

  const toggleSetting = (settingId) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: !prev[settingId],
    }));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        {NOTIFICATION_SETTINGS.map((setting) => (
          <ListItem key={setting.id} containerStyle={styles.settingItem}>
            <ListItem.Content>
              <ListItem.Title style={styles.settingTitle}>
                {setting.title}
              </ListItem.Title>
              <ListItem.Subtitle style={styles.settingDescription}>
                {setting.description}
              </ListItem.Subtitle>
            </ListItem.Content>
            <Switch
              value={settings[setting.id]}
              onValueChange={() => toggleSetting(setting.id)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </ListItem>
        ))}
      </View>

      <Divider style={styles.divider} />

      {/* Recent Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Notifications</Text>
        {MOCK_NOTIFICATIONS.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
          />
        ))}
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
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  settingItem: {
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  settingTitle: {
    ...typography.body,
    fontWeight: 'bold',
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textLight,
  },
  divider: {
    marginHorizontal: spacing.lg,
  },
  notificationItem: {
    marginBottom: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  unreadNotification: {
    backgroundColor: colors.background,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationTitle: {
    ...typography.body,
    fontWeight: 'bold',
  },
  notificationMessage: {
    ...typography.body,
    color: colors.textLight,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
}); 