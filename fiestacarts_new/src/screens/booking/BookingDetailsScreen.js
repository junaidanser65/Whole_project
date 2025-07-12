import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, SafeAreaView, StatusBar, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBooking } from '../../contexts/BookingContext';
import { cancelBooking } from '../../api/apiService';

export default function BookingDetailsScreen({ route, navigation }) {
  const { booking } = route.params;
  const { updateBooking } = useBooking();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'confirmed':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      case 'completed':
        return '#6366F1';
      default:
        return '#64748B';
    }
  };

  const getStatusBackground = (status) => {
    switch (status) {
      case 'pending':
        return 'rgba(245, 158, 11, 0.1)';
      case 'confirmed':
        return 'rgba(16, 185, 129, 0.1)';
      case 'cancelled':
        return 'rgba(239, 68, 68, 0.1)';
      case 'completed':
        return 'rgba(99, 102, 241, 0.1)';
      default:
        return 'rgba(100, 116, 139, 0.1)';
    }
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

  const formatTime = (time) => {
    if (!time) return '';
    const timeObj = new Date(time);
    return timeObj.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

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
            <Text style={styles.headerTitle}>Booking Details</Text>
            <Text style={styles.headerSubtitle}>#{booking.id}</Text>
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
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Booking Status */}
          <View style={styles.statusContainer}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Booking Status</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusBackground(booking.status) }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(booking.status) }
                ]}>
                  {booking.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Vendor Details */}
          <View style={styles.vendorCard}>
            <View style={styles.vendorImageContainer}>
              <View style={styles.vendorImagePlaceholder}>
                <Ionicons name="business" size={40} color="#6366F1" />
              </View>
            </View>
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>{booking.vendor?.name || 'Vendor Name'}</Text>
              <Text style={styles.vendorCategory}>{booking.vendor?.category || 'Service Category'}</Text>
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={handleContactVendor}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-outline" color="#6366F1" size={20} />
                <Text style={styles.contactButtonText}>Contact Vendor</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Booking Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Booking Details</Text>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar-outline" color="#6366F1" size={20} />
              </View>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailText}>
                {formatDate(booking.selectedDate || booking.date)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="time-outline" color="#6366F1" size={20} />
              </View>
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailText}>
                {formatTime(booking.selectedTime || booking.time)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="people-outline" color="#6366F1" size={20} />
              </View>
              <Text style={styles.detailLabel}>Guests:</Text>
              <Text style={styles.detailText}>{booking.guests}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>
                {booking.service?.name || booking.selectedServices?.[0]?.name || 'Service'}
              </Text>
              <Text style={styles.servicePrice}>
                ${booking.totalAmount || booking.totalPrice}
              </Text>
            </View>
            
            {booking.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Special Requests:</Text>
                <Text style={styles.notesText}>{booking.notes}</Text>
              </View>
            )}
          </View>

          {/* Payment Summary */}
          <View style={styles.paymentCard}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Service Cost</Text>
              <Text style={styles.paymentAmount}>
                ${booking.totalAmount || booking.totalPrice}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Taxes & Fees</Text>
              <Text style={styles.paymentAmount}>$0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalAmount}>
                ${booking.totalAmount || booking.totalPrice}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.modifyButton}
                onPress={handleModifyBooking}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#6366F1", "#8B5CF6"]}
                  style={styles.modifyButtonGradient}
                >
                  <Ionicons name="create-outline" size={20} color="#FFF" />
                  <Text style={styles.modifyButtonText}>Modify Booking</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelBooking}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle" size={20} color="#EF4444" />
                <Text style={styles.cancelButtonText}>Cancel Booking</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  vendorCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  vendorImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  vendorImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorInfo: {
    alignItems: 'center',
  },
  vendorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  vendorCategory: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  contactButtonText: {
    fontSize: 14,
    color: '#6366F1',
    marginLeft: 8,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginRight: 8,
    minWidth: 60,
  },
  detailText: {
    fontSize: 16,
    color: '#0F172A',
    flex: 1,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  notesContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  paymentCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  paymentAmount: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
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
  actionButtons: {
    gap: 12,
  },
  modifyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modifyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  modifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: '#FFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
}); 