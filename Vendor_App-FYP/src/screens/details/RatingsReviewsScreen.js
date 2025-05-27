import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { Text, SearchBar, Icon, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const RATING_FILTERS = [
  { id: 'all', label: 'All Reviews' },
  { id: '5', label: '5 Stars' },
  { id: '4', label: '4 Stars' },
  { id: '3', label: '3 Stars' },
  { id: 'pending', label: 'Pending' },
];

const RatingsReviewsScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Mock reviews data
  const reviews = [
    {
      id: '1',
      customerName: 'Sarah Johnson',
      rating: 5,
      date: '24 Feb 2024',
      comment: 'Amazing service! The food was absolutely delicious and the presentation was perfect.',
      eventType: 'Wedding Reception',
      images: ['https://picsum.photos/400/300'],
      status: 'pending',
    },
    {
      id: '2',
      customerName: 'Mike Anderson',
      rating: 4,
      date: '23 Feb 2024',
      comment: 'Great experience overall. Very professional team.',
      eventType: 'Corporate Event',
      images: ['https://picsum.photos/400/300'],
      status: 'responded',
    },
  ];

  const filteredReviews = reviews.filter(review => {
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'pending' ? review.status === 'pending' : review.rating.toString() === selectedFilter);
    const matchesSearch = review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderStars = (rating) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          type="material"
          size={16}
          color="#FFB800"
          style={styles.starIcon}
        />
      ))}
    </View>
  );

  const ReviewCard = ({ review }) => (
    <TouchableOpacity
      style={styles.reviewCard}
      onPress={() =>
        navigation.navigate("ReviewDetails", { reviewId: review.id })
      }
    >
      <View style={styles.reviewHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{review.customerName[0]}</Text>
          </View>
          <View style={styles.reviewInfo}>
            <Text style={styles.customerName}>{review.customerName}</Text>
            <Text style={styles.eventType}>{review.eventType}</Text>
          </View>
        </View>
      </View>

      <View style={styles.ratingContainer}>
        {renderStars(review.rating)}
        {review.status === "pending" && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>PENDING RESPONSE</Text>
          </View>
        )}
      </View>

      <Text style={styles.reviewComment} numberOfLines={3}>
        {review.comment}
      </Text>

      {review.images.length > 0 && (
        <View style={styles.imagesContainer}>
          {review.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.reviewImage}
            />
          ))}
        </View>
      )}

      <View style={styles.reviewFooter}>
        <Text style={styles.reviewDate}>{review.date}</Text>

        <Button
          title={review.status === "pending" ? "Respond" : "View Details"}
          type="clear"
          icon={
            <Icon
              name={review.status === "pending" ? "reply" : "chevron-right"}
              type="material"
              size={20}
              color="#ff4500"
            />
          }
          iconRight
          titleStyle={styles.viewDetailsText}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={styles.header}>
        <LinearGradient
          colors={["#ff4500", "#cc3700"]}
          style={styles.headerGradient}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <Text style={styles.title}>Reviews</Text>
        </LinearGradient>

        {/* Search Bar positioned to overlap both sections */}
        <View style={styles.searchWrapper}>
          <SearchBar
            placeholder="Search reviews..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            containerStyle={styles.searchContainer}
            inputContainerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
            lightTheme
            round
          />
        </View>
      </Animated.View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={RATING_FILTERS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === item.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(item.id)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === item.id && styles.filterButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      <FlatList
        data={filteredReviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReviewCard review={item} />}
        contentContainerStyle={styles.reviewsList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 40, // Increased margin for overlap effect
  },
  headerGradient: {
    padding: 20,
    paddingBottom: 50, // Increased padding to make space for SearchBar
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 15,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  searchWrapper: {
    position: "absolute",
    top: "75%", // Moves the search bar down
    left: "5%",
    right: "5%",
  },
  searchContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  searchInputContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: {
    fontSize: 16,
  },
  filterContainer: {
    backgroundColor: "#FFF",
    paddingVertical: 12,
    marginBottom: 12,
  },
  filterList: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F6FA",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#ff4500",
  },
  filterButtonText: {
    color: "#636E72",
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: "#FFF",
    fontWeight: "500",
  },
  reviewsList: {
    padding: 20,
  },
  reviewCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
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
    marginRight: 12,
  },
  avatarText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  reviewInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 4,
  },
  eventType: {
    fontSize: 14,
    color: "#636E72",
  },
  reviewDate: {
    fontSize: 14,
    color: "#636E72",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginRight: 2,
  },
  pendingBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pendingText: {
    color: "#FF9800",
    fontSize: 12,
    fontWeight: "600",
  },
  reviewComment: {
    fontSize: 16,
    color: "#2D3436",
    lineHeight: 24,
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  reviewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewDetailsText: {
    color: "#ff4500",
    fontSize: 14,
    marginRight: 4,
  },
});

export default RatingsReviewsScreen; 