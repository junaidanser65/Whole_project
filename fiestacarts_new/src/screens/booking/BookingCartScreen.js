import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, SafeAreaView, StatusBar, Platform, Animated, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBooking } from '../../contexts/BookingContext';
import { getUserBookings, cancelBooking } from '../../api/apiService';
import { useFocusEffect } from '@react-navigation/native';

export default function BookingCartScreen({ route, navigation }) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { removeBooking, clearBookings } = useBooking();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

  // Refresh bookings when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('BookingCartScreen focused, refreshing bookings');
      fetchBookings();
      
      // Animate entrance
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, [])
  );

  // Also refresh when route.params.refresh changes
  useEffect(() => {
    console.log('BookingCartScreen mounted/refreshed');
    fetchBookings();
  }, [route.params?.refresh]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching bookings...');
      const response = await getUserBookings();
      console.log('Fetched bookings response:', response);

      if (!response.success) {
        throw new Error('Failed to fetch bookings');
      }

      // Filter out completed and cancelled bookings, only show confirmed and pending
      const activeBookings = response.bookings.filter(booking => {
        console.log('Checking booking status:', {
          id: booking.id,
          status: booking.status
        });
        return booking.status === 'confirmed' || booking.status === 'pending';
      });

      console.log('Active bookings:', activeBookings);
      setBookings(activeBookings);
      setError(null);
    } catch (error) {
      console.error('Error fetching bookings:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Failed to load bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBooking = async (bookingId) => {
    try {
      console.log('Removing booking:', bookingId);
      
      // Show confirmation dialog
      Alert.alert(
        'Cancel Booking',
        'Are you sure you want to cancel this booking? This action cannot be undone.',
        [
          {
            text: 'No, Keep it',
            style: 'cancel',
          },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              try {
                // Call API to cancel booking
                await cancelBooking(bookingId);
                
                // Refresh bookings after cancellation
                fetchBookings();
                
                Alert.alert(
                  'Success',
                  'Booking has been cancelled successfully'
                );
              } catch (error) {
                console.error('Error cancelling booking:', error);
                Alert.alert(
                  'Error',
                  'Failed to cancel booking. Please try again.'
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error removing booking:', error);
      Alert.alert('Error', 'Failed to remove booking. Please try again.');
    }
  };

  const handleClearCart = async () => {
    try {
      console.log('Clearing all bookings');
      
      // Show confirmation dialog
      Alert.alert(
        'Clear Cart',
        'Are you sure you want to cancel all bookings? This action cannot be undone.',
        [
          {
            text: 'No, Keep them',
            style: 'cancel',
          },
          {
            text: 'Yes, Clear All',
            style: 'destructive',
            onPress: async () => {
              try {
                // Cancel all bookings in parallel
                const cancelPromises = bookings.map(booking => cancelBooking(booking.id));
                await Promise.all(cancelPromises);
                
                // Refresh bookings after clearing
                fetchBookings();
                
                Alert.alert(
                  'Success',
                  'All bookings have been cancelled successfully'
                );
              } catch (error) {
                console.error('Error clearing bookings:', error);
                Alert.alert(
                  'Error',
                  'Failed to clear bookings. Please try again.'
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error clearing bookings:', error);
      Alert.alert('Error', 'Failed to clear bookings. Please try again.');
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (!isSelectionMode) {
      setSelectedBookings([]);
    }
  };

  const toggleBookingSelection = (bookingId) => {
    setSelectedBookings(prev => {
      if (prev.includes(bookingId)) {
        return prev.filter(id => id !== bookingId);
      } else {
        return [...prev, bookingId];
      }
    });
  };

  const handleSelectedBookingsCancel = async () => {
    try {
      Alert.alert(
        'Cancel Selected Bookings',
        `Are you sure you want to cancel ${selectedBookings.length} booking(s)? This action cannot be undone.`,
        [
          {
            text: 'No, Keep them',
            style: 'cancel',
          },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              try {
                // Cancel all selected bookings in parallel
                const cancelPromises = selectedBookings.map(bookingId => cancelBooking(bookingId));
                await Promise.all(cancelPromises);
                
                // Refresh bookings after cancellation
                fetchBookings();
                setSelectedBookings([]);
                setIsSelectionMode(false);
                
                Alert.alert(
                  'Success',
                  'Selected bookings have been cancelled successfully'
                );
              } catch (error) {
                console.error('Error cancelling selected bookings:', error);
                Alert.alert(
                  'Error',
                  'Failed to cancel some bookings. Please try again.'
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error handling selected bookings cancellation:', error);
      Alert.alert('Error', 'Failed to cancel bookings. Please try again.');
    }
  };

  const prepareBookingData = (bookings) => {
    return bookings.map(booking => ({
      id: booking.id,
      vendor: {
        id: booking.vendor_id,
        name: booking.vendor_name || '',
        business_name: booking.business_name || ''
      },
      selectedDate: booking.booking_date,
      time: booking.booking_time,
      guests: parseInt(booking.guests || 1),
      selectedServices: (booking.items || []).map(item => ({
        id: item.id,
        name: item.menu_name || '',
        price: parseFloat(item.price_at_time || 0),
        quantity: parseInt(item.quantity || 1)
      })),
      totalPrice: parseFloat(booking.total_amount || 0),
      notes: booking.special_instructions || '',
      status: booking.status || 'confirmed'
    }));
  };

  const handleSelectedBookingsCheckout = () => {
    const selectedBookingsList = bookings.filter(booking => selectedBookings.includes(booking.id));
    
    // Check if any selected bookings are not confirmed
    const hasNonConfirmedBookings = selectedBookingsList.some(booking => booking.status !== 'confirmed');
    if (hasNonConfirmedBookings) {
      Alert.alert(
        'Invalid Selection',
        'Only confirmed bookings can be checked out. Please unselect pending bookings.'
      );
      return;
    }

    if (selectedBookingsList.length === 0) {
      Alert.alert('No Bookings Selected', 'Please select at least one booking to checkout.');
      return;
    }

    // Calculate total amount for selected bookings
    const selectedTotalAmount = selectedBookingsList.reduce((total, booking) => {
      return total + parseFloat(booking.total_amount || 0);
    }, 0);

    // Prepare booking data for payment
    const preparedBookings = prepareBookingData(selectedBookingsList);

    // Navigate to Payment screen with prepared bookings
    navigation.navigate('Payment', {
      bookings: preparedBookings,
      amount: selectedTotalAmount
    });
  };

  const handleCheckout = () => {
    // Get all confirmed bookings
    const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
    
    if (confirmedBookings.length === 0) {
      Alert.alert('No Confirmed Bookings', 'You need at least one confirmed booking to proceed with checkout.');
      return;
    }

    // Calculate total amount for confirmed bookings
    const confirmedTotalAmount = confirmedBookings.reduce((total, booking) => {
      return total + parseFloat(booking.total_amount || 0);
    }, 0);

    // Prepare booking data for payment
    const preparedBookings = prepareBookingData(confirmedBookings);

    // Navigate to Payment screen with prepared bookings
    navigation.navigate('Payment', {
      bookings: preparedBookings,
      amount: confirmedTotalAmount
    });
  };

  const hasOnlyConfirmedBookings = () => {
    const selectedBookingsData = bookings.filter(
      booking => selectedBookings.includes(booking.id)
    );
    return selectedBookingsData.length > 0 && 
           selectedBookingsData.every(booking => booking.status === 'confirmed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'confirmed':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      case 'completed':
        return '#6366F1';
      default:
        return '#64748B';
    }
  };

  const getStatusBackground = (status) => {
    switch (status) {
      case 'pending':
        return 'rgba(245, 158, 11, 0.1)';
      case 'confirmed':
        return 'rgba(16, 185, 129, 0.1)';
      case 'cancelled':
        return 'rgba(239, 68, 68, 0.1)';
      case 'completed':
        return 'rgba(99, 102, 241, 0.1)';
      default:
        return 'rgba(100, 116, 139, 0.1)';
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5); // Extract HH:MM from HH:MM:SS
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '$0';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '$0';
    return `$${numAmount.toLocaleString()}`;
  };

  const calculateServicePrice = (item) => {
    if (!item) return 0;
    const price = parseFloat(item.price_at_time);
    const quantity = parseInt(item.quantity);
    if (isNaN(price) || isNaN(quantity)) return 0;
    return price * quantity;
  };

  const getGuestCount = (guests) => {
    const count = parseInt(guests);
    return isNaN(count) ? 1 : count;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
        
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
              <Text style={styles.headerTitle}>My Bookings</Text>
              <Text style={styles.headerSubtitle}>Manage your reservations</Text>
            </View>
            
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
        
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
              <Text style={styles.headerTitle}>My Bookings</Text>
              <Text style={styles.headerSubtitle}>Manage your reservations</Text>
            </View>
            
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchBookings}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#A5B4FC", "#8B5CF6", "#7C3AED"]}
              style={styles.retryButtonGradient}
            >
              <Ionicons name="refresh" size={16} color="#FFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />

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
            <Text style={styles.headerTitle}>My Bookings</Text>
            <Text style={styles.headerSubtitle}>
              {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={toggleSelectionMode}
          >
            <Ionicons
              name={isSelectionMode ? "close" : "checkmark-circle-outline"}
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.container}>
        {bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptySubtitle}>
              Start booking vendors to see your reservations here
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              // onPress={() => navigation.navigate("MainDashboard")}
              onPress={() =>
                navigation.navigate("VendorSearch", { featured: true })
              }
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#A5B4FC", "#8B5CF6", "#7C3AED"]}
                style={styles.browseButtonGradient}
              >
                <Ionicons name="search" size={20} color="#FFF" />
                <Text style={styles.browseButtonText}>Browse Vendors</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={["#6366F1"]}
                  tintColor="#6366F1"
                />
              }
            >
              {bookings.map((booking, index) => {
                console.log("Rendering booking:", booking);
                if (!booking || !booking.vendor_name) {
                  console.log("Invalid booking data:", booking);
                  return null;
                }

                return (
                  <Animated.View
                    key={booking.id}
                    style={[
                      styles.bookingCard,
                      {
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateY: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [50 * (index + 1), 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {isSelectionMode && (
                      <TouchableOpacity
                        style={[
                          styles.checkbox,
                          selectedBookings.includes(booking.id) &&
                            styles.checkboxSelected,
                        ]}
                        onPress={() => toggleBookingSelection(booking.id)}
                      >
                        {selectedBookings.includes(booking.id) && (
                          <Ionicons name="checkmark" size={16} color="#FFF" />
                        )}
                      </TouchableOpacity>
                    )}

                    {/* Vendor Info */}
                    <View style={styles.bookingHeader}>
                      <View style={styles.vendorInfo}>
                        <Text style={styles.vendorName}>
                          {booking.vendor_name}
                        </Text>
                        <Text style={styles.vendorCategory}>
                          {booking.business_name}
                        </Text>
                      </View>
                      {!isSelectionMode && (
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleRemoveBooking(booking.id)}
                        >
                          <Ionicons
                            name="close-circle"
                            size={24}
                            color="#EF4444"
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Status Badge */}
                    <View style={styles.statusContainer}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: getStatusBackground(
                              booking.status
                            ),
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(booking.status) },
                          ]}
                        >
                          {booking.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {/* Booking Details */}
                    <View style={styles.detailsContainer}>
                      <View style={styles.detailRow}>
                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color="#64748B"
                        />
                        <Text style={styles.detailText}>
                          {formatDate(booking.booking_date)}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons
                          name="time-outline"
                          size={18}
                          color="#64748B"
                        />
                        <Text style={styles.detailText}>
                          {formatTime(booking.booking_time)}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons
                          name="people-outline"
                          size={18}
                          color="#64748B"
                        />
                        <Text style={styles.detailText}>
                          {getGuestCount(booking.guests)} guests
                        </Text>
                      </View>
                    </View>

                    {/* Services */}
                    <View style={styles.servicesContainer}>
                      <Text style={styles.sectionTitle}>Selected Services</Text>
                      {booking.items?.map((item, index) => (
                        <View key={index} style={styles.serviceItem}>
                          <Text style={styles.serviceName}>
                            {item.menu_name}
                          </Text>
                          <Text style={styles.servicePrice}>
                            {formatCurrency(calculateServicePrice(item))}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Total */}
                    <View style={styles.totalContainer}>
                      <Text style={styles.totalLabel}>Total Amount</Text>
                      <Text style={styles.totalAmount}>
                        {formatCurrency(booking.total_amount)}
                      </Text>
                    </View>

                    {/* Notes if any */}
                    {booking.special_instructions && (
                      <View style={styles.notesContainer}>
                        <Text style={styles.notesLabel}>Special Requests:</Text>
                        <Text style={styles.notesText}>
                          {booking.special_instructions}
                        </Text>
                      </View>
                    )}
                  </Animated.View>
                );
              })}
            </ScrollView>

            <View style={styles.footer}>
              {isSelectionMode ? (
                <>
                  <TouchableOpacity
                    style={[
                      styles.clearButton,
                      selectedBookings.length === 0 && styles.disabledButton,
                    ]}
                    onPress={handleSelectedBookingsCancel}
                    disabled={selectedBookings.length === 0}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                    <Text style={styles.clearButtonText}>Cancel Selected</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.checkoutButton,
                      !hasOnlyConfirmedBookings() && styles.disabledButton,
                    ]}
                    onPress={handleSelectedBookingsCheckout}
                    disabled={!hasOnlyConfirmedBookings()}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        hasOnlyConfirmedBookings()
                          ? ["#6366F1", "#8B5CF6"]
                          : ["#94A3B8", "#94A3B8"]
                      }
                      style={styles.checkoutButtonGradient}
                    >
                      <Ionicons name="card-outline" size={20} color="#FFF" />
                      <Text style={styles.checkoutButtonText}>
                        Checkout ({selectedBookings.length})
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClearCart}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    <Text style={styles.clearButtonText}>Clear All</Text>
                  </TouchableOpacity>
                  {bookings.some(
                    (booking) => booking.status === "confirmed"
                  ) ? (
                    <TouchableOpacity
                      style={styles.checkoutButton}
                      onPress={handleCheckout}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={["#6366F1", "#8B5CF6"]}
                        style={styles.checkoutButtonGradient}
                      >
                        <Ionicons name="card-outline" size={20} color="#FFF" />
                        <Text style={styles.checkoutButtonText}>
                          Checkout (
                          {
                            bookings.filter((b) => b.status === "confirmed")
                              .length
                          }
                          )
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.waitingMessage}>
                      <Ionicons name="time-outline" color="#F59E0B" size={24} />
                      <Text style={styles.waitingText}>
                        Waiting for vendor confirmation
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    marginTop: 30,
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
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  checkbox: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  checkboxSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  vendorCategory: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  statusContainer: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#0F172A',
    marginLeft: 8,
    fontWeight: '500',
  },
  servicesContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  serviceName: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    flex: 1,
  },
  servicePrice: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '700',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  notesContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: '#FFF',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  checkoutButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  waitingMessage: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginLeft: 12,
  },
  waitingText: {
    fontSize: 14,
    color: '#F59E0B',
    marginLeft: 8,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  browseButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  browseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 