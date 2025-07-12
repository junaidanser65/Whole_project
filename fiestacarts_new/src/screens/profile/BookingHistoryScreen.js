import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator, TextInput, Alert, SafeAreaView, StatusBar, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getUserBookings, submitReview, checkBookingReview } from '../../api/apiService';

// Helper function to get status badge styling
const getStatusBadgeStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return { backgroundColor: '#10B981', color: '#FFF' };
    case 'pending':
      return { backgroundColor: '#F59E0B', color: '#FFF' };
    case 'completed':
      return { backgroundColor: '#8B5CF6', color: '#FFF' };
    case 'cancelled':
      return { backgroundColor: '#EF4444', color: '#FFF' };
    default:
      return { backgroundColor: '#6B7280', color: '#FFF' };
  }
};

const StarRating = ({ rating, onRatingChange }) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRatingChange(star)}
          style={styles.starButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={28}
            color={star <= rating ? "#FFD700" : "#9CA3AF"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ReviewModal = React.memo(({ visible, onClose, onSubmit, isSubmitting }) => {
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(rating, comment);
  };

  const handleClose = () => {
    setRating(1);
    setComment('');
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Write a Review</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Rating</Text>
              <StarRating
                rating={rating}
                onRatingChange={setRating}
              />
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Your Review</Text>
              <TextInput
                style={styles.reviewInput}
                multiline
                numberOfLines={4}
                placeholder="Share your experience..."
                placeholderTextColor="#9CA3AF"
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting || rating === 0}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isSubmitting ? ["#9CA3AF", "#6B7280"] : ["#A5B4FC", "#8B5CF6", "#7C3AED"]}
                style={styles.submitButtonGradient}
              >
                {isSubmitting ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={styles.submitButtonText}>Submitting...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>Submit Review</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const BookingDetailsModal = ({ booking, visible, onClose }) => {
  if (!booking) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    try {
      if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
        const [hours, minutes] = timeString.split(':');
        const time = new Date();
        time.setHours(parseInt(hours, 10));
        time.setMinutes(parseInt(minutes, 10));
        return time.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      }
      const time = new Date(timeString);
      return time.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  const getGuestCount = () => {
    // Calculate total quantity from booking items
    console.log('Calculating guest count for booking:', booking.id);
    console.log('Booking items:', booking.items);
    
    if (booking.items && booking.items.length > 0) {
      const totalQuantity = booking.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      console.log('Total quantity calculated:', totalQuantity);
      return totalQuantity || 'Not specified';
    }
    console.log('No items found, returning Not specified');
    return 'Not specified';
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.detailsModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Booking Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>Vendor Information</Text>
              <View style={styles.detailsCard}>
                <View style={styles.detailsRow}>
                  <Ionicons name="storefront-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.detailsLabel}>Vendor Name</Text>
                  <Text style={styles.detailsValue}>{booking.vendor_name}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Ionicons name="business-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.detailsLabel}>Business Name</Text>
                  <Text style={styles.detailsValue}>{booking.business_name}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>Booking Information</Text>
              <View style={styles.detailsCard}>
                <View style={styles.detailsRow}>
                  <Ionicons name="calendar-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.detailsLabel}>Date</Text>
                  <Text style={styles.detailsValue}>{formatDate(booking.booking_date)}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Ionicons name="time-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.detailsLabel}>Time</Text>
                  <Text style={styles.detailsValue}>{formatTime(booking.booking_time)}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Ionicons name="people-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.detailsLabel}>Guests</Text>
                  <Text style={styles.detailsValue}>{getGuestCount()}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>Payment Information</Text>
              <View style={styles.detailsCard}>
                <View style={styles.detailsRow}>
                  <Ionicons name="card-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.detailsLabel}>Total Amount</Text>
                  <Text style={styles.detailsValueAmount}>${booking.total_amount?.toLocaleString() || '0'}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.detailsLabel}>Status</Text>
                  <View style={[styles.statusBadge, getStatusBadgeStyle(booking.status)]}>
                    <Text style={styles.statusText}>{booking.status?.toUpperCase() || 'UNKNOWN'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {booking.special_instructions && (
              <View style={styles.detailsSection}>
                <Text style={styles.detailsTitle}>Special Requests</Text>
                <View style={styles.detailsCard}>
                  <Text style={styles.specialRequestsText}>{booking.special_instructions}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function BookingHistoryScreen({ route, navigation }) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewedBookings, setReviewedBookings] = useState(new Set());

  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
    fetchBookings();
  }, [route.params?.initialTab, route.params?.refresh]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getUserBookings();
      
      if (!response.success) {
        throw new Error('Failed to fetch bookings');
      }

      console.log('Fetched bookings:', JSON.stringify(response.bookings, null, 2));
      setBookings(response.bookings || []);

      // Check review status for completed bookings
      const completedBookings = response.bookings.filter(booking => booking.status === 'completed');
      for (const booking of completedBookings) {
        try {
          const reviewResponse = await checkBookingReview(booking.id);
          if (reviewResponse.hasReview) {
            setReviewedBookings(prev => new Set([...prev, booking.id]));
          }
        } catch (error) {
          console.error('Error checking review status:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    try {
      if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
        const [hours, minutes] = timeString.split(':');
        const time = new Date();
        time.setHours(parseInt(hours, 10));
        time.setMinutes(parseInt(minutes, 10));
        return time.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      }
      const time = new Date(timeString);
      return time.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return bookings.filter(booking => {
      const bookingDate = new Date(booking.booking_date);
      bookingDate.setHours(0, 0, 0, 0);
      
      if (activeTab === 'upcoming') {
        return bookingDate >= now || booking.status === 'confirmed' || booking.status === 'pending';
      } else {
        return bookingDate < now || booking.status === 'completed' || booking.status === 'cancelled';
      }
    });
  };

  const handleViewDetails = (booking) => {
    console.log('View Details pressed for booking:', booking.id);
    setSelectedBooking(booking);
    setIsModalVisible(true);
  };

  const handleSubmitReview = async (rating, comment) => {
    console.log('Submit Review called with rating:', rating, 'comment:', comment);
    console.log('Selected booking:', selectedBooking);
    
    if (!selectedBooking) {
      console.error('No selected booking found');
      Alert.alert('Error', 'No booking selected');
      return;
    }

    setIsSubmittingReview(true);
    try {
      console.log('Submitting review for booking ID:', selectedBooking.id);
      const response = await submitReview(selectedBooking.id, { rating, comment });
      console.log('Review submission response:', response);
      
      if (response && response.success) {
        setReviewedBookings(prev => new Set([...prev, selectedBooking.id]));
        setIsReviewModalVisible(false);
        Alert.alert('Success', 'Review submitted successfully!');
      } else {
        console.error('Review submission failed:', response);
        Alert.alert('Error', response?.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleReviewPress = (booking) => {
    console.log('Review button pressed for booking:', booking.id);
    if (!reviewedBookings.has(booking.id)) {
      setSelectedBooking(booking);
      setIsReviewModalVisible(true);
    }
  };

  const renderBookingCard = (booking) => {
    // Calculate guest count from booking items
    const getGuestCount = () => {
      console.log('Card - Calculating guest count for booking:', booking.id);
      console.log('Card - Booking items:', booking.items);
      
      if (booking.items && booking.items.length > 0) {
        const totalQuantity = booking.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        console.log('Card - Total quantity calculated:', totalQuantity);
        return totalQuantity;
      }
      console.log('Card - No items found, returning 0');
      return 0;
    };

    const guestCount = getGuestCount();

    return (
      <View key={booking.id} style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorName}>{booking.vendor_name}</Text>
            <Text style={styles.businessName}>{booking.business_name}</Text>
          </View>
          <View style={[styles.statusBadge, getStatusBadgeStyle(booking.status)]}>
            <Text style={styles.statusText}>{booking.status?.toUpperCase() || 'UNKNOWN'}</Text>
          </View>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{formatDate(booking.booking_date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{formatTime(booking.booking_time)}</Text>
          </View>
          {guestCount > 0 && (
            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{guestCount} {guestCount === 1 ? 'guest' : 'guests'}</Text>
            </View>
          )}
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>${booking.total_amount?.toLocaleString() || '0'}</Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => handleViewDetails(booking)}
            activeOpacity={0.7}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>

          {booking.status === 'completed' && (
            <TouchableOpacity
              style={[
                styles.reviewButton,
                reviewedBookings.has(booking.id) && styles.reviewedButton
              ]}
              onPress={() => handleReviewPress(booking)}
              disabled={reviewedBookings.has(booking.id)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.reviewButtonText,
                reviewedBookings.has(booking.id) && styles.reviewedButtonText
              ]}>
                {reviewedBookings.has(booking.id) ? "Reviewed" : "Write Review"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
        <LinearGradient
          colors={["#6366F1", "#8B5CF6", "#A855F7"]}
          style={styles.header}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Booking History</Text>
              <View style={styles.headerRight} />
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
        <LinearGradient
          colors={["#6366F1", "#8B5CF6", "#A855F7"]}
          style={styles.header}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Booking History</Text>
              <View style={styles.headerRight} />
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchBookings}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      {/* Header */}
      <LinearGradient
        colors={["#6366F1", "#8B5CF6", "#A855F7"]}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Booking History</Text>
            
            <View style={styles.headerRight} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {getFilteredBookings().length > 0 ? (
          <View style={styles.bookingsContainer}>
            {getFilteredBookings().map(renderBookingCard)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons 
              name={activeTab === 'upcoming' ? 'calendar-outline' : 'time-outline'} 
              size={64} 
              color="#CBD5E1" 
            />
            <Text style={styles.emptyStateTitle}>No {activeTab} bookings</Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'upcoming' 
                ? 'You have no upcoming bookings' 
                : 'You have no past bookings'}
            </Text>
          </View>
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <BookingDetailsModal
        booking={selectedBooking}
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedBooking(null);
        }}
      />

      <ReviewModal
        visible={isReviewModalVisible}
        onClose={() => setIsReviewModalVisible(false)}
        onSubmit={handleSubmitReview}
        isSubmitting={isSubmittingReview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    marginTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },
  headerRight: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  bookingsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  vendorInfo: {
    flex: 1,
    marginRight: 12,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bookingDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  reviewButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
  },
  reviewedButton: {
    backgroundColor: '#E5E7EB',
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  reviewedButtonText: {
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomPadding: {
    height: 100,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  detailsModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
    backgroundColor: '#F9FAFB',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 8,
  },
  closeModalButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  // Details modal styles
  detailsSection: {
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  detailsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  detailsLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
    flex: 1,
    minWidth: 80,
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
    flex: 1.5,
    flexWrap: 'wrap',
  },
  detailsValueAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
    textAlign: 'right',
    flex: 1,
  },
  specialRequestsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
}); 