import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, Icon, Button, Divider } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import BackButton from '../../components/common/BackButton';
import { useBooking } from '../../contexts/BookingContext';
import { cancelBooking } from '../../api/apiService';

export default function BookingDetailsScreen({ route, navigation }) {
  const { booking } = route.params;
  const { updateBooking } = useBooking();

  const handleModifyBooking = () => {
    navigation.navigate('BookingForm', {
      vendor: booking.vendor,
      booking,
      isModifying: true,
    });
  };

  const handleCancelBooking = async () => {
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
              await cancelBooking(booking.id);
              
              // Update local booking status
              updateBooking(booking.id, { status: 'cancelled' });
              
              Alert.alert(
                'Success',
                'Booking has been cancelled successfully',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack()
                  }
                ]
              );
            } catch (error) {
              console.error('Cancel booking error:', error);
              Alert.alert(
                'Error',
                'Failed to cancel booking. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const handleContactVendor = () => {
    // Navigate to chat screen with vendor
    navigation.navigate('Chat', {
      vendor: booking.vendor,
      booking: booking
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton/>
        <Text style={styles.headerTitle}>Booking Details</Text>
      </View>
      <ScrollView>
        {/* Booking Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Booking Status</Text>
            <View style={[
              styles.statusBadge,
              booking.status === 'upcoming' ? styles.upcomingBadge : styles.completedBadge
            ]}>
              <Text style={styles.statusText}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.bookingId}>Booking ID: #{booking.id}</Text>
        </View>

        {/* Vendor Details */}
        <Card containerStyle={styles.card}>
          <Card.Image source={{ uri: booking.vendor.image }} style={styles.vendorImage} />
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorName}>{booking.vendor.name}</Text>
            <Text style={styles.vendorCategory}>{booking.vendor.category}</Text>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleContactVendor}
            >
              <Icon name="chat" color={colors.primary} size={20} />
              <Text style={styles.contactButtonText}>Contact Vendor</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Booking Details */}
        <Card containerStyle={styles.card}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.detailRow}>
            <Icon name="event" color={colors.textLight} size={20} />
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailText}>
              {booking.date.toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="access-time" color={colors.textLight} size={20} />
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailText}>
              {booking.time.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="people" color={colors.textLight} size={20} />
            <Text style={styles.detailLabel}>Guests:</Text>
            <Text style={styles.detailText}>{booking.guests}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>{booking.service.name}</Text>
            <Text style={styles.servicePrice}>{booking.service.price}</Text>
          </View>
          {booking.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Special Requests:</Text>
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          )}
        </Card>

        {/* Payment Summary */}
        <Card containerStyle={styles.card}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Service Cost</Text>
            <Text style={styles.paymentAmount}>${booking.totalAmount}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Taxes & Fees</Text>
            <Text style={styles.paymentAmount}>$0</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.paymentRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalAmount}>${booking.totalAmount}</Text>
          </View>
        </Card>

        {/* Action Buttons */}
        {booking.status === 'upcoming' && (
          <View style={styles.actionButtons}>
            <Button
              title="Modify Booking"
              onPress={handleModifyBooking}
              buttonStyle={styles.modifyButton}
              containerStyle={styles.buttonContainer}
            />
            <Button
              title="Cancel Booking"
              onPress={handleCancelBooking}
              buttonStyle={styles.cancelButton}
              containerStyle={styles.buttonContainer}
              type="outline"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    flex: 1,
    textAlign: 'center',
    marginRight: 48,
  },
  statusContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusTitle: {
    ...typography.h2,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  upcomingBadge: {
    backgroundColor: colors.primary + '20',
  },
  completedBadge: {
    backgroundColor: colors.success + '20',
  },
  statusText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  bookingId: {
    ...typography.caption,
    color: colors.textLight,
  },
  card: {
    borderRadius: 8,
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.md,
  },
  vendorImage: {
    height: 150,
    borderRadius: 8,
  },
  vendorInfo: {
    marginTop: spacing.md,
  },
  vendorName: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  vendorCategory: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    ...typography.body,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
    width: 60,
  },
  detailText: {
    ...typography.body,
    flex: 1,
  },
  divider: {
    marginVertical: spacing.md,
  },
  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceTitle: {
    ...typography.h3,
  },
  servicePrice: {
    ...typography.h3,
    color: colors.primary,
  },
  notesContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  notesLabel: {
    ...typography.body,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  notesText: {
    ...typography.body,
    color: colors.textLight,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  paymentLabel: {
    ...typography.body,
  },
  paymentAmount: {
    ...typography.body,
  },
  totalLabel: {
    ...typography.h3,
  },
  totalAmount: {
    ...typography.h3,
    color: colors.primary,
  },
  actionButtons: {
    padding: spacing.md,
  },
  buttonContainer: {
    marginBottom: spacing.md,
  },
  modifyButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  cancelButton: {
    borderColor: colors.error,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
}); 