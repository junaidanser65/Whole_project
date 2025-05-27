import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Animated } from 'react-native';
import { Button, Input, Card } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import TimeSlotPicker from '../../components/booking/TimeSlotPicker';
import { createBooking, getPublicVendorAvailability } from '../../api/apiService';

const BookingForm = ({ route, navigation }) => {
  const { vendor, selectedDate, availableSlots, selectedServices, totalPrice: basePrice } = route.params;
  const [selectedTime, setSelectedTime] = useState(null);
  const [guestCount, setGuestCount] = useState('1');
  const [specialRequests, setSpecialRequests] = useState('');
  const [totalPrice, setTotalPrice] = useState(basePrice);
  const [isLoading, setIsLoading] = useState(false);
  const { addBooking } = useBooking();
  const { user } = useAuth();

  // Update total price when guest count changes
  useEffect(() => {
    const guests = parseInt(guestCount) || 1;
    setTotalPrice(basePrice * guests);
  }, [guestCount, basePrice]);

  const checkAvailability = async (date, time) => {
    try {
      const availability = await getPublicVendorAvailability(vendor.id, date);
      const timeSlot = new Date(time).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      return availability.slots.includes(timeSlot);
    } catch (error) {
      console.error('Availability check error:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!selectedTime) {
      Alert.alert('Required', 'Please select a time slot');
      return;
    }

    if (!guestCount || isNaN(guestCount) || Number(guestCount) < 1) {
      Alert.alert('Invalid', 'Please enter a valid number of guests');
      return;
    }

    try {
      setIsLoading(true);
      
      // Check availability before proceeding
      const isAvailable = await checkAvailability(selectedDate, selectedTime);
      if (!isAvailable) {
        Alert.alert(
          'Time Slot Unavailable',
          'The selected time slot is no longer available. Please choose another time.'
        );
        return;
      }

      Alert.alert(
        'Confirm Booking',
        `Total amount to pay: $${totalPrice.toLocaleString()}`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Confirm',
            onPress: async () => {
              try {
                // Format dates for API
                const bookingDate = new Date(selectedDate);
                const bookingTime = new Date(selectedTime);
                
                // Format date as YYYY-MM-DD
                const formattedDate = bookingDate.toISOString().split('T')[0];
                
                // Format time as HH:mm:ss
                const formattedTime = bookingTime.toTimeString().split(' ')[0];

                // Prepare booking data
                const bookingData = {
                  vendor_id: vendor.id,
                  booking_date: formattedDate,
                  booking_time: formattedTime,
                  menu_items: selectedServices.map(service => ({
                    menu_id: service.id,
                    quantity: parseInt(guestCount)
                  })),
                  special_instructions: specialRequests,
                  total_amount: totalPrice
                };

                console.log('Submitting booking with data:', JSON.stringify(bookingData, null, 2));

                // Create booking using API
                const response = await createBooking(bookingData);
                console.log('Booking API response:', response);

                // Add booking to local context
                const newBooking = {
                  id: response.booking.id,
                  vendor,
                  selectedDate: bookingDate.toISOString(),
                  selectedTime: bookingTime.toISOString(),
                  selectedServices,
                  totalPrice,
                  guests: parseInt(guestCount),
                  notes: specialRequests,
                  status: 'pending',
                  createdAt: new Date().toISOString()
                };

                addBooking(newBooking);

                // Navigate to success screen
                navigation.navigate('BookingSuccess', {
                  booking: newBooking
                });
              } catch (error) {
                console.error('Booking error:', error);
                Alert.alert(
                  'Error',
                  error.response?.data?.message || 'Failed to create booking. Please try again.'
                );
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Availability check error:', error);
      Alert.alert(
        'Error',
        'Failed to check availability. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <Text style={styles.title}>Booking Details</Text>
        
        <View style={styles.dateContainer}>
          <Text style={styles.label}>Event Date</Text>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Select Time</Text>
          <TimeSlotPicker
            availableSlots={availableSlots}
            selectedSlot={selectedTime}
            onSelectSlot={setSelectedTime}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Number of Guests</Text>
          <Input
            placeholder="Enter number of guests"
            keyboardType="number-pad"
            value={guestCount}
            onChangeText={setGuestCount}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Special Requests</Text>
          <Input
            placeholder="Any special requests or notes"
            multiline
            numberOfLines={3}
            value={specialRequests}
            onChangeText={setSpecialRequests}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Selected Services</Text>
          {selectedServices.map(service => (
            <View key={service.id} style={styles.serviceItem}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription}>
                  ${service.price.toLocaleString()} × {guestCount} guests
                </Text>
              </View>
              <Text style={styles.servicePrice}>
                ${(service.price * parseInt(guestCount)).toLocaleString()}
              </Text>
            </View>
          ))}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${totalPrice.toLocaleString()}</Text>
          </View>
        </View>

        <Button
          title="Confirm Booking"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading || !selectedTime}
          buttonStyle={[
            styles.confirmButton,
            (!selectedTime || isLoading) && styles.disabledButton
          ]}
          titleStyle={styles.confirmButtonText}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    borderRadius: 12,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.md,
    padding: spacing.md,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.lg,
  },
  dateContainer: {
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  dateText: {
    ...typography.body,
    color: colors.primary,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  serviceDescription: {
    ...typography.caption,
    color: colors.textLight,
  },
  servicePrice: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: spacing.md,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...typography.h3,
    color: colors.text,
  },
  totalAmount: {
    ...typography.h2,
    color: colors.primary,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  confirmButtonText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: colors.primaryLight,
    opacity: 0.6,
  },
});

export default BookingForm; 