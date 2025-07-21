import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  FlatList,
  ActivityIndicator,
  Text as RNText,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getVendorReviews } from '../../services/api';

const ReviewDetailsScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState([]);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    fetchReviews();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchReviews = async () => {
    try {
      if (!refreshing) setLoading(true);
      const response = await getVendorReviews();
      console.log('Reviews response:', response);
      
      if (response && response.success) {
        setReviews(response.reviews || []);
      } else {
        console.error('Reviews response indicates failure:', response);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setReviews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchReviews();
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Ionicons
            key={i}
            name="star"
            size={18}
            color="#F59E0B"
            style={styles.starIcon}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Ionicons
            key={i}
            name="star-half"
            size={18}
            color="#F59E0B"
            style={styles.starIcon}
          />
        );
      } else {
        stars.push(
          <Ionicons
            key={i}
            name="star-outline"
            size={18}
            color="#F59E0B"
            style={styles.starIcon}
          />
        );
      }
    }

    return (
      <View style={styles.starsContainer}>
        {stars}
        <RNText style={styles.ratingText}>{rating.toFixed(1)}</RNText>
      </View>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    return 'Just now';
  };

  const ReviewCard = ({ review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.cardHeader}>
        <View style={styles.customerSection}>
          <View style={styles.avatarContainer}>
            <RNText style={styles.avatarText}>
              {review.user_name?.[0] || '?'}
            </RNText>
          </View>
          <View style={styles.customerInfo}>
            <RNText style={styles.customerName}>{review.user_name}</RNText>
            <RNText style={styles.reviewDate}>{formatDate(review.created_at)}</RNText>
            <RNText style={styles.timeAgo}>{getTimeAgo(review.created_at)}</RNText>
          </View>
        </View>
        
        <View style={styles.ratingSection}>
          {renderStars(review.rating)}
        </View>
      </View>

      <RNText style={styles.reviewText}>{review.comment}</RNText>

      <View style={styles.bookingDetailsGrid}>
        <View style={styles.detailItem}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="calendar-outline" size={16} color="#6366F1" />
          </View>
          <View style={styles.detailContent}>
            <RNText style={styles.detailLabel}>Booking Date</RNText>
            <RNText style={styles.detailValue}>{formatDate(review.booking_date)}</RNText>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="cash-outline" size={16} color="#6366F1" />
          </View>
          <View style={styles.detailContent}>
            <RNText style={styles.detailLabel}>Amount</RNText>
            <RNText style={styles.amountValue}>${review.total_amount}</RNText>
          </View>
        </View>
      </View>

      {review.response && (
        <View style={styles.responseContainer}>
          <View style={styles.responseHeader}>
            <Ionicons name="chatbubble-outline" size={16} color="#6366F1" />
            <RNText style={styles.responseLabel}>Your Response</RNText>
          </View>
          <RNText style={styles.responseText}>{review.response}</RNText>
        </View>
      )}
    </View>
  );

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="star-outline" size={60} color="#94A3B8" />
      </View>
      <RNText style={styles.emptyTitle}>No reviews yet</RNText>
      <RNText style={styles.emptySubtitle}>
        Customer reviews will appear here once you start receiving them
      </RNText>
      <View style={styles.emptyActionContainer}>
        <RNText style={styles.emptyActionText}>
          Reviews are automatically added when customers rate your services after completing their bookings.
        </RNText>
      </View>
    </View>
  );

  if (loading && !refreshing && reviews.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <RNText style={styles.loadingText}>Loading reviews...</RNText>
          <RNText style={styles.loadingSubtext}>
            Please wait while we fetch your customer reviews
          </RNText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Modern Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={["#6366F1", "#8B5CF6", "#A855F7"]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleSection}>
              <RNText style={styles.headerTitle}>Customer Reviews</RNText>
              <RNText style={styles.headerSubtitle}>
                Detailed feedback from your customers
              </RNText>
            </View>
            
            <View style={styles.headerStats}>
              <RNText style={styles.statsNumber}>{reviews.length}</RNText>
              <RNText style={styles.statsLabel}>Reviews</RNText>
            </View>
          </View>

          {/* Average Rating Display */}
          {reviews.length > 0 && (
            <View style={styles.averageRatingContainer}>
              <View style={styles.ratingOverview}>
                <RNText style={styles.averageRatingNumber}>
                  {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
                </RNText>
                <RNText style={styles.averageRatingLabel}>Average Rating</RNText>
              </View>
              <View style={styles.ratingBreakdown}>
                {renderStars(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)}
              </View>
            </View>
          )}
        </LinearGradient>
      </View>

      {/* Reviews List */}
      <FlatList
        data={reviews}
        renderItem={({ item }) => <ReviewCard review={item} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.reviewsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={EmptyListComponent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitleSection: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  headerStats: {
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  averageRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ratingOverview: {
    alignItems: 'flex-start',
  },
  averageRatingNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  averageRatingLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  ratingBreakdown: {
    alignItems: 'flex-end',
  },
  reviewsList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  reviewDate: {
    fontSize: 14,
    color: '#6366F1',
    marginBottom: 2,
    fontWeight: '500',
  },
  timeAgo: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  ratingSection: {
    alignItems: 'flex-end',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 0.2,
  },
  reviewText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '500',
  },
  bookingDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.1,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
    letterSpacing: -0.1,
  },
  responseContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  responseLabel: {
    fontSize: 14,
    color: '#6366F1',
    marginLeft: 8,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  responseText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  respondButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  respondButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
    fontWeight: '500',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    fontWeight: '400',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  emptyActionContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  emptyActionText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '400',
  },
});

export default ReviewDetailsScreen; 