import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
  Text,
} from 'react-native';
import { SearchBar, Icon, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const ACTIVITY_FILTERS = [
  { id: 'all', label: 'All Activities' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'payments', label: 'Payments' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'messages', label: 'Messages' },
];

const AllActivitiesScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = new Animated.Value(1);

  // Mock activities data
  const activities = [
    {
      id: '1',
      type: 'booking',
      title: 'New Booking Request',
      description: 'Wedding Reception - Sarah Johnson',
      date: '24 Feb 2024',
      time: '2:30 PM',
      status: 'pending',
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Received',
      description: 'Corporate Event - Mike Anderson',
      date: '24 Feb 2024',
      time: '1:45 PM',
      amount: '$1,800',
    },
    {
      id: '3',
      type: 'review',
      title: 'New Review',
      description: '5-star rating from Emily Wilson',
      date: '24 Feb 2024',
      time: '11:20 AM',
    },
    {
      id: '4',
      type: 'message',
      title: 'New Message',
      description: 'From: John Smith',
      date: '24 Feb 2024',
      time: '10:15 AM',
      preview: 'Hi, I would like to discuss the menu options...',
    },
  ];

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = selectedFilter === 'all' || activity.type === selectedFilter.slice(0, -1);
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActivityIcon = (type) => {
    switch (type) {
      case 'booking':
        return 'event';
      case 'payment':
        return 'payment';
      case 'review':
        return 'star';
      case 'message':
        return 'message';
      default:
        return 'notifications';
    }
  };

  const ActivityItem = ({ activity }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => {
        switch (activity.type) {
          case 'booking':
            navigation.navigate('BookingDetails', { bookingId: activity.id });
            break;
          case 'payment':
            navigation.navigate('PaymentDetails', { paymentId: activity.id });
            break;
          case 'review':
            navigation.navigate('ReviewDetails', { reviewId: activity.id });
            break;
          case 'message':
            navigation.navigate('MessageDetails', { messageId: activity.id });
            break;
        }
      }}
    >
      <View style={[styles.iconContainer, styles[`${activity.type}Icon`]]}>
        <Icon
          name={getActivityIcon(activity.type)}
          type="material"
          size={24}
          color="#FFF"
        />
      </View>
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityTime}>{activity.time}</Text>
        </View>
        <Text style={styles.activityDescription}>{activity.description}</Text>
        {activity.type === 'payment' && (
          <Text style={styles.activityAmount}>{activity.amount}</Text>
        )}
        {activity.type === 'message' && (
          <Text style={styles.messagePreview} numberOfLines={1}>
            {activity.preview}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={["#ff4500", "#cc3700"]}
          style={styles.headerGradient}
        >
          <Text style={styles.title}>Activities</Text>
          <SearchBar
            placeholder="Search activities..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            containerStyle={styles.searchContainer}
            inputContainerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
            lightTheme
            round
          />
        </LinearGradient>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={ACTIVITY_FILTERS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === item.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(item.id)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === item.id && styles.filterButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      <FlatList
        data={filteredActivities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityItem activity={item} />}
        contentContainerStyle={styles.activitiesList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    overflow: 'hidden',
    backgroundColor: "#ff4500",
  },
  headerGradient: {
    padding: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 15,
  },
  searchContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  searchInputContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 16,
  },
  filterContainer: {
    backgroundColor: "#FFF",
    paddingVertical: 12,
    marginBottom: 12,
  },
  filterList: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F6FA",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#ff4500",
  },
  filterButtonText: {
    color: "#636E72",
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: "#FFF",
    fontWeight: "500",
  },
  activitiesList: {
    padding: 20,
  },
  activityItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  bookingIcon: {
    backgroundColor: "#4CAF50",
  },
  paymentIcon: {
    backgroundColor: "#2196F3",
  },
  reviewIcon: {
    backgroundColor: "#FFB800",
  },
  messageIcon: {
    backgroundColor: "#ff4500",
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
  },
  activityTime: {
    fontSize: 14,
    color: "#636E72",
  },
  activityDescription: {
    fontSize: 14,
    color: "#636E72",
    marginBottom: 4,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2196F3",
  },
  messagePreview: {
    fontSize: 14,
    color: "#636E72",
    fontStyle: "italic",
  },
});

export default AllActivitiesScreen; 