import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Button, Card, Icon, CheckBox } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
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

  // Refresh bookings when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('BookingCartScreen focused, refreshing bookings');
      fetchBookings();
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

  // Empty cart view
  if (!isLoading && (!bookings || bookings.length === 0)) {
    return (
      <View style={styles.safeArea}>
        <StatusBar
          backgroundColor={colors.primary}
          barStyle="light-content"
        />
      <View style={styles.emptyContainer}>
        <Icon name="shopping-cart" size={64} color={colors.textLight} />
        <Text style={styles.emptyText}>Your booking cart is empty</Text>
        <Button
          title="Browse Vendors"
          onPress={() => navigation.navigate('Dashboard')}
          buttonStyle={styles.browseButton}
          containerStyle={styles.browseButtonContainer}
        />
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.safeArea}>
        <StatusBar
          backgroundColor={colors.primary}
          barStyle="light-content"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.safeArea}>
        <StatusBar
          backgroundColor={colors.primary}
          barStyle="light-content"
        />
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Try Again"
            onPress={fetchBookings}
            buttonStyle={styles.retryButton}
          />
        </View>
      </View>
    );
  }

  console.log('Rendering bookings:', bookings);

  const formatTime = (time) => {
    if (!time) return '';
    // The time comes in format "HH:MM:SS", we just want "HH:MM"
    return time.split(':').slice(0, 2).join(':');
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar
        backgroundColor={colors.primary}
        barStyle="light-content"
      />
    <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Bookings</Text>
          <Button
            icon={<Icon name={isSelectionMode ? "close" : "check-box"} color={colors.primary} size={24} />}
            type="clear"
            onPress={toggleSelectionMode}
            title={isSelectionMode ? "Done" : "Select"}
          />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {bookings.map((booking) => {
            console.log('Rendering booking:', booking);
            if (!booking || !booking.vendor_name) {
              console.log('Invalid booking data:', booking);
              return null;
            }
          
          return (
            <Card key={booking.id} containerStyle={styles.bookingCard}>
                {isSelectionMode && (
                  <CheckBox
                    checked={selectedBookings.includes(booking.id)}
                    onPress={() => toggleBookingSelection(booking.id)}
                    containerStyle={styles.checkboxContainer}
                  />
                )}
                
              {/* Vendor Info */}
              <View style={styles.bookingHeader}>
                <View style={styles.vendorInfo}>
                    <Text style={styles.vendorName}>{booking.vendor_name}</Text>
                    <Text style={styles.vendorCategory}>{booking.business_name}</Text>
                </View>
                  {!isSelectionMode && (
                <Button
                  icon={<Icon name="close" color={colors.error} size={20} />}
                  type="clear"
                  onPress={() => handleRemoveBooking(booking.id)}
                  containerStyle={styles.removeButton}
                />
                  )}
              </View>

              {/* Status Badge */}
              <View style={styles.statusContainer}>
                <Text style={[
                  styles.statusText,
                    booking.status === 'pending' && styles.pendingStatus,
                    booking.status === 'confirmed' && styles.confirmedStatus,
                    booking.status === 'cancelled' && styles.cancelledStatus,
                    booking.status === 'completed' && styles.completedStatus
                  ]}>
                    {booking.status.toUpperCase()}
                </Text>
              </View>

              {/* Booking Details */}
                <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Icon name="event" size={18} color={colors.textLight} />
                  <Text style={styles.detailText}>
                      {formatDate(booking.booking_date)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="access-time" size={18} color={colors.textLight} />
                  <Text style={styles.detailText}>
                      {formatTime(booking.booking_time)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="people" size={18} color={colors.textLight} />
                  <Text style={styles.detailText}>
                      {booking.guests || 1} guests
                  </Text>
                </View>
              </View>

              {/* Services */}
              <View style={styles.servicesContainer}>
                <Text style={styles.sectionTitle}>Selected Services</Text>
                  {booking.items?.map((item, index) => (
                    <View key={index} style={styles.serviceItem}>
                      <Text style={styles.serviceName}>{item.menu_name}</Text>
                    <Text style={styles.servicePrice}>
                        ${(item.price_at_time * item.quantity).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Total */}
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalAmount}>
                    ${parseFloat(booking.total_amount).toLocaleString()}
                </Text>
              </View>

              {/* Notes if any */}
                {booking.special_instructions && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Special Requests:</Text>
                    <Text style={styles.notesText}>{booking.special_instructions}</Text>
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>

        {bookings.length > 0 && (
        <View style={styles.footer}>
            {isSelectionMode ? (
              <>
                <Button
                  title="Cancel Selected"
                  onPress={handleSelectedBookingsCancel}
                  buttonStyle={styles.clearButton}
                  containerStyle={styles.clearButtonContainer}
                  titleStyle={styles.clearButtonText}
                  type="outline"
                  disabled={selectedBookings.length === 0}
                />
                <Button
                  title={`Checkout (${selectedBookings.length})`}
                  onPress={handleSelectedBookingsCheckout}
                  buttonStyle={[
                    styles.checkoutButton,
                    !hasOnlyConfirmedBookings() && styles.disabledButton
                  ]}
                  containerStyle={styles.checkoutButtonContainer}
                  icon={<Icon name="payment" color={colors.white} style={styles.checkoutIcon} />}
                  disabled={!hasOnlyConfirmedBookings()}
                />
              </>
            ) : (
              <>
          <Button
            title="Clear Cart"
            onPress={handleClearCart}
            buttonStyle={styles.clearButton}
            containerStyle={styles.clearButtonContainer}
            titleStyle={styles.clearButtonText}
            type="outline"
          />
                {bookings.some(booking => booking.status === 'confirmed') ? (
          <Button
                    title={`Checkout (${bookings.filter(b => b.status === 'confirmed').length})`}
                    onPress={handleCheckout}
            buttonStyle={styles.checkoutButton}
            containerStyle={styles.checkoutButtonContainer}
            icon={<Icon name="payment" color={colors.white} style={styles.checkoutIcon} />}
          />
                ) : (
                  <View style={styles.waitingMessage}>
                    <Icon name="hourglass-empty" color={colors.warning} size={24} />
                    <Text style={styles.waitingText}>Waiting for vendor confirmation</Text>
                  </View>
                )}
              </>
            )}
        </View>
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xl,
  },
  bookingCard: {
    borderRadius: 12,
    marginBottom: spacing.md,
    padding: spacing.md,
    elevation: 3,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    transform: [{ scale: 1 }],
    transition: 'all 0.3s ease',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  vendorCategory: {
    ...typography.caption,
    color: colors.textLight,
  },
  removeButton: {
    marginTop: -spacing.xs,
    marginRight: -spacing.xs,
  },
  detailsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  detailText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  servicesContainer: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  serviceName: {
    ...typography.body,
    flex: 1,
    color: colors.text,
  },
  servicePrice: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
  },
  totalLabel: {
    ...typography.h3,
    color: colors.text,
  },
  totalAmount: {
    ...typography.h2,
    color: colors.primary,
  },
  notesContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 6,
  },
  notesLabel: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  notesText: {
    ...typography.caption,
    color: colors.textLight,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clearButtonContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  clearButton: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  clearButtonText: {
    color: colors.error,
  },
  checkoutButtonContainer: {
    flex: 2,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    elevation: 2,
  },
  checkoutIcon: {
    marginRight: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.h2,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
  },
  browseButtonContainer: {
    width: '80%',
  },
  statusContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  statusText: {
    ...typography.button,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'flex-end',
  },
  pendingStatus: {
    backgroundColor: colors.warning + '20',
    color: colors.warning,
  },
  confirmedStatus: {
    backgroundColor: colors.success + '20',
    color: colors.success,
  },
  cancelledStatus: {
    backgroundColor: colors.error + '20',
    color: colors.error,
  },
  completedStatus: {
    backgroundColor: colors.primary + '20',
    color: colors.primary,
  },
  '@media (hover: hover)': {
    bookingCard: {
      '&:hover': {
        transform: [{ scale: 1.02 }],
        elevation: 4,
      },
    },
  },
  removingCard: {
    opacity: 0,
    transform: [{ scale: 0.9 }, { translateY: 20 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.xl,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  warningIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  modalButtonWidth: {
    flex: 1,
  },
  modalCancelButton: {
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  modalConfirmButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.sm,
  },
  modalCancelButtonText: {
    color: colors.text,
    ...typography.button,
  },
  modalConfirmButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    ...typography.button,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginTop: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
  },
  waitingMessage: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warning + '20',
    padding: spacing.sm,
    borderRadius: 8,
    marginLeft: spacing.sm,
  },
  waitingText: {
    ...typography.body,
    color: colors.warning,
    marginLeft: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  checkboxContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  disabledButton: {
    backgroundColor: colors.primaryLight,
    opacity: 0.6,
  },
}); 