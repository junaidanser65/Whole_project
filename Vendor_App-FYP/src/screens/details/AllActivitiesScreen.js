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
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getRecentActivities, getVendorReviews, getAllRecentActivities } from '../../services/api';

const ACTIVITY_FILTERS = [
  { id: 'all', label: 'All Activities', icon: 'grid-outline' },
  { id: 'booking', label: 'Bookings', icon: 'calendar-outline' },
  { id: 'payment', label: 'Payments', icon: 'wallet-outline' },
  { id: 'review', label: 'Reviews', icon: 'star-outline' },
  { id: 'chat', label: 'Chats', icon: 'chatbubble-outline' }
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
      Alert.alert('Error', 'Failed to load activities. Please try again.');
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

  const getActivityColor = (type) => {
    switch (type) {
      case 'booking':
        return '#10B981'; // Emerald
      case 'payment':
        return '#3B82F6'; // Blue
      case 'review':
        return '#F59E0B'; // Amber
      case 'chat':
        return '#8B5CF6'; // Purple
      default:
        return '#6B7280'; // Gray
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
      <View style={[styles.iconContainer, { backgroundColor: getActivityColor(activity.type) }]}>
        <Ionicons
          name={getActivityIcon(activity.type)}
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
          <View style={styles.amountContainer}>
            <Text style={styles.activityAmount}>{activity.amount}</Text>
          </View>
        )}
        {activity.type === 'review' && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.ratingText}>{activity.rating}</Text>
          </View>
        )}
      </View>
      <View style={styles.chevronContainer}>
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchActivities().finally(() => setRefreshing(false));
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={["#6366F1", "#8B5CF6", "#A855F7"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>All Activities</Text>
            <Text style={styles.headerSubtitle}>
              {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search activities..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {ACTIVITY_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={filter.icon}
                size={16}
                color={selectedFilter === filter.id ? "#FFFFFF" : "#6366F1"}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter.id && styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Activities List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading activities...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredActivities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <ActivityItem activity={item} />}
          contentContainerStyle={styles.activitiesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Activities Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? "Try adjusting your search terms" 
                  : "Your recent activities will appear here"}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6366F1"]}
              tintColor="#6366F1"
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
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    marginTop: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  filterSection: {
    marginBottom: 8,
  },
  filterList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#6366F1',
  },
  filterButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  activitiesList: {
    padding: 20,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: '500',
  },
  activityDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 8,
  },
  amountContainer: {
    marginTop: 4,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 4,
  },
  chevronContainer: {
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AllActivitiesScreen; 