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
} from 'react-native';
import { Text, SearchBar, Icon, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getVendorBookings, updateBookingStatus } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';

const BOOKING_FILTERS = [
  { id: 'all', label: 'All Bookings' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
  { id: 'rejected', label: 'Rejected' },
];

const BookingsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = new Animated.Value(0);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getVendorBookings(user.id);
      setBookings(response.bookings);
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
      month: 'long',
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
        badge: { backgroundColor: '#FFF3E0' },
        text: { color: '#FF9800' }
      },
      confirmed: {
        badge: { backgroundColor: '#E8F5E9' },
        text: { color: '#4CAF50' }
      },
      completed: {
        badge: { backgroundColor: '#E3F2FD' },
        text: { color: '#2196F3' }
      },
      rejected: {
        badge: { backgroundColor: '#FFEBEE' },
        text: { color: '#F44336' }
      },
      in_discussion: {
        badge: { backgroundColor: '#E0F7FA' },
        text: { color: '#00BCD4' }
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
          bookingData: booking 
        });
      }}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.avatarContainer}>
            <RNText style={styles.avatarText}>
              {booking.customer_name?.[0] || '?'}
            </RNText>
          </View>
          <View style={styles.bookingInfo}>
            <RNText style={styles.customerName}>{booking.user_name}</RNText>
            <RNText style={styles.eventType}>Order #{booking.id}</RNText>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          getStatusStyles(booking.status).badge
        ]}>
          <RNText style={[
            styles.statusText,
            getStatusStyles(booking.status).text
          ]}>
            {booking.status.toUpperCase()}
          </RNText>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailItem}>
          <Icon name="event" type="material" size={16} color="#636E72" />
          <RNText style={styles.detailText}>
            {formatDate(booking.booking_date)}
          </RNText>
        </View>
        <View style={styles.detailItem}>
          <Icon name="schedule" type="material" size={16} color="#636E72" />
          <RNText style={styles.detailText}>
            {formatTime(booking.booking_time)}
          </RNText>
        </View>
        <View style={styles.detailItem}>
          <Icon name="attach-money" type="material" size={16} color="#636E72" />
          <RNText style={styles.detailText}>
            ${booking.total_amount}
          </RNText>
        </View>
      </View>

      <View style={styles.addressContainer}>
        <Icon name="location-on" type="material" size={16} color="#636E72" />
        <RNText style={styles.addressText} numberOfLines={2}>
          {booking.address || 'No address provided'}
        </RNText>
      </View>

      {booking.status === 'pending' && (
        <View style={styles.actionButtons}>
          <Button
            title="Accept"
            type="solid"
            buttonStyle={[styles.actionButton, styles.acceptButton]}
            onPress={() => confirmStatusUpdate(booking.id, 'confirmed')}
          />
          <Button
            title="Reject"
            type="solid"
            buttonStyle={[styles.actionButton, styles.rejectButton]}
            onPress={() => confirmStatusUpdate(booking.id, 'cancelled')}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4500" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <LinearGradient
          colors={['#ff4500', '#cc3700']}
          style={styles.headerGradient}
        >
          <RNText style={styles.title}>Bookings</RNText>
          <SearchBar
            placeholder="Search bookings..."
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {BOOKING_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <RNText
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter.id && styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </RNText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredBookings}
        renderItem={({ item }) => <BookingCard booking={item} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.bookingsList}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="event-busy" size={50} color="#636E72" />
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    paddingHorizontal: 0,
  },
  searchInputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterList: {
    padding: 10,
  },
  filterButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FFF',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#ff4500',
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
  },
  filterButtonTextActive: {
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
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff4500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  bookingInfo: {
    marginLeft: 10,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 14,
    color: '#636E72',
  },
  statusBadge: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#ffe0cc',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff4500',
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#636E72',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4500',
  },
  viewDetailsText: {
    color: '#ff4500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#636E72',
    marginTop: 10,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#636E72',
    marginLeft: 8,
  },
});

export default BookingsScreen; 