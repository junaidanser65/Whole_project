import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { Text, Button, Icon, Divider } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useBookings } from "../../contexts/BookingsContext";

const BookingDetailsScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const [loading, setLoading] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const { bookings, updateBookingStatus } = useBookings();

  // Find the current booking from context
  const currentBooking = bookings.find((b) => b.id === bookingId);
  const [bookingData, setBookingData] = useState(currentBooking);

  // Update local state when context changes
  useEffect(() => {
    if (currentBooking) {
      setBookingData(currentBooking);
    }
  }, [currentBooking]);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleAcceptBooking = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newStatus = "confirmed";
      updateBookingStatus(bookingId, newStatus);
      setBookingData((prev) => ({
        ...prev,
        status: newStatus,
      }));
      Alert.alert("Success", "Booking accepted successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to accept booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectBooking = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newStatus = "rejected";
      updateBookingStatus(bookingId, newStatus);
      setBookingData((prev) => ({
        ...prev,
        status: newStatus,
      }));
      Alert.alert("Success", "Booking rejected");
    } catch (error) {
      Alert.alert("Error", "Failed to reject booking");
    } finally {
      setLoading(false);
    }
  };

  const handleMessageCustomer = () => {
    if (bookingData.status === "pending" || bookingData.status === "upcoming") {
      const newStatus = "in_discussion";
      updateBookingStatus(bookingId, newStatus);
      setBookingData((prev) => ({
        ...prev,
        status: newStatus,
      }));
    }
    navigation.navigate("Chat", {
      customerId: bookingData.customerId,
      customerName: bookingData.customerName,
      customerAvatar: bookingData.customerAvatar,
    });
  };

  const renderFooterButtons = () => {
    switch (bookingData.status) {
      case "pending":
      case "upcoming":
        return (
          <>
            <Button
              title="Reject"
              onPress={handleRejectBooking}
              buttonStyle={styles.rejectButton}
              containerStyle={[styles.buttonContainer]}
              titleStyle={styles.rejectButtonText}
              loading={loading}
            />
            <Button
              title="Accept Booking"
              onPress={handleAcceptBooking}
              loading={loading}
              buttonStyle={styles.acceptButton}
              containerStyle={styles.buttonContainer}
            />
          </>
        );
      case "rejected":
        return (
          <Button
            title="Booking Rejected"
            disabled
            buttonStyle={styles.rejectedButton}
            containerStyle={styles.fullWidthButton}
          />
        );
      case "confirmed":
        return (
          <Button
            title="Booking Confirmed"
            disabled
            buttonStyle={styles.confirmedButton}
            containerStyle={styles.fullWidthButton}
          />
        );
      default:
        return null;
    }
  };

  // Add safety check for undefined booking data
  if (!bookingData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking not found</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            buttonStyle={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const DetailItem = ({ icon, label, value }) => (
    <View style={styles.detailItem}>
      <View style={styles.detailIcon}>
        <Icon name={icon} type="material" size={20} color="#ff4500" />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || "N/A"}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Animated.View style={styles.header}>
          <LinearGradient
            colors={["#cc3700", "#ff4500"]}
            style={styles.headerGradient}
          >
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  styles[`${bookingData.status}Badge`],
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    styles[`${bookingData.status}Text`],
                  ]}
                >
                  {bookingData.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.bookingId}>Booking #{bookingData.id}</Text>

            {/* <Text style={styles.customerName}>{bookingData.customerName}</Text> */}
            <View style={styles.nameRow}>
              <Text style={styles.customerName}>
                {bookingData.customerName}
              </Text>
              <Button
                onPress={handleMessageCustomer}
                buttonStyle={styles.messageButton}
                containerStyle={styles.buttonContainer1}
                icon={
                  <Icon
                    name="message"
                    type="material"
                    size={20}
                    color="#ff4500"
                    style={styles.buttonIcon}
                  />
                }
                type="outline"
              />
            </View>
            <Text style={styles.eventType}>{bookingData.eventType}</Text>
            {/* <Button
              onPress={handleMessageCustomer}
              buttonStyle={styles.messageButton}
              containerStyle={styles.buttonContainer}
              icon={
                <Icon
                  name="message"
                  type="material"
                  size={20}
                  color="#ff4500"
                  style={styles.buttonIcon}
                />
              }
              type="outline"
            /> */}
          </LinearGradient>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <DetailItem icon="event" label="Date" value={bookingData.date} />
          <DetailItem icon="schedule" label="Time" value={bookingData.time} />
          <DetailItem
            icon="location-on"
            label="Venue"
            value={bookingData.venue}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Contact</Text>
          <DetailItem
            icon="phone"
            label="Phone"
            value={bookingData.customer?.phone || "N/A"}
          />
          <DetailItem
            icon="email"
            label="Email"
            value={bookingData.customer?.email || "N/A"}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services & Pricing</Text>
          {(bookingData.services || []).map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.servicePrice}>${service.price}</Text>
            </View>
          ))}
          <Divider style={styles.divider} />
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>
              $
              {bookingData.services.reduce(
                (sum, service) => sum + service.price,
                0
              )}
            </Text>
          </View>
        </View>

        {bookingData.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <Text style={styles.notes}>{bookingData.notes}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>{renderFooterButtons()}</View>
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
  statusContainer: {
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: "#FFF3E0",
  },
  completedBadge: {
    backgroundColor: "#E8F5E9",
  },
  cancelledBadge: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  pendingText: {
    color: "#FF9800",
  },
  completedText: {
    color: "#4CAF50",
  },
  cancelledText: {
    color: "#F44336",
  },
  bookingId: {
    color: "#FFF",
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  // customerName: {
  //   color: "#FFF",
  //   fontSize: 24,
  //   fontWeight: "bold",
  //   marginBottom: 4,
  // },
  eventType: {
    color: "#FFF",
    fontSize: 16,
    opacity: 0.9,
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
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  detailIcon: {
    backgroundColor: "#ffe0cc",
    padding: 10,
    borderRadius: 10,
    marginRight: 15,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: "#636E72",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#2D3436",
    fontWeight: "500",
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    color: "#2D3436",
  },
  servicePrice: {
    fontSize: 16,
    color: "#2D3436",
    fontWeight: "600",
  },
  divider: {
    marginVertical: 15,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ff4500",
  },
  notes: {
    fontSize: 16,
    color: "#636E72",
    lineHeight: 24,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F5F6FA",
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 4,
  },

  customerName: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    flexShrink: 1,
  },

  buttonContainer1: {
    marginLeft: 10,
  },

  messageButton: {
    backgroundColor: "#FFF",
    borderColor: "#ff4500",
    borderWidth: 1,
    borderRadius: 50,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: "#ff4500",
    borderRadius: 12,
    paddingVertical: 12,
  },
  rejectButton: {
    backgroundColor: "#FFF",
    borderColor: "#FF6B6B",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
  },
  rejectButtonText: {
    color: "#FF6B6B",
  },
  rejectedButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    paddingVertical: 12,
  },
  confirmedButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 12,
  },
  fullWidthButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#636E72",
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: "#ff4500",
    paddingHorizontal: 30,
  },
});

export default BookingDetailsScreen;
