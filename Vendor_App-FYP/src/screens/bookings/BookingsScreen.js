import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
  ScrollView,
  Text as RNText,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getVendorBookings, updateBookingStatus } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';

const BOOKING_FILTERS = [
  { id: 'all', label: 'All', icon: 'grid-outline' },
  { id: 'pending', label: 'Pending', icon: 'time-outline' },
  { id: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle-outline' },
  { id: 'completed', label: 'Completed', icon: 'checkmark-done-outline' },
  { id: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
];

const BookingsScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState(route.params?.initialTab || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const flatListRef = React.useRef(null);

  // All existing functions remain the same
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getVendorBookings(user.id);
      setBookings(response.bookings);

      // If a specific booking ID was provided, scroll to it
      if (route.params?.bookingId) {
        // Wait for the next render cycle to ensure bookings are set
        setTimeout(() => {
          const filteredBookings = response.bookings.filter((booking) => {
            const matchesFilter =
              selectedFilter === 'all' || booking.status === selectedFilter;
            const matchesSearch =
              booking.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              booking.special_instructions?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
          });

          const bookingIndex = filteredBookings.findIndex(
            booking => booking.id === route.params.bookingId
          );

          if (bookingIndex !== -1 && flatListRef.current) {
            flatListRef.current.scrollToIndex({
              index: bookingIndex,
              animated: true,
              viewPosition: 0
            });
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Update selected filter when route params change
  useEffect(() => {
    if (route.params?.initialTab) {
      setSelectedFilter(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      // Update local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );
      Alert.alert('Success', `Booking ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      Alert.alert('Error', 'Failed to update booking status. Please try again.');
    }
  };

  const confirmStatusUpdate = (bookingId, newStatus) => {
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${newStatus} this booking?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => handleStatusUpdate(bookingId, newStatus),
        },
      ]
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter =
      selectedFilter === 'all' || booking.status === selectedFilter;
    const matchesSearch =
      booking.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.special_instructions?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusStyles = (status) => {
    const styles = {
      pending: {
        badge: { backgroundColor: '#FEF3C7' },
        text: { color: '#D97706' },
        icon: 'time-outline'
      },
      confirmed: {
        badge: { backgroundColor: '#DCFCE7' },
        text: { color: '#16A34A' },
        icon: 'checkmark-circle-outline'
      },
      completed: {
        badge: { backgroundColor: '#DBEAFE' },
        text: { color: '#2563EB' },
        icon: 'checkmark-done-outline'
      },
      cancelled: {
        badge: { backgroundColor: '#FEE2E2' },
        text: { color: '#DC2626' },
        icon: 'close-circle-outline'
      },
      in_discussion: {
        badge: { backgroundColor: '#E0F2FE' },
        text: { color: '#0891B2' },
        icon: 'chatbubble-outline'
      }
    };
    return styles[status] || styles.pending;
  };

  const BookingCard = ({ booking }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => {
        console.log('Navigating to BookingDetails with booking:', booking);
        navigation.navigate('BookingDetails', { 
          bookingId: booking.id,
          bookingData: booking 
        });
      }}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.customerSection}>
          <View style={styles.avatarContainer}>
            <RNText style={styles.avatarText}>
              {booking.user_name?.[0]?.toUpperCase() || '?'}
            </RNText>
          </View>
          <View style={styles.customerInfo}>
            <RNText style={styles.customerName}>{booking.user_name}</RNText>
            <RNText style={styles.orderNumber}>Order #{booking.id}</RNText>
          </View>
        </View>
        
        <View style={[styles.statusContainer, getStatusStyles(booking.status).badge]}>
          <Ionicons 
            name={getStatusStyles(booking.status).icon} 
            size={14} 
            color={getStatusStyles(booking.status).text.color} 
          />
          <RNText style={[styles.statusText, getStatusStyles(booking.status).text]}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </RNText>
        </View>
      </View>

      <View style={styles.bookingDetailsGrid}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar-outline" size={16} color="#6366F1" />
            </View>
            <View>
              <RNText style={styles.detailLabel}>Date</RNText>
              <RNText style={styles.detailValue}>{formatDate(booking.booking_date)}</RNText>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="time-outline" size={16} color="#6366F1" />
            </View>
            <View>
              <RNText style={styles.detailLabel}>Time</RNText>
              <RNText style={styles.detailValue}>{formatTime(booking.booking_time)}</RNText>
            </View>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="cash-outline" size={16} color="#6366F1" />
            </View>
            <View>
              <RNText style={styles.detailLabel}>Amount</RNText>
              <RNText style={styles.amountValue}>${booking.total_amount}</RNText>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="location-outline" size={16} color="#6366F1" />
            </View>
            <View style={styles.addressInfo}>
              <RNText style={styles.detailLabel}>Location</RNText>
              <RNText style={styles.addressValue} numberOfLines={1}>
                {booking.address || 'Not specified'}
              </RNText>
            </View>
          </View>
        </View>
      </View>

      {booking.status === 'pending' && (
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => confirmStatusUpdate(booking.id, 'confirmed')}
          >
            <Ionicons name="checkmark-outline" size={20} color="#FFFFFF" />
            <RNText style={styles.actionButtonText}>Accept</RNText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => confirmStatusUpdate(booking.id, 'cancelled')}
          >
            <Ionicons name="close-outline" size={20} color="#FFFFFF" />
            <RNText style={styles.actionButtonText}>Reject</RNText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.chatButtonInline}
            onPress={() => navigation.navigate('ChatDetails', { 
              conversationId: null,
              userId: booking.user_id,
              userName: booking.user_name,
              userImage: booking.user_image || null
            })}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#6366F1" />
          </TouchableOpacity>
        </View>
      )}

      {booking.status !== 'pending' && (
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => navigation.navigate('ChatDetails', { 
            conversationId: null,
            userId: booking.user_id,
            userName: booking.user_name,
            userImage: booking.user_image || null
          })}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#6366F1" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="clipboard-outline" size={60} color="#94A3B8" />
      </View>
      <RNText style={styles.emptyTitle}>No bookings found</RNText>
      <RNText style={styles.emptySubtitle}>
        {selectedFilter === 'all' 
          ? "You don't have any bookings yet" 
          : `No ${selectedFilter} bookings available`}
      </RNText>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <RNText style={styles.loadingText}>Loading bookings...</RNText>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Modern Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={["#6366F1", "#8B5CF6", "#A855F7"]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleSection}>
              <RNText style={styles.headerTitle}>Bookings</RNText>
              <RNText style={styles.headerSubtitle}>
                Manage your orders and reservations
              </RNText>
            </View>
            
            <View style={styles.headerStats}>
              <RNText style={styles.statsNumber}>{filteredBookings.length}</RNText>
              <RNText style={styles.statsLabel}>Total</RNText>
            </View>
          </View>

          {/* Modern Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search bookings..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Modern Filter Tabs */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {BOOKING_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                selectedFilter === filter.id && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Ionicons 
                name={filter.icon} 
                size={18} 
                color={selectedFilter === filter.id ? '#FFFFFF' : '#64748B'} 
              />
              <RNText
                style={[
                  styles.filterTabText,
                  selectedFilter === filter.id && styles.filterTabTextActive,
                ]}
              >
                {filter.label}
              </RNText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bookings List */}
      <FlatList
        ref={flatListRef}
        data={filteredBookings}
        renderItem={({ item }) => <BookingCard booking={item} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.bookingsList}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={EmptyListComponent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitleSection: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  headerStats: {
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statsLabel: {
    fontSize: 12,
    color: '#E0E7FF',
  },
  searchSection: {
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  clearButton: {
    padding: 5,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersContent: {
    padding: 10,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  filterTabActive: {
    backgroundColor: '#6366F1',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 8,
  },
  filterTabTextActive: {
    color: '#FFF',
  },
  bookingsList: {
    padding: 20,
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  customerInfo: {
    marginLeft: 10,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 14,
    color: '#636E72',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  bookingDetailsGrid: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  addressInfo: {
    alignItems: 'flex-start',
  },
  addressValue: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 2,
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: '#16A34A',
  },
  rejectButton: {
    backgroundColor: '#DC2626',
  },
  chatButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: '#FFF',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatButtonInline: {
    backgroundColor: '#F0F4FF',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#636E72',
    marginTop: 10,
  },
});

export default BookingsScreen; 