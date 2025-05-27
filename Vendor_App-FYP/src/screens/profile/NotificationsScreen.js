import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Switch,
} from 'react-native';
import { Text, Card, Icon, Divider } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

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
];

const NotificationPreferences = ({ preferences, onToggle }) => {
  return (
    <Card containerStyle={styles.preferencesCard}>
      <Text style={styles.sectionTitle}>Notification Preferences</Text>
      <Divider style={styles.divider} />
      
      {Object.entries(preferences).map(([key, value]) => (
        <View key={key} style={styles.preferenceItem}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceTitle}>
              {key.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </Text>
            <Text style={styles.preferenceDescription}>
              Receive notifications for {key.split('_').join(' ')}
            </Text>
          </View>
          <Switch
            value={value}
            onValueChange={(newValue) => onToggle(key, newValue)}
            trackColor={{ false: '#DFE6E9', true: '#ff4500' }}
            thumbColor="#FFFFFF"
          />
        </View>
      ))}
    </Card>
  );
};

const NotificationItem = ({ notification }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return 'event';
      case 'payment':
        return 'payment';
      case 'message':
        return 'message';
      default:
        return 'notifications';
    }
  };

  return (
    <Card containerStyle={[styles.notificationCard, notification.read && styles.readNotification]}>
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIcon}>
          <Icon
            name={getNotificationIcon(notification.type)}
            type="material"
            size={24}
            color="#ff4500"
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <Text style={styles.notificationTime}>{notification.timestamp}</Text>
        </View>
        {!notification.read && <View style={styles.unreadDot} />}
      </View>
    </Card>
  );
};

const NotificationsScreen = () => {
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

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView style={styles.content}>
        <NotificationPreferences
          preferences={notificationPreferences}
          onToggle={handleTogglePreference}
        />

        <View style={styles.notificationsSection}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          {mockNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    backgroundColor: "#F5F6FA",
  },
  title: {
    color: "#2D3436",
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  preferencesCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 10,
  },
  divider: {
    marginBottom: 15,
  },
  preferenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 10,
  },
  preferenceTitle: {
    fontSize: 16,
    color: "#2D3436",
    marginBottom: 5,
  },
  preferenceDescription: {
    fontSize: 14,
    color: "#636E72",
  },
  notificationsSection: {
    marginTop: 20,
  },
  notificationCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  readNotification: {
    backgroundColor: "#F5F6FA",
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notificationIcon: {
    marginRight: 15,
    backgroundColor: "#ffe0cc",
    padding: 10,
    borderRadius: 10,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#636E72",
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: "#95A5A6",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff4500",
    marginLeft: 10,
  },
});

export default NotificationsScreen; 