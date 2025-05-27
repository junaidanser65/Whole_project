import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
  ScrollView,
  Text as RNText,
} from 'react-native';
import { Text, SearchBar, Icon, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useBookings } from '../../contexts/BookingsContext';

const BOOKING_FILTERS = [
  { id: 'all', label: 'All Bookings' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
  { id: 'rejected', label: 'Rejected' },
];

const BookingsScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = new Animated.Value(0);
  const { bookings } = useBookings();

  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter =
      selectedFilter === 'all' || booking.status === selectedFilter;
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.eventType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
      onPress={() => navigation.navigate('BookingDetails', { bookingId: booking.id })}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.avatarContainer}>
            <RNText style={styles.avatarText}>{booking.customerName[0]}</RNText>
          </View>
          <View style={styles.bookingInfo}>
            <RNText style={styles.customerName}>{booking.customerName}</RNText>
            <RNText style={styles.eventType}>{booking.eventType}</RNText>
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
          <RNText style={styles.detailText}>{booking.date}</RNText>
        </View>
        <View style={styles.detailItem}>
          <Icon name="schedule" type="material" size={16} color="#636E72" />
          <RNText style={styles.detailText}>{booking.time}</RNText>
        </View>
        <View style={styles.detailItem}>
          <Icon name="people" type="material" size={16} color="#636E72" />
          <RNText style={styles.detailText}>{booking.guests} guests</RNText>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <RNText style={styles.amount}>{booking.amount}</RNText>
        {/* <Button
          title="View Details"
          type="clear"
          icon={
            <Icon
              name="chevron-right"
              type="material"
              size={20}
              color="#ff4500"
            />
          }
          iconRight
          titleStyle={styles.viewDetailsText}
        /> */}
      </View>
    </TouchableOpacity>
  );

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
        keyExtractor={item => item.id}
        contentContainerStyle={styles.bookingsList}
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
});

export default BookingsScreen; 