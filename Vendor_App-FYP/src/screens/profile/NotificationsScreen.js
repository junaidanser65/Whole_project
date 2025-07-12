import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Mock data for notifications
const mockNotifications = [
  {
    id: '1',
    title: 'Booking Confirmed',
    message: 'Your booking with Event Solutions Pro has been confirmed.',
    timestamp: '2024-03-25 14:30',
    type: 'booking',
    read: false,
  },
  {
    id: '2',
    title: 'Payment Successful',
    message: 'Payment of $299 has been processed successfully.',
    timestamp: '2024-03-24 10:15',
    type: 'payment',
    read: true,
  },
  {
    id: '3',
    title: 'New Message',
    message: 'You have a new message from Sound & Lighting Experts.',
    timestamp: '2024-03-23 16:45',
    type: 'message',
    read: true,
  },
  {
    id: '4',
    title: 'Profile Updated',
    message: 'Your business profile has been successfully updated.',
    timestamp: '2024-03-22 09:20',
    type: 'profile',
    read: true,
  },
];

const NotificationPreferences = ({ preferences, onToggle }) => {
  const preferenceItems = [
    {
      key: 'booking_updates',
      icon: 'calendar-outline',
      title: 'Booking Updates',
      description: 'Get notified about booking confirmations and changes',
      color: '#6366F1'
    },
    {
      key: 'payment_notifications',
      icon: 'card-outline',
      title: 'Payment Notifications',
      description: 'Receive alerts for successful payments and transactions',
      color: '#10B981'
    },
    {
      key: 'chat_messages',
      icon: 'chatbubble-outline',
      title: 'Chat Messages',
      description: 'Get notified when you receive new messages',
      color: '#3B82F6'
    },
    {
      key: 'promotional_offers',
      icon: 'gift-outline',
      title: 'Promotional Offers',
      description: 'Receive updates about special offers and promotions',
      color: '#F59E0B'
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notification Preferences</Text>
      
      {preferenceItems.map((item) => (
        <View key={item.key} style={styles.preferenceItem}>
          <View style={[styles.preferenceIcon, { backgroundColor: `${item.color}15` }]}>
            <Ionicons name={item.icon} size={20} color={item.color} />
          </View>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceTitle}>{item.title}</Text>
            <Text style={styles.preferenceDescription}>{item.description}</Text>
          </View>
          <Switch
            value={preferences[item.key]}
            onValueChange={(newValue) => onToggle(item.key, newValue)}
            trackColor={{ false: '#E2E8F0', true: '#6366F1' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E2E8F0"
          />
        </View>
      ))}
    </View>
  );
};

const NotificationItem = ({ notification, onPress }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return { name: 'calendar', color: '#6366F1' };
      case 'payment':
        return { name: 'card', color: '#10B981' };
      case 'message':
        return { name: 'chatbubble', color: '#3B82F6' };
      case 'profile':
        return { name: 'person', color: '#8B5CF6' };
      default:
        return { name: 'notifications', color: '#94A3B8' };
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const iconConfig = getNotificationIcon(notification.type);

  return (
    <TouchableOpacity 
      style={[
        styles.notificationCard, 
        !notification.read && styles.unreadNotification
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.notificationIcon, { backgroundColor: `${iconConfig.color}15` }]}>
        <Ionicons name={iconConfig.name} size={20} color={iconConfig.color} />
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          {!notification.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.notificationTime}>{getTimeAgo(notification.timestamp)}</Text>
      </View>
      
      <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
    </TouchableOpacity>
  );
};

const NotificationsScreen = ({ navigation }) => {
  const [notificationPreferences, setNotificationPreferences] = useState({
    booking_updates: true,
    payment_notifications: true,
    promotional_offers: false,
    chat_messages: true,
  });

  const handleTogglePreference = (key, value) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNotificationPress = (notification) => {
    // Handle notification tap - mark as read, navigate to relevant screen
    console.log('Notification pressed:', notification);
  };

  const unreadCount = mockNotifications.filter(n => !n.read).length;

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
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {
            // Mark all as read functionality
            console.log('Mark all as read');
          }}
        >
          <Ionicons name="checkmark-done" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Preferences */}
        <NotificationPreferences
          preferences={notificationPreferences}
          onToggle={handleTogglePreference}
        />

        {/* Recent Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          
          {mockNotifications.length > 0 ? (
            mockNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={() => handleNotificationPress(notification)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No Notifications</Text>
              <Text style={styles.emptyStateText}>
                You're all caught up! New notifications will appear here.
              </Text>
            </View>
          )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 20,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unreadNotification: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
    borderWidth: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
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
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  spacing: {
    height: 24,
  },
});

export default NotificationsScreen; 