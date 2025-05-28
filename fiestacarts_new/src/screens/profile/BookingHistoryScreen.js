import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator, TextInput, Alert } from 'react-native';
import { Button, Card, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useBooking } from '../../contexts/BookingContext';
import BackButton from '../../components/common/BackButton';
import { getUserBookings, submitReview, checkBookingReview } from '../../api/apiService';

const StarRating = ({ rating, onRatingChange }) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRatingChange(star)}
          style={styles.starButton}
        >
          <Icon
            name={star <= rating ? "star" : "star-border"}
            size={30}
            color={star <= rating ? colors.primary : colors.textLight}
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
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
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
                value={comment}
                onChangeText={setComment}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title={isSubmitting ? "Submitting..." : "Submit Review"}
              onPress={handleSubmit}
              disabled={isSubmitting || rating === 0}
              buttonStyle={styles.submitReviewButton}
              titleStyle={styles.submitReviewButtonText}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
});

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
      console.log('Fetching bookings from database...');
      const response = await getUserBookings();
      
      if (!response.success) {
        throw new Error('Failed to fetch bookings');
      }

      console.log('Fetched bookings:', response.bookings);
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    try {
      // If timeString is in HH:mm:ss format, convert it to HH:mm
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

      // If it's a full datetime string, extract the time part
      const time = new Date(timeString);
      if (isNaN(time.getTime())) {
        console.error('Invalid time string:', timeString);
        return 'Invalid time';
      }
      
      return time.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    return bookings.filter(booking => {
      const bookingDate = new Date(booking.booking_date);
      bookingDate.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
      
      if (activeTab === 'upcoming') {
        // Show future bookings that are pending or confirmed
        return bookingDate >= now && 
          (booking.status === 'confirmed' || booking.status === 'pending');
      } else {
        // Show past bookings or completed/cancelled bookings
        return bookingDate < now || 
          booking.status === 'completed' || 
          booking.status === 'cancelled';
      }
    }).sort((a, b) => {
      const dateA = new Date(a.booking_date);
      const dateB = new Date(b.booking_date);
      return activeTab === 'upcoming' ? dateA - dateB : dateB - dateA;
    });
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'pending':
        return {
          container: styles.statusBadge,
          style: styles.pendingBadge,
          textStyle: styles.pendingText
        };
      case 'confirmed':
        return {
          container: styles.statusBadge,
          style: styles.confirmedBadge,
          textStyle: styles.confirmedText
        };
      case 'completed':
        return {
          container: styles.statusBadge,
          style: styles.completedBadge,
          textStyle: styles.completedText
        };
      case 'cancelled':
        return {
          container: styles.statusBadge,
          style: styles.cancelledBadge,
          textStyle: styles.cancelledText
        };
      default:
        return {
          container: styles.statusBadge,
          style: styles.defaultBadge,
          textStyle: styles.defaultText
        };
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalVisible(true);
  };

  const handleOpenReviewModal = (booking) => {
    setSelectedBooking(booking);
    setIsReviewModalVisible(true);
  };

  const handleSubmitReview = async (rating, comment) => {
    try {
      setIsSubmittingReview(true);
      const response = await submitReview(selectedBooking.id, {
        rating,
        comment
      });
      
      if (response && response.success) {
        setReviewedBookings(prev => new Set([...prev, selectedBooking.id]));
        Alert.alert(
          'Success',
          'Review submitted successfully',
          [{ text: 'OK', onPress: () => setIsReviewModalVisible(false) }]
        );
      } else {
        throw new Error(response?.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to submit review. Please try again.'
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const BookingDetailsModal = ({ booking, visible, onClose }) => {
    if (!booking) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Vendor Information */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Vendor</Text>
                <Text style={styles.detailValue}>{booking.vendor_name}</Text>
                <Text style={styles.detailSubtext}>{booking.business_name}</Text>
              </View>

              {/* Status */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={styles.statusContainer}>
                  <View style={[
                    getStatusBadgeStyle(booking.status).container,
                    getStatusBadgeStyle(booking.status).style,
                    styles.modalStatusBadge
                  ]}>
                    <Text style={getStatusBadgeStyle(booking.status).textStyle}>
                      {booking.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Date & Time */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {formatDate(booking.booking_date)}
                </Text>
                <Text style={styles.detailSubtext}>
                  {formatTime(booking.booking_time)}
                </Text>
              </View>

              {/* Items */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Items</Text>
                {booking.items?.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.menu_name}</Text>
                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                    <Text style={styles.itemPrice}>
                      ${(item.price_at_time * item.quantity).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Total */}
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Total Amount</Text>
                <Text style={styles.totalAmount}>
                  ${booking.total_amount.toLocaleString()}
                </Text>
              </View>

              {/* Special Instructions */}
              {booking.special_instructions && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Special Instructions</Text>
                  <Text style={styles.detailValue}>{booking.special_instructions}</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Close"
                onPress={onClose}
                buttonStyle={styles.closeModalButton}
                titleStyle={styles.closeModalButtonText}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderBookingCard = (booking) => (
    <Card key={booking.id} containerStyle={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.vendorInfo}>
          <Text style={styles.vendorName}>{booking.vendor_name}</Text>
          <Text style={styles.vendorCategory}>{booking.business_name}</Text>
        </View>
        <View style={[
          getStatusBadgeStyle(booking.status).container,
          getStatusBadgeStyle(booking.status).style
        ]}>
          <Text style={getStatusBadgeStyle(booking.status).textStyle}>
            {booking.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.dateTimeContainer}>
        <Icon name="event" size={16} color={colors.textLight} />
        <Text style={styles.dateTimeText}>
          {formatDate(booking.booking_date)}
        </Text>
      </View>

      <View style={styles.dateTimeContainer}>
        <Icon name="access-time" size={16} color={colors.textLight} />
        <Text style={styles.dateTimeText}>
          {formatTime(booking.booking_time)}
        </Text>
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalAmount}>
          ${booking.total_amount.toLocaleString()}
        </Text>
      </View>

      {booking.status === 'completed' && (
        <Button
          title={reviewedBookings.has(booking.id) ? "Already Reviewed" : "Write a Review"}
          buttonStyle={[
            styles.reviewButton,
            reviewedBookings.has(booking.id) && styles.reviewedButton
          ]}
          titleStyle={styles.reviewButtonText}
          onPress={() => {
            if (!reviewedBookings.has(booking.id)) {
              setSelectedBooking(booking);
              setIsReviewModalVisible(true);
            }
          }}
          disabled={reviewedBookings.has(booking.id)}
        />
      )}

      <Button
        title="View Details"
        type="outline"
        buttonStyle={styles.detailsButton}
        titleStyle={styles.detailsButtonText}
        onPress={() => handleViewDetails(booking)}
      />
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={64} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Try Again"
          onPress={fetchBookings}
          buttonStyle={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={styles.backButtonCircle}>
            <Icon name="arrow-back" size={24} color={colors.primary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking History</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'past' && styles.activeTab]}
            onPress={() => setActiveTab('past')}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
              Past
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {getFilteredBookings().length > 0 ? (
            getFilteredBookings().map(renderBookingCard)
          ) : (
            <View style={styles.emptyState}>
              <Icon 
                name={activeTab === 'upcoming' ? 'event-busy' : 'history'} 
                size={64} 
                color={colors.textLight} 
              />
              <Text style={styles.emptyStateText}>
                No {activeTab} bookings found
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xl + spacing.xs,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.md,
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
  headerTitle: {
    ...typography.h2,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  bookingCard: {
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    ...typography.h3,
    marginBottom: spacing.xs / 2,
  },
  vendorCategory: {
    ...typography.caption,
    color: colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    marginLeft: spacing.sm,
  },
  pendingBadge: {
    backgroundColor: colors.warning + '20',
  },
  pendingText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.warning,
  },
  confirmedBadge: {
    backgroundColor: colors.primary + '20',
  },
  confirmedText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.primary,
  },
  completedBadge: {
    backgroundColor: colors.success + '20',
  },
  completedText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.success,
  },
  cancelledBadge: {
    backgroundColor: colors.error + '20',
  },
  cancelledText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.error,
  },
  defaultBadge: {
    backgroundColor: colors.surface,
  },
  defaultText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dateTimeText: {
    ...typography.body,
    color: colors.textLight,
    marginLeft: spacing.sm,
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
  },
  totalAmount: {
    ...typography.h2,
    color: colors.primary,
  },
  detailsButton: {
    marginTop: spacing.md,
    borderColor: colors.primary,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl * 2,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.md,
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
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h2,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalBody: {
    padding: spacing.md,
  },
  detailSection: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.h3,
    color: colors.text,
  },
  detailSubtext: {
    ...typography.body,
    color: colors.textLight,
  },
  modalFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  closeModalButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
  },
  closeModalButtonText: {
    ...typography.button,
    color: colors.white,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  itemName: {
    ...typography.body,
    flex: 1,
  },
  itemQuantity: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
  itemPrice: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalStatusBadge: {
    alignSelf: 'flex-start',
    marginLeft: 0,
    marginTop: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginTop: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
  },
  reviewButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  reviewedButton: {
    backgroundColor: colors.textLight,
  },
  reviewButtonText: {
    ...typography.button,
    color: colors.white,
  },
  reviewSection: {
    marginBottom: spacing.md,
  },
  reviewLabel: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  starButton: {
    padding: spacing.xs,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    minHeight: 100,
    textAlignVertical: 'top',
    ...typography.body,
  },
  submitReviewButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
  },
  submitReviewButtonText: {
    ...typography.button,
    color: colors.white,
  },
}); 