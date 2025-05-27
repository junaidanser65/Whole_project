import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Modal, Animated } from 'react-native';
import { Button, Input, Icon } from '@rneui/themed';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { colors, spacing, typography } from '../../styles/theme';
import { useBooking } from '../../contexts/BookingContext';
import { createBooking, updateVendorAvailability } from '../../api/apiService';
import BackButton from '../../components/common/BackButton';

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
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const successScaleAnim = useRef(new Animated.Value(0)).current;

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
      onRequestClose={() => {
        setShowConfirmModal(false);
        animateModal(modalScaleAnim, false);
      }}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  scale: modalScaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Icon name="event-available" size={50} color={colors.primary} />
          <Text style={styles.modalTitle}>Confirm Booking</Text>
          <Text style={styles.modalTotal}>
            Total Amount: ${calculateTotal().toLocaleString()}
          </Text>
          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              type="outline"
              buttonStyle={styles.modalCancelButton}
              titleStyle={styles.modalCancelButtonText}
              onPress={() => {
                setShowConfirmModal(false);
                animateModal(modalScaleAnim, false);
              }}
            />
            <Button
              title="Confirm"
              buttonStyle={styles.modalConfirmButton}
              titleStyle={styles.modalConfirmButtonText}
              onPress={handleConfirmBooking}
            />
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
      onRequestClose={() => {
        setShowSuccessModal(false);
        animateModal(successScaleAnim, false);
      }}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            styles.successModalContent,
            {
              transform: [
                {
                  scale: successScaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Icon name="check-circle" size={50} color={colors.success} />
          <Text style={styles.modalTitle}>Booking Confirmed!</Text>
          <Text style={styles.modalMessage}>
            Your booking has been successfully created
          </Text>
          <View style={styles.modalButtons}>
            <Button
              title="View My Bookings"
              onPress={() => {
                setShowSuccessModal(false);
                animateModal(successScaleAnim, false);
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'MainApp',
                      state: {
                        routes: [
                          { name: 'Dashboard' },
                          { 
                            name: 'Bookings',
                            params: { refresh: true }
                          },
                          { name: 'Profile' }
                        ],
                        index: 1
                      }
                    }
                  ]
                });
              }}
              buttonStyle={styles.modalConfirmButton}
              titleStyle={styles.modalConfirmButtonText}
            />
            <Button
              title="Back to Home"
              onPress={handleBackToHome}
              buttonStyle={styles.modalCancelButton}
              titleStyle={styles.modalCancelButtonText}
              type="outline"
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButtonContainer} 
        onPress={handleBackToHome}
      >
        <View style={styles.backButtonCircle}>
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </View>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Event Date (Read-only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Date</Text>
          <View style={styles.infoContainer}>
            <Icon name="event" color={colors.primary} size={24} />
            <Text style={styles.infoText}>
              {formatDate(selectedDate)}
            </Text>
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Time</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={handleTimeSelect}
          >
            <Icon name="access-time" color={colors.primary} size={24} />
            <Text style={styles.dateText}>
              {formData.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Guest Count */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Guests</Text>
          <View style={styles.guestCounter}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleGuestChange(-1)}
            >
              <Icon name="remove" color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.guestCount}>{formData.guests}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleGuestChange(1)}
            >
              <Icon name="add" color={colors.primary} />
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

        {/* Special Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requests</Text>
          <Input
            multiline
            numberOfLines={4}
            placeholder="Any special requirements or requests..."
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            containerStyle={styles.notesContainer}
            inputStyle={styles.notesInput}
          />
        </View>

        {/* Submit Button */}
        <Button
          title="Confirm Booking"
          onPress={handleSubmit}
          buttonStyle={[styles.submitButton, styles.confirmButton]}
          containerStyle={styles.submitButtonContainer}
          titleStyle={styles.confirmButtonText}
          disabled={!formData.time || formData.guests < 1}
        />
      </ScrollView>
      <ConfirmationModal />
      <SuccessModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButtonContainer: {
    position: 'absolute',
    top: spacing.xl + spacing.xs,
    left: spacing.md,
    zIndex: 1,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  content: {
    paddingTop: spacing.xl * 2,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    color: colors.text,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  infoText: {
    ...typography.body,
    marginLeft: spacing.md,
    color: colors.primary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dateText: {
    ...typography.body,
    marginLeft: spacing.md,
  },
  guestCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  guestCount: {
    ...typography.h2,
    marginHorizontal: spacing.xl,
  },
  serviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  serviceTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    ...typography.body,
    color: colors.textLight,
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
    marginTop: spacing.md,
    paddingTop: spacing.md,
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
  notesContainer: {
    paddingHorizontal: 0,
  },
  notesInput: {
    ...typography.body,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    margin: spacing.lg,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    elevation: 2,
  },
  confirmButtonText: {
    ...typography.button,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  submitButtonContainer: {
    marginBottom: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successModalContent: {
    padding: spacing.xl,
  },
  modalTitle: {
    ...typography.h2,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  modalTotal: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    width: '100%',
    gap: spacing.md,
  },
  modalCancelButton: {
    borderColor: colors.error,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  modalCancelButtonText: {
    color: colors.error,
  },
  modalConfirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  modalConfirmButtonText: {
    color: colors.white,
  },
  successIconContainer: {
    marginBottom: spacing.md,
  },
  successTitle: {
    ...typography.h2,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  successMessage: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  viewCartButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  viewCartButtonText: {
    color: colors.white,
  },
  continueButton: {
    borderColor: colors.primary,
    borderWidth: 1,
    paddingVertical: spacing.md,
  },
  continueButtonText: {
    color: colors.primary,
  },
}); 