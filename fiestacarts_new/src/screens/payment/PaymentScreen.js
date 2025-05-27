import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button, Card, Icon, Input } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useBooking } from '../../contexts/BookingContext';
import BackButton from '../../components/common/BackButton';
import { updateBookingStatus } from '../../api/apiService';

export default function PaymentScreen({ route, navigation }) {
  const { bookings, amount } = route.params; // Get bookings and amount from route params
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateBooking } = useBooking();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Handle both ISO string and HH:mm format
    const time = timeString.includes('T') ? new Date(timeString) : new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Process each booking
      const processedBookings = await Promise.all(bookings.map(async (booking) => {
        try {
          // Update booking status in the database
          const statusData = {
            status: 'completed'
          };

          await updateBookingStatus(booking.id, statusData);

          const updatedBooking = {
            ...booking,
            status: 'completed'
          };

          // Update booking in the context
          updateBooking(updatedBooking);
          return updatedBooking;
        } catch (error) {
          console.error(`Error updating booking ${booking.id}:`, error);
          throw new Error(`Failed to update booking ${booking.id}: ${error.message}`);
        }
      }));

      // Navigate to success screen
      navigation.navigate('PaymentSuccess', {
        amount: amount,
        bookings: processedBookings,
      });
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Error',
        'Failed to process payment. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButtonContainer} onPress={() => navigation.goBack()}>
        <View style={styles.backButtonCircle}>
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </View>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {bookings.map((booking) => (
            <Card key={booking.id} containerStyle={styles.bookingCard}>
              <Text style={styles.vendorName}>{booking.vendor?.name || 'Unknown Vendor'}</Text>
              <Text style={styles.businessName}>{booking.vendor?.business_name}</Text>
              <View style={styles.bookingDetails}>
                <Text style={styles.dateInfo}>
                  {formatDate(booking.selectedDate)} at {formatTime(booking.time)}
                </Text>
                <Text style={styles.guestInfo}>
                  {booking.guests} guests
                </Text>
              </View>
              {booking.selectedServices?.map(service => (
                <View key={service.id} style={styles.serviceItem}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.servicePrice}>
                    ${(service.price * service.quantity).toLocaleString()}
                  </Text>
                </View>
              ))}
              <View style={styles.bookingTotal}>
                <Text style={styles.bookingTotalLabel}>Booking Total</Text>
                <Text style={styles.bookingTotalAmount}>
                  ${booking.totalPrice?.toLocaleString()}
                </Text>
              </View>
            </Card>
          ))}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>${amount.toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={[styles.methodCard, selectedMethod === 'card' && styles.selectedMethod]}
            onPress={() => setSelectedMethod('card')}
          >
            <Icon name="credit-card" color={colors.primary} size={24} />
            <Text style={styles.methodName}>Credit/Debit Card</Text>
            {selectedMethod === 'card' && (
              <Icon name="check-circle" color={colors.primary} size={24} />
            )}
          </TouchableOpacity>
        </View>

        {/* Card Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Details</Text>
          <Input
            placeholder="Card Number"
            leftIcon={<Icon name="credit-card" color={colors.textLight} size={20} />}
            keyboardType="number-pad"
          />
          <View style={styles.cardRow}>
            <Input
              containerStyle={styles.expiryInput}
              placeholder="MM/YY"
              keyboardType="number-pad"
            />
            <Input
              containerStyle={styles.cvvInput}
              placeholder="CVV"
              keyboardType="number-pad"
              secureTextEntry
            />
          </View>
          <Input
            placeholder="Cardholder Name"
            leftIcon={<Icon name="person" color={colors.textLight} size={20} />}
          />
        </View>

        <Button
          title={isProcessing ? "Processing..." : "Pay Now"}
          onPress={handlePayment}
          buttonStyle={styles.payButton}
          containerStyle={styles.payButtonContainer}
          disabled={isProcessing}
          loading={isProcessing}
        />
      </ScrollView>
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
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
    color: colors.text,
  },
  bookingCard: {
    borderRadius: 8,
    marginBottom: spacing.md,
    padding: spacing.md,
    elevation: 2,
  },
  vendorName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  businessName: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  bookingDetails: {
    marginBottom: spacing.sm,
  },
  dateInfo: {
    ...typography.body,
    color: colors.textLight,
  },
  guestInfo: {
    ...typography.body,
    color: colors.textLight,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  serviceName: {
    ...typography.body,
    flex: 1,
  },
  servicePrice: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
  bookingTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bookingTotalLabel: {
    ...typography.body,
    fontWeight: 'bold',
  },
  bookingTotalAmount: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...typography.h3,
  },
  totalAmount: {
    ...typography.h2,
    color: colors.primary,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedMethod: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  methodName: {
    ...typography.body,
    marginLeft: spacing.md,
    flex: 1,
  },
  cardRow: {
    flexDirection: 'row',
  },
  expiryInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  cvvInput: {
    flex: 1,
  },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  payButtonContainer: {
    marginVertical: spacing.xl,
    marginHorizontal: spacing.md,
  },
}); 