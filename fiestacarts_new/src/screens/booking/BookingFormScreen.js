import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Modal, Animated, SafeAreaView, StatusBar, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useBooking } from '../../contexts/BookingContext';
import { createBooking, updateVendorAvailability } from '../../api/apiService';

export default function BookingFormScreen({ route, navigation }) {
  const { vendor, selectedDate, selectedServices, availableSlots } = route.params;
  const { addBooking } = useBooking();
  const { showActionSheetWithOptions } = useActionSheet();
  
  // Set initial time to first available slot
  const getInitialTime = () => {
    if (availableSlots && availableSlots.length > 0) {
      const [hours, minutes] = availableSlots[0].split(':');
      const initialTime = new Date();
      initialTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return initialTime;
    }
    return new Date(); // Fallback to current time if no slots available
  };
  
  const [formData, setFormData] = useState({
    time: getInitialTime(),
    guests: 1,
    notes: '',
    address: '',
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const successScaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const animateModal = (anim, show) => {
    Animated.spring(anim, {
      toValue: show ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };

  // Calculate total price based on current guest count
  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => {
      return total + (service.price * formData.guests);
    }, 0);
  };

  const handleTimeSelect = () => {
    // Get available slots from route params
    const availableSlots = route.params.availableSlots || [];
    
    if (availableSlots.length === 0) {
      Alert.alert('No Available Slots', 'There are no available time slots for this date.');
      return;
    }

    // Format time slots for display (they should already be in HH:mm format from the database)
    const formattedTimeSlots = availableSlots.map(slot => {
      const [hours, minutes] = slot.split(':');
      const hour = parseInt(hours);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${period}`;
    });

    // Add cancel option
    const options = [...formattedTimeSlots, 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Select Time',
      },
      (selectedIndex) => {
        if (selectedIndex === cancelButtonIndex) return;

        // Get the original time slot from availableSlots
        const selectedTimeStr = availableSlots[selectedIndex];
        const [hours, minutes] = selectedTimeStr.split(':');
        const selectedTime = new Date();
        selectedTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        setFormData(prev => ({ ...prev, time: selectedTime }));
      }
    );
  };

  const handleGuestChange = (increment) => {
    setFormData(prev => ({
      ...prev,
      guests: Math.max(1, Math.min(100, prev.guests + increment)),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.time) {
      Alert.alert('Required', 'Please select a time slot');
      return;
    }

    if (!formData.address.trim()) {
      Alert.alert('Required', 'Please enter your delivery address');
      return;
    }

    const currentTotal = calculateTotal();
    setShowConfirmModal(true);
    animateModal(modalScaleAnim, true);
  };

  const handleConfirmBooking = async () => {
    try {
      setShowConfirmModal(false);
      animateModal(modalScaleAnim, false);

      // Format the time to HH:mm:ss format
      const timeString = formData.time.toTimeString().split(' ')[0];

      // Prepare booking data for API
      const bookingData = {
        vendor_id: vendor.id,
        booking_date: new Date(selectedDate).toISOString().split('T')[0],
        booking_time: timeString,
        menu_items: selectedServices.map(service => ({
          menu_id: service.id,
          quantity: formData.guests
        })),
        special_instructions: formData.notes,
        address: formData.address,
        total_amount: calculateTotal()
      };

      console.log('Submitting booking with data:', JSON.stringify(bookingData, null, 2));

      // Create booking using API
      const response = await createBooking(bookingData);
      console.log('Booking API response:', response);

      // Add booking to local context
      const newBooking = {
        id: response.booking.id,
        vendor,
        selectedDate: new Date(selectedDate).toISOString(),
        selectedServices,
        totalPrice: calculateTotal(),
        time: formData.time.toISOString(),
        guests: formData.guests,
        notes: formData.notes,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      addBooking(newBooking);
      setShowSuccessModal(true);
      animateModal(successScaleAnim, true);
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create booking. Please try again.'
      );
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleBackToHome = () => {
    // Reset navigation to MainApp with Dashboard tab active
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainApp',
          params: {
            screen: 'Dashboard'  // Explicitly set Dashboard as the active screen
          }
        }
      ]
    });
  };

  const ConfirmationModal = () => (
    <Modal
      transparent
      visible={showConfirmModal}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ scale: modalScaleAnim }]
            }
          ]}
        >
          <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          <Text style={styles.modalTitle}>Confirm Booking</Text>
          <Text style={styles.modalTotal}>
            Total: ${calculateTotal().toLocaleString()}
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={handleConfirmBooking}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                style={styles.modalConfirmButtonGradient}
              >
                <Ionicons name="checkmark" size={20} color="#FFF" />
                <Text style={styles.modalConfirmButtonText}>Confirm Booking</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowConfirmModal(false);
                animateModal(modalScaleAnim, false);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color="#EF4444" />
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  const SuccessModal = () => (
    <Modal
      transparent
      visible={showSuccessModal}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.successModalContent,
            {
              transform: [{ scale: successScaleAnim }]
            }
          ]}
        >
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successMessage}>
            Your booking has been successfully created. You can view your bookings in the cart.
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.viewCartButton}
              onPress={() => {
                setShowSuccessModal(false);
                animateModal(successScaleAnim, false);
                navigation.navigate('BookingCart', { refresh: true });
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                style={styles.viewCartButtonGradient}
              >
                <Ionicons name="cart" size={20} color="#FFF" />
                <Text style={styles.viewCartButtonText}>View Bookings</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleBackToHome}
              activeOpacity={0.8}
            >
              <Ionicons name="home" size={20} color="#6366F1" />
              <Text style={styles.continueButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

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
            <Text style={styles.headerTitle}>Book Service</Text>
            <Text style={styles.headerSubtitle}>{vendor?.name}</Text>
          </View>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.container,
          { opacity: fadeAnim }
        ]}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Event Date (Read-only) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Date</Text>
            <View style={styles.infoContainer}>
              <Ionicons name="calendar-outline" color="#6366F1" size={24} />
              <Text style={styles.infoText}>
                {formatDate(selectedDate)}
              </Text>
            </View>
          </View>

          {/* Time Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Time</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={handleTimeSelect}
              activeOpacity={0.8}
            >
              <Ionicons name="time-outline" color="#6366F1" size={24} />
              <Text style={styles.timeText}>
                {formData.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Ionicons name="chevron-down" color="#64748B" size={20} />
            </TouchableOpacity>
          </View>

          {/* Guest Count */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Number of Guests</Text>
            <View style={styles.guestCounter}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => handleGuestChange(-1)}
                activeOpacity={0.8}
              >
                <Ionicons name="remove" color="#6366F1" size={24} />
              </TouchableOpacity>
              <Text style={styles.guestCount}>{formData.guests}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => handleGuestChange(1)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" color="#6366F1" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected Services (Read-only) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Services</Text>
            {selectedServices.map((service, index) => (
              <View
                key={index}
                style={styles.serviceCard}
              >
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                </View>
                <Text style={styles.servicePrice}>
                  ${(service.price * formData.guests).toLocaleString()}
                </Text>
              </View>
            ))}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>
                ${calculateTotal().toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.inputContainer}>
              <TextInput
                multiline
                numberOfLines={3}
                placeholder="Enter your delivery address..."
                placeholderTextColor="#94A3B8"
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Special Requests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Requests</Text>
            <View style={styles.inputContainer}>
              <TextInput
                multiline
                numberOfLines={4}
                placeholder="Any special requirements or requests..."
                placeholderTextColor="#94A3B8"
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!formData.time || formData.guests < 1 || !formData.address.trim()) && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={!formData.time || formData.guests < 1 || !formData.address.trim()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                (!formData.time || formData.guests < 1 || !formData.address.trim())
                  ? ["#94A3B8", "#94A3B8"]
                  : ["#6366F1", "#8B5CF6"]
              }
              style={styles.submitButtonGradient}
            >
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
              <Text style={styles.submitButtonText}>Confirm Booking</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
        <ConfirmationModal />
        <SuccessModal />
      </Animated.View>
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
  headerRight: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  guestCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginHorizontal: 32,
  },
  serviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 16,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  servicePrice: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '700',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#6366F1',
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    color: '#0F172A',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 16,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  successModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 32,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalTotal: {
    fontSize: 20,
    color: '#6366F1',
    fontWeight: '700',
    marginBottom: 24,
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  modalCancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: '#FFF',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  modalConfirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalConfirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  viewCartButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  viewCartButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  viewCartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
    backgroundColor: '#FFF',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 8,
  },
}); 