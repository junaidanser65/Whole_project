import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Text, Button, Icon, Divider } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const PaymentDetailsScreen = ({ route, navigation }) => {
  const { paymentId } = route.params;
  const [loading, setLoading] = useState(false);
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Mock payment data
  const payment = {
    id: paymentId,
    amount: 2500,
    status: 'completed',
    date: '24 Feb 2024',
    time: '3:45 PM',
    paymentMethod: {
      type: 'credit_card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '24',
    },
    transactionId: 'TXN123456789',
    customer: {
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 234-567-8900',
    },
    booking: {
      id: 'BK123',
      eventType: 'Wedding Reception',
      date: '24 Feb 2024',
    },
  };

  const handleDownloadReceipt = async () => {
    setLoading(true);
    try {
      // TODO: Implement receipt download logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Receipt downloaded successfully');
    } catch (error) {
      alert('Failed to download receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const DetailItem = ({ icon, label, value }) => (
    <View style={styles.detailItem}>
      <View style={styles.detailIcon}>
        <Icon name={icon} type="material" size={20} color="#ff4500" />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={["#ff4500", "#cc3700"]}
            style={styles.headerGradient}
          >
            <View style={styles.statusContainer}>
              <View
                style={[styles.statusBadge, styles[`${payment.status}Badge`]]}
              >
                <Text
                  style={[styles.statusText, styles[`${payment.status}Text`]]}
                >
                  {payment.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.paymentId}>
              Transaction #{payment.transactionId}
            </Text>
            <Text style={styles.amount}>
              ${payment.amount.toLocaleString()}
            </Text>
            <Text style={styles.paymentDate}>
              {payment.date} at {payment.time}
            </Text>
          </LinearGradient>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethodCard}>
            <Icon
              name={payment.paymentMethod.brand.toLowerCase()}
              type="font-awesome"
              size={24}
              color="#ff4500"
            />
            <View style={styles.paymentMethodInfo}>
              <Text style={styles.paymentMethodTitle}>
                {payment.paymentMethod.brand} ending in{" "}
                {payment.paymentMethod.last4}
              </Text>
              <Text style={styles.paymentMethodExpiry}>
                Expires {payment.paymentMethod.expiryMonth}/
                {payment.paymentMethod.expiryYear}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <DetailItem
            icon="person"
            label="Name"
            value={payment.customer.name}
          />
          <DetailItem
            icon="email"
            label="Email"
            value={payment.customer.email}
          />
          <DetailItem
            icon="phone"
            label="Phone"
            value={payment.customer.phone}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <DetailItem
            icon="event"
            label="Event Type"
            value={payment.booking.eventType}
          />
          <DetailItem
            icon="calendar-today"
            label="Event Date"
            value={payment.booking.date}
          />
          <DetailItem
            icon="confirmation-number"
            label="Booking ID"
            value={payment.booking.id}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="View Booking"
          type="outline"
          onPress={() =>
            navigation.navigate("BookingDetails", {
              bookingId: payment.booking.id,
            })
          }
          buttonStyle={styles.viewBookingButton}
          titleStyle={styles.viewBookingText}
          containerStyle={styles.buttonContainer}
          icon={
            <Icon
              name="visibility"
              type="material"
              size={20}
              color="#ff4500"
              style={styles.buttonIcon}
            />
          }
        />
        <Button
          title={loading ? "Downloading..." : "Download"}
          onPress={handleDownloadReceipt}
          loading={loading}
          disabled={loading}
          buttonStyle={styles.downloadButton}
          containerStyle={styles.buttonContainer}
          icon={
            !loading && (
              <Icon
                name="download"
                type="material"
                size={20}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
            )
          }
        />
      </View>
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
  completedBadge: {
    backgroundColor: "#E8F5E9",
  },
  pendingBadge: {
    backgroundColor: "#FFF3E0",
  },
  failedBadge: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  completedText: {
    color: "#4CAF50",
  },
  pendingText: {
    color: "#FF9800",
  },
  failedText: {
    color: "#F44336",
  },
  paymentId: {
    color: "#FFF",
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  amount: {
    color: "#FFF",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 4,
  },
  paymentDate: {
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
  paymentMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
  },
  paymentMethodInfo: {
    marginLeft: 15,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 4,
  },
  paymentMethodExpiry: {
    fontSize: 14,
    color: "#636E72",
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
  viewBookingButton: {
    backgroundColor: "#FFF",
    borderColor: "#ff4500",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
  },
  viewBookingText: {
    color: "#ff4500",
  },
  downloadButton: {
    backgroundColor: "#ff4500",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default PaymentDetailsScreen; 