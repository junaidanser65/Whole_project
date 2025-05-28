import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  Modal,
} from 'react-native';
import { Text, Button, Icon, Input } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const ReviewDetailsScreen = ({ route, navigation }) => {
  const { reviewId } = route.params;
  const [loading, setLoading] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [response, setResponse] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Mock review data
  const review = {
    id: reviewId,
    customerName: 'John Smith',
    rating: 4.5,
    date: '24 Feb 2024',
    eventType: 'Birthday Party',
    comment: 'Amazing service! The food was absolutely delicious and the presentation was perfect. The staff was very professional and attentive to all our needs. Would definitely recommend to anyone looking for a catering service.',
    images: [
      'https://picsum.photos/400/300',
      'https://picsum.photos/400/301',
      'https://picsum.photos/400/302',
    ],
    booking: {
      id: 'BK789',
      date: '22 Feb 2024',
      amount: '$1,800',
    },
    response: null,
  };

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      alert('Please enter a response');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement response submission logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowResponseModal(false);
      navigation.goBack();
    } catch (error) {
      alert('Failed to submit response. Please try again.');
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

  const ResponseModal = () => (
    <Modal
      visible={showResponseModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowResponseModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Respond to Review</Text>
          <Input
            placeholder="Write your response..."
            value={response}
            onChangeText={setResponse}
            multiline
            numberOfLines={6}
            containerStyle={styles.responseInput}
            inputContainerStyle={styles.responseInputContainer}
            inputStyle={styles.responseInputText}
          />
          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              type="outline"
              onPress={() => setShowResponseModal(false)}
              buttonStyle={styles.cancelButton}
              titleStyle={styles.cancelButtonText}
              containerStyle={styles.modalButtonContainer}
            />
            <Button
              title={loading ? 'Submitting...' : 'Submit Response'}
              onPress={handleSubmitResponse}
              loading={loading}
              disabled={loading || !response.trim()}
              buttonStyle={styles.submitButton}
              containerStyle={styles.modalButtonContainer}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Animated.View style={styles.header}>
          <LinearGradient
            colors={["#ff4500", "#cc3700"]}
            style={styles.headerGradient}
          >
            <View style={styles.ratingContainer}>
              {renderStars(review.rating)}
            </View>
            <Text style={styles.customerName}>{review.customerName}</Text>
            <Text style={styles.eventType}>{review.eventType}</Text>
            <Text style={styles.reviewDate}>{review.date}</Text>
          </LinearGradient>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Review</Text>
          <Text style={styles.reviewText}>{review.comment}</Text>
        </View>

        {review.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {review.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(image)}
                >
                  <Image source={{ uri: image }} style={styles.reviewImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.bookingCard}>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingLabel}>Booking ID</Text>
              <Text style={styles.bookingValue}>{review.booking.id}</Text>
            </View>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingLabel}>Event Date</Text>
              <Text style={styles.bookingValue}>{review.booking.date}</Text>
            </View>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingLabel}>Amount</Text>
              <Text style={styles.bookingValue}>{review.booking.amount}</Text>
            </View>
          </View>
        </View>

        {review.response && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Response</Text>
            <Text style={styles.responseText}>{review.response}</Text>
          </View>
        )}
      </ScrollView>

      {!review.response && (
        <View style={styles.footer}>
          <Button
            title="Respond to Review"
            onPress={() => setShowResponseModal(true)}
            buttonStyle={styles.respondButton}
            containerStyle={styles.buttonContainer}
            icon={
              <Icon
                name="reply"
                type="material"
                size={20}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
            }
          />
        </View>
      )}

      <ResponseModal />

      {selectedImage && (
        <Modal
          visible={!!selectedImage}
          transparent={true}
          onRequestClose={() => setSelectedImage(null)}
        >
          <TouchableOpacity
            style={styles.imageModalOverlay}
            onPress={() => setSelectedImage(null)}
          >
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
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
  ratingContainer: {
    marginBottom: 15,
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  customerName: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  eventType: {
    color: "#FFF",
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 4,
  },
  reviewDate: {
    color: "#FFF",
    fontSize: 14,
    opacity: 0.8,
  },
  section: {
    padding: 20,
    backgroundColor: "#FFF",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 15,
  },
  reviewText: {
    fontSize: 16,
    color: "#636E72",
    lineHeight: 24,
  },
  reviewImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginRight: 12,
  },
  bookingCard: {
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bookingInfo: {
    flex: 1,
    alignItems: "center",
  },
  bookingLabel: {
    fontSize: 14,
    color: "#636E72",
    marginBottom: 4,
  },
  bookingValue: {
    fontSize: 16,
    color: "#2D3436",
    fontWeight: "600",
  },
  responseText: {
    fontSize: 16,
    color: "#636E72",
    lineHeight: 24,
    fontStyle: "italic",
  },
  footer: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F5F6FA",
  },
  buttonContainer: {
    width: "100%",
  },
  respondButton: {
    backgroundColor: "#ff4500",
    borderRadius: 12,
    paddingVertical: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 20,
  },
  responseInput: {
    paddingHorizontal: 0,
  },
  responseInputContainer: {
    borderWidth: 1,
    borderColor: "#DFE6E9",
    borderRadius: 12,
    paddingHorizontal: 15,
    minHeight: 120,
  },
  responseInputText: {
    fontSize: 16,
    color: "#2D3436",
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 20,
  },
  modalButtonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#FFF",
    borderColor: "#ff4500",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: "#ff4500",
  },
  submitButton: {
    backgroundColor: "#ff4500",
    borderRadius: 12,
    paddingVertical: 12,
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "80%",
  },
});

export default ReviewDetailsScreen; 