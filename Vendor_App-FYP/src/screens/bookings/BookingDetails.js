import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Animated,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const BookingDetails = ({ navigation, route }) => {
  console.log('Route params received:', route.params);
  const booking = route.params?.bookingData || route.params?.booking;
  console.log('Booking data extracted:', booking);

  const [actionLoading, setActionLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
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
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        color: '#F59E0B', 
        bgColor: '#FEF3C7', 
        icon: 'time-outline',
        label: 'Pending Review'
      },
      confirmed: { 
        color: '#10B981', 
        bgColor: '#D1FAE5', 
        icon: 'checkmark-circle-outline',
        label: 'Confirmed'
      },
      completed: { 
        color: '#3B82F6', 
        bgColor: '#DBEAFE', 
        icon: 'checkmark-done-outline',
        label: 'Completed'
      },
      cancelled: { 
        color: '#EF4444', 
        bgColor: '#FEE2E2', 
        icon: 'close-circle-outline',
        label: 'Cancelled'
      },
      rejected: { 
        color: '#EF4444', 
        bgColor: '#FEE2E2', 
        icon: 'ban-outline',
        label: 'Rejected'
      }
    };
    return configs[status] || configs.pending;
  };

  const getPaymentStatus = (booking) => {
    // If payment_status is explicitly provided, use it
    if (booking?.payment_status) {
      return booking.payment_status;
    }
    
    // Derive payment status from booking status
    switch (booking?.status) {
      case 'completed':
        return 'Paid';
      case 'confirmed':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'cancelled':
      case 'rejected':
        return 'Refunded';
      default:
        return 'Pending';
    }
  };

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', `Booking ${action} successfully!`);
    } catch (error) {
      Alert.alert('Error', `Failed to ${action} booking. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const statusConfig = getStatusConfig(booking?.status);

  const InfoCard = ({ title, children, icon }) => (
    <View style={styles.infoCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <View style={styles.cardIconContainer}>
            <Ionicons name={icon} size={20} color="#6366F1" />
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        {children}
      </View>
    </View>
  );

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'refunded':
        return '#6366F1';
      case 'failed':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'refunded':
        return 'return-up-back';
      case 'failed':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const DetailRow = ({ icon, label, value, highlight = false, isPaymentStatus = false }) => (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={20} color="#64748B" />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <View style={styles.detailValueContainer}>
          <Text style={[
            styles.detailValue, 
            highlight && styles.highlightValue,
            isPaymentStatus && { color: getPaymentStatusColor(value) }
          ]}>
            {value}
          </Text>
          {isPaymentStatus && (
            <View style={styles.paymentStatusBadge}>
              <Ionicons 
                name={getPaymentStatusIcon(value)} 
                size={16} 
                color={getPaymentStatusColor(value)} 
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
            <Text style={styles.headerSubtitle}>Order #{booking?.id}</Text>
          </View>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Status Card */}
          <View style={styles.statusCard}>
            <LinearGradient
              colors={[statusConfig.bgColor, statusConfig.bgColor + '80']}
              style={styles.statusGradient}
            >
              <View style={styles.statusContent}>
                <View style={styles.statusIconContainer}>
                  <Ionicons 
                    name={statusConfig.icon} 
                    size={32} 
                    color={statusConfig.color} 
                  />
                </View>
                <View style={styles.statusInfo}>
                  <Text style={styles.statusLabel}>Current Status</Text>
                  <Text style={[styles.statusValue, { color: statusConfig.color }]}>
                    {statusConfig.label}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Customer Information */}
          <InfoCard title="Customer Information" icon="person-outline">
            <DetailRow 
              icon="person" 
              label="Customer Name" 
              value={booking?.user_name || 'N/A'} 
            />
          </InfoCard>

          {/* Booking Schedule */}
          <InfoCard title="Booking Schedule" icon="calendar-outline">
            <DetailRow 
              icon="calendar" 
              label="Event Date" 
              value={booking?.booking_date ? formatDate(booking.booking_date) : 'N/A'} 
            />
            <DetailRow 
              icon="time" 
              label="Event Time" 
              value={booking?.booking_time ? formatTime(booking.booking_time) : 'N/A'} 
            />
          </InfoCard>

          {/* Payment Details */}
          <InfoCard title="Payment Information" icon="wallet-outline">
            <DetailRow 
              icon="cash" 
              label="Total Amount" 
              value={booking?.total_amount ? `$${booking.total_amount}` : 'N/A'} 
              highlight={true}
            />
            <DetailRow 
              icon="card" 
              label="Payment Status" 
              value={getPaymentStatus(booking)} 
              isPaymentStatus={true}
            />
          </InfoCard>

          {/* Special Instructions */}
          {booking?.special_instructions && (
            <InfoCard title="Special Instructions" icon="document-text-outline">
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsText}>
                  {booking.special_instructions}
                </Text>
              </View>
            </InfoCard>
          )}

          {/* Action Buttons */}
          {booking?.status === 'pending' && (
            <View style={styles.actionSection}>
              <Text style={styles.actionTitle}>Actions</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleAction('reject')}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Ionicons name="close-outline" size={20} color="#EF4444" />
                  )}
                  <Text style={[styles.actionButtonText, styles.rejectButtonText]}>
                    Reject
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.confirmButton]}
                  onPress={() => handleAction('confirm')}
                  disabled={actionLoading}
                >
                  <LinearGradient
                    colors={["#10B981", "#059669"]}
                    style={styles.confirmGradient}
                  >
                    {actionLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Ionicons name="checkmark-outline" size={20} color="#FFF" />
                    )}
                    <Text style={styles.confirmButtonText}>
                      Confirm
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  statusCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statusGradient: {
    padding: 20,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailIcon: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailValue: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  highlightValue: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '700',
  },
  paymentStatusBadge: {
    marginLeft: 8,
  },
  instructionsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  instructionsText: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
    fontWeight: '500',
  },
  actionSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
  },
  rejectButton: {
    backgroundColor: '#FFF',
    borderColor: '#EF4444',
  },
  rejectButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  confirmButton: {
    borderWidth: 0,
    overflow: 'hidden',
  },
  confirmGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 24,
  },
});

export default BookingDetails; 