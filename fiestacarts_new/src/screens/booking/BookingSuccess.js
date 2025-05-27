import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Button, Card, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import BackButton from '../../components/common/BackButton';

export default function BookingSuccess({ route, navigation }) {
  const { booking } = route.params;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.successHeader}>
          <Icon name="check-circle" size={80} color={colors.success} />
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successMessage}>
            Your booking has been successfully created
          </Text>
        </View>

        <Card containerStyle={styles.bookingCard}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          
          <View style={styles.detailRow}>
            <Icon name="event" size={20} color={colors.textLight} />
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailText}>{formatDate(booking.selectedDate)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="access-time" size={20} color={colors.textLight} />
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailText}>{formatTime(booking.selectedTime)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="people" size={20} color={colors.textLight} />
            <Text style={styles.detailLabel}>Guests:</Text>
            <Text style={styles.detailText}>{booking.guests}</Text>
          </View>

          {booking.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Special Requests:</Text>
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          )}

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>
              ${booking.totalPrice.toLocaleString()}
            </Text>
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="View My Bookings"
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'MainApp',
                    state: {
                      routes: [{ name: 'Bookings' }]
                    }
                  }
                ],
              });
            }}
            buttonStyle={styles.primaryButton}
            titleStyle={styles.primaryButtonText}
          />
          <Button
            title="Back to Home"
            onPress={() => navigation.navigate('Dashboard')}
            buttonStyle={styles.secondaryButton}
            titleStyle={styles.secondaryButtonText}
            type="outline"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    ...typography.h1,
    color: colors.success,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  successMessage: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
  },
  bookingCard: {
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  detailLabel: {
    ...typography.subtitle,
    color: colors.text,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  detailText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  notesContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  notesLabel: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  notesText: {
    ...typography.body,
    color: colors.textLight,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
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
  buttonContainer: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.white,
  },
  secondaryButton: {
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
  },
}); 