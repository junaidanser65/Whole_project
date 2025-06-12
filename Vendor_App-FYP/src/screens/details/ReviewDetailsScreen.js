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
  Text,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getVendorReviews } from '../../services/api';

const ReviewDetailsScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      const response = await getVendorReviews();
      setReviews(response.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      alert('Failed to fetch reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? 'star' : star - rating === 0.5 ? 'star-half' : 'star-outline'}
            type="material"
            size={24}
            color="#FFB800"
            style={styles.starIcon}
          />
        ))}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
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

  const ReviewCard = ({ review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {review.user_name?.[0] || '?'}
            </Text>
          </View>
          <View style={styles.reviewInfo}>
            <Text style={styles.customerName}>{review.user_name}</Text>
            <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
          </View>
        </View>
        {renderStars(review.rating)}
      </View>

      <Text style={styles.reviewText}>{review.comment}</Text>

      <View style={styles.bookingInfo}>
        <Text style={styles.bookingLabel}>Booking Date:</Text>
        <Text style={styles.bookingValue}>{formatDate(review.booking_date)}</Text>
        <Text style={styles.bookingLabel}>Amount:</Text>
        <Text style={styles.bookingValue}>${review.total_amount}</Text>
      </View>

      {review.response && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Your Response:</Text>
          <Text style={styles.responseText}>{review.response}</Text>
        </View>
      )}
    </View>
  );

  if (loading && reviews.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4500" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <LinearGradient
          colors={["#ff4500", "#cc3700"]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" type="material" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Customer Reviews</Text>
          </View>
        </LinearGradient>
      </View>

      <FlatList
        data={reviews}
        renderItem={({ item }) => <ReviewCard review={item} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.reviewsList}
        refreshing={loading}
        onRefresh={fetchReviews}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="star-outline" size={50} color="#636E72" />
            <Text style={styles.emptyText}>No reviews yet</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 20,
    alignItems: "center",
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 10,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    flex: 1,
    textAlign: 'center',
  },
  reviewsList: {
    padding: 20,
  },
  reviewCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ff4500",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  reviewInfo: {
    marginLeft: 10,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
  },
  reviewDate: {
    fontSize: 12,
    color: "#636E72",
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginHorizontal: 2,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
  },
  reviewText: {
    fontSize: 14,
    color: "#636E72",
    lineHeight: 20,
    marginBottom: 10,
  },
  bookingInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F5F6FA",
  },
  bookingLabel: {
    fontSize: 12,
    color: "#636E72",
    marginRight: 5,
  },
  bookingValue: {
    fontSize: 12,
    color: "#2D3436",
    fontWeight: "600",
    marginRight: 15,
  },
  responseContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F5F6FA",
  },
  responseLabel: {
    fontSize: 12,
    color: "#636E72",
    marginBottom: 5,
  },
  responseText: {
    fontSize: 14,
    color: "#2D3436",
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#636E72",
    marginTop: 10,
  }
});

export default ReviewDetailsScreen; 