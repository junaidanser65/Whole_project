import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
  Text,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SearchBar, Icon, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getRecentActivities, getVendorReviews, getAllRecentActivities } from '../../services/api';

const ACTIVITY_FILTERS = [
  { id: 'all', label: 'All Activities' },
  { id: 'booking', label: 'Bookings' },
  { id: 'payment', label: 'Payments' },
  { id: 'review', label: 'Reviews' },
  { id: 'chat', label: 'Chats' }
];

const AllActivitiesScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const fadeAnim = new Animated.Value(1);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to format time ago
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    return 'Just now';
  };

  const fetchActivities = async () => {
    try {
      const response = await getAllRecentActivities();
      if (response.success) {
        const formattedActivities = [];
        
        // Add all pending bookings
        if (response.activities.pendingBookings) {
          response.activities.pendingBookings.forEach(booking => {
            formattedActivities.push({
              id: `booking-${booking.id}`,
              type: 'booking',
              title: 'New Booking Request',
              description: `${booking.user_name} - ${new Date(booking.booking_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}`,
              time: getTimeAgo(booking.created_at),
              timestamp: new Date(booking.created_at).getTime(),
              amount: `$${booking.total_amount}`,
              data: booking
            });
          });
        }

        // Add all completed payments
        if (response.activities.completedPayments) {
          response.activities.completedPayments.forEach(payment => {
            formattedActivities.push({
              id: `payment-${payment.id}`,
              type: 'payment',
              title: 'Payment Received',
              description: `${payment.user_name} - ${new Date(payment.booking_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}`,
              time: getTimeAgo(payment.updated_at),
              timestamp: new Date(payment.updated_at).getTime(),
              amount: `$${payment.total_amount}`,
              data: payment
            });
          });
        }

        // Add all reviews
        if (response.activities.reviews) {
          response.activities.reviews.forEach(review => {
            formattedActivities.push({
              id: `review-${review.id}`,
              type: 'review',
              title: 'New Review',
              description: `${review.user_name} - ${new Date(review.booking_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}`,
              time: getTimeAgo(review.created_at),
              timestamp: new Date(review.created_at).getTime(),
              rating: review.rating,
              data: review
            });
          });
        }

        // Add all chat messages
        if (response.activities.chatMessages) {
          response.activities.chatMessages
            .filter(chat => chat.sender_type === 'user') // Only show messages from users
            .forEach(chat => {
              formattedActivities.push({
                id: `chat-${chat.id}`,
                type: 'chat',
                title: 'New Message',
                description: `${chat.user_name}: ${chat.message.substring(0, 50)}${chat.message.length > 50 ? '...' : ''}`,
                time: getTimeAgo(chat.created_at),
                timestamp: new Date(chat.created_at).getTime(),
                data: chat
              });
            });
        }

        // Sort all activities by timestamp (newest first)
        formattedActivities.sort((a, b) => b.timestamp - a.timestamp);

        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = selectedFilter === 'all' || activity.type === selectedFilter;
    const matchesSearch = searchQuery === '' || 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderActivityItem = ({ item }) => (
    <ActivityItem
      activity={item}
      onPress={() => {
        switch (item.type) {
          case 'booking':
            navigation.navigate('Bookings', { 
              initialTab: 'pending',
              bookingId: item.data.id 
            });
            break;
          case 'payment':
            navigation.navigate('Bookings', { 
              initialTab: 'completed',
              bookingId: item.data.id 
            });
            break;
          case 'review':
            navigation.navigate('ReviewDetails', {
              reviewId: item.data.id,
              title: `Review - ${item.data.user_name}`,
            });
            break;
          case 'chat':
            navigation.navigate('Chat', {
              conversationId: item.data.conversation_id,
              userName: item.data.user_name
            });
            break;
        }
      }}
    />
  );

  const getActivityIcon = (type) => {
    switch (type) {
      case 'booking':
        return 'calendar-outline';
      case 'payment':
        return 'wallet-outline';
      case 'review':
        return 'star-outline';
      case 'chat':
        return 'chatbubble-outline';
      default:
        return 'notifications-outline';
    }
  };

  const ActivityItem = ({ activity }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => {
        switch (activity.type) {
          case 'booking':
            navigation.navigate('Bookings', { 
              initialTab: 'pending',
              bookingId: activity.data.id 
            });
            break;
          case 'payment':
            navigation.navigate('Bookings', { 
              initialTab: 'completed',
              bookingId: activity.data.id 
            });
            break;
          case 'review':
            navigation.navigate('ReviewDetails', {
              reviewId: activity.data.id,
              title: `Review - ${activity.data.user_name}`,
            });
            break;
          case 'chat':
            navigation.navigate('Chat', {
              conversationId: activity.data.conversation_id,
              userName: activity.data.user_name
            });
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
        {activity.type === 'review' && (
          <View style={styles.ratingContainer}>
            <Icon name="star" type="material" size={16} color="#FFB800" />
            <Text style={styles.ratingText}>{activity.rating}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchActivities().finally(() => setRefreshing(false));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={["#ff4500", "#cc3700"]}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" type="material" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Activities</Text>
          </View>
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

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff4500" />
        </View>
      ) : (
        <FlatList
          data={filteredActivities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderActivityItem}
          contentContainerStyle={styles.activitiesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.noActivitiesText}>No activities found</Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#ff4500"]}
              tintColor="#ff4500"
            />
          }
        />
      )}
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginLeft: 10,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noActivitiesText: {
    textAlign: 'center',
    color: '#636E72',
    fontSize: 16,
    marginTop: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginLeft: 4,
  },
  chatIcon: {
    backgroundColor: '#00b894',
  },
});

export default AllActivitiesScreen; 