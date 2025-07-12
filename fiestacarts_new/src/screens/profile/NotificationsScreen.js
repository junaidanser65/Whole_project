import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data - will be replaced with real API data later
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Booking Confirmed',
    message: 'Your booking with Gourmet Catering Co. has been confirmed for March 15th.',
    type: 'booking',
    timestamp: new Date('2024-03-10T10:30:00'),
    isRead: false,
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
    message: 'Get 15% off on your next booking! Limited time offer.',
    type: 'promotion',
    timestamp: new Date('2024-03-08T09:00:00'),
    isRead: false,
  },
  {
    id: '4',
    title: 'Vendor Update',
    message: 'Elite Decorators has updated their menu with new decoration options.',
    type: 'vendor',
    timestamp: new Date('2024-03-07T14:20:00'),
    isRead: true,
  },
];

const NOTIFICATION_SETTINGS = [
  {
    id: 'booking_updates',
    title: 'Booking Updates',
    description: 'Notifications about your bookings and updates',
    icon: 'calendar-outline',
    defaultValue: true,
  },
  {
    id: 'payment_alerts',
    title: 'Payment Alerts',
    description: 'Notifications about payments and transactions',
    icon: 'card-outline',
    defaultValue: true,
  },
  {
    id: 'promotions',
    title: 'Promotions',
    description: 'Special offers and promotional messages',
    icon: 'gift-outline',
    defaultValue: false,
  },
  {
    id: 'vendor_updates',
    title: 'Vendor Updates',
    description: 'Updates from vendors you\'ve booked with',
    icon: 'storefront-outline',
    defaultValue: true,
  },
];

const NotificationItem = ({ notification, onPress }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'booking':
        return 'calendar-outline';
      case 'payment':
        return 'card-outline';
      case 'promotion':
        return 'gift-outline';
      case 'vendor':
        return 'storefront-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'booking':
        return '#10B981';
      case 'payment':
        return '#8B5CF6';
      case 'promotion':
        return '#F59E0B';
      case 'vendor':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadNotification,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: getIconColor(notification.type) + '20' }]}>
        <Ionicons
          name={getIcon(notification.type)}
          size={24}
          color={getIconColor(notification.type)}
        />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(notification.timestamp)}</Text>
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {notification.message}
        </Text>
      </View>
      {!notification.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

export default function NotificationsScreen({ navigation }) {
  const [settings, setSettings] = useState(
    NOTIFICATION_SETTINGS.reduce((acc, setting) => ({
      ...acc,
      [setting.id]: setting.defaultValue,
    }), {})
  );

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const toggleSetting = (settingId) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: !prev[settingId],
    }));
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
            
            <Text style={styles.headerTitle}>Notifications</Text>
            
            {unreadCount > 0 && (
              <TouchableOpacity 
                style={styles.markAllButton}
                onPress={markAllAsRead}
              >
                <Text style={styles.markAllText}>Mark All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {unreadCount > 0 && (
            <View style={styles.unreadBanner}>
              <Text style={styles.unreadText}>
                You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          <View style={styles.settingsCard}>
            {NOTIFICATION_SETTINGS.map((setting, index) => (
              <View key={setting.id}>
                <View style={styles.settingItem}>
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
                {index < NOTIFICATION_SETTINGS.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Recent Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          <View style={styles.notificationsCard}>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <View key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onPress={() => markAsRead(notification.id)}
                  />
                  {index < notifications.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-outline" size={64} color="#CBD5E1" />
                <Text style={styles.emptyStateTitle}>No notifications yet</Text>
                <Text style={styles.emptyStateText}>
                  You'll see your notifications here when you receive them
                </Text>
              </View>
            )}
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
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  unreadBanner: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  unreadText: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '500',
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
  settingsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationsCard: {
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
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: '#F8FAFC',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
}); 