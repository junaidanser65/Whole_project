import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Animated, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

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
    <Animated.View 
      style={[
        styles.container,
        { opacity: fadeAnim }
      ]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Booking Details</Text>
          
          <View style={styles.dateContainer}>
            <Text style={styles.label}>Event Date</Text>
            <View style={styles.dateDisplay}>
              <Ionicons name="calendar-outline" size={20} color="#6366F1" />
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            </View>
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
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Enter number of guests"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                value={guestCount}
                onChangeText={setGuestCount}
                style={styles.textInput}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Special Requests</Text>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Any special requests or notes"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={specialRequests}
                onChangeText={setSpecialRequests}
                style={[styles.textInput, styles.multilineInput]}
              />
            </View>
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

          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!selectedTime || isLoading) && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={isLoading || !selectedTime}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                (!selectedTime || isLoading)
                  ? ["#94A3B8", "#94A3B8"]
                  : ["#6366F1", "#8B5CF6"]
              }
              style={styles.confirmButtonGradient}
            >
              {isLoading ? (
                <Ionicons name="hourglass-outline" size={20} color="#FFF" />
              ) : (
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              )}
              <Text style={styles.confirmButtonText}>
                {isLoading ? 'Processing...' : 'Confirm Booking'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 24,
    textAlign: 'center',
  },
  dateContainer: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
    marginLeft: 12,
  },
  inputContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    color: '#0F172A',
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  servicePrice: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '700',
    marginLeft: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366F1',
  },
  confirmButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default BookingForm; 