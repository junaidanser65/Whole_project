import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Button, Card, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useBooking } from '../../contexts/BookingContext';
import BackButton from '../../components/common/BackButton';

export default function PaymentSuccessScreen({ route, navigation }) {
  const { amount, bookings } = route.params;
  const { updateBooking } = useBooking();

  useEffect(() => {
    // Update the status of each booking to 'paid'
    bookings.forEach(booking => {
      const paidBooking = {
        ...booking,
        status: 'paid',
        paymentDate: new Date().toISOString()
      };
      updateBooking(paidBooking);
    });
  }, []);

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

  const handleViewBookings = () => {
    // First reset to MainApp with Profile tab active
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainApp',
          state: {
            index: 2, // Profile tab
            routes: [
              { name: 'Dashboard' },
              { name: 'Bookings' },
              { name: 'Profile' }
            ]
          }
        }
      ]
    });

    // Then navigate to BookingHistory after a short delay
    setTimeout(() => {
      navigation.navigate('BookingHistory', { 
        initialTab: 'upcoming',
        fromPayment: true
      });
    }, 300);
  };

  const handleBackToHome = () => {
    // First reset the navigation stack
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.successIconContainer}>
          <Icon
            name="check-circle"
            color={colors.success}
            size={100}
            style={styles.icon}
          />
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.subtitle}>
            Total Amount Paid: ${amount.toLocaleString()}
          </Text>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          {bookings.map((booking) => (
            <Card key={booking.id} containerStyle={styles.bookingCard}>
              <Text style={styles.vendorName}>{booking.vendor.name}</Text>
              <View style={styles.detailsContainer}>
                <Icon name="event" size={16} color={colors.textLight} />
                <Text style={styles.detailText}>
                  {formatDate(booking.selectedDate)}
                </Text>
              </View>
              <View style={styles.detailsContainer}>
                <Icon name="access-time" size={16} color={colors.textLight} />
                <Text style={styles.detailText}>
                  {formatTime(booking.time)}
                </Text>
              </View>
              <View style={styles.detailsContainer}>
                <Icon name="people" size={16} color={colors.textLight} />
                <Text style={styles.detailText}>
                  {booking.guests} guests
                </Text>
              </View>
              <View style={styles.servicesContainer}>
                {booking.selectedServices.map(service => (
                  <Text key={service.id} style={styles.serviceText}>
                    • {service.name}
                  </Text>
                ))}
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="View My Bookings"
            onPress={handleViewBookings}
            buttonStyle={styles.viewBookingsButton}
            containerStyle={styles.buttonWrapper}
          />
          <Button
            title="Back to Home"
            onPress={handleBackToHome}
            buttonStyle={styles.homeButton}
            containerStyle={styles.buttonWrapper}
            titleStyle={styles.homeButtonText}
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
  backButtonContainer: {
    position: 'absolute',
    top: spacing.xl + spacing.xs, // Add extra spacing for status bar
    left: 0,
    zIndex: 1, // Ensure button stays on top
  },
  content: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  successIconContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.h2,
    color: colors.success,
    textAlign: 'center',
  },
  summaryContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  bookingCard: {
    borderRadius: 12,
    marginBottom: spacing.md,
    padding: spacing.md,
    elevation: 2,
  },
  vendorName: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailText: {
    ...typography.body,
    color: colors.textLight,
    marginLeft: spacing.sm,
  },
  servicesContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  serviceText: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  buttonContainer: {
    width: '100%',
  },
  buttonWrapper: {
    marginBottom: spacing.md,
  },
  viewBookingsButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  homeButton: {
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  homeButtonText: {
    color: colors.primary,
  },
  icon: {
    marginBottom: spacing.md,
  },
}); 