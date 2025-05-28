import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
// import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';

const BookingDetails = ({ navigation, route }) => {
//   const route = useRoute();
//   const { booking } = route.params;
  console.log('Route params received:', route.params);
  const booking = route.params?.bookingData || route.params?.booking;
  console.log('Booking data extracted:', booking);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      confirmed: '#4CAF50',
      completed: '#2196F3',
      cancelled: '#F44336',
      rejected: '#F44336'
    };
    return colors[status] || '#FF9800';
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ff4500', '#cc3700']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.orderIdContainer}>
              <Text style={styles.orderId}>Order #{booking.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                  {booking.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Information</Text>
              <View style={styles.detailRow}>
                <Icon name="person" type="material" size={20} color="#636E72" />
                <Text style={styles.detailText}>{booking.user_name}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Booking Schedule</Text>
              <View style={styles.detailRow}>
                <Icon name="event" type="material" size={20} color="#636E72" />
                <Text style={styles.detailText}>{formatDate(booking.booking_date)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="schedule" type="material" size={20} color="#636E72" />
                <Text style={styles.detailText}>{formatTime(booking.booking_time)}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              <View style={styles.detailRow}>
                <Icon name="attach-money" type="material" size={20} color="#636E72" />
                <Text style={styles.detailText}>${booking.total_amount}</Text>
              </View>
            </View>

            {booking.special_instructions && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Special Instructions</Text>
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionsText}>{booking.special_instructions}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderIdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  orderId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#2D3436',
    marginLeft: 12,
  },
  instructionsContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: '#2D3436',
    lineHeight: 24,
  }
});

export default BookingDetails; 