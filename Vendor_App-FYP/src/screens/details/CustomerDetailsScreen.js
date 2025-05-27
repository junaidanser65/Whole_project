import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Text, Button, Icon, Divider } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const CustomerDetailsScreen = ({ route, navigation }) => {
  const { customerId } = route.params;
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Mock customer data - in real app, fetch based on customerId
  const customer = {
    id: customerId,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 234-567-8900",
    status: "vip",
    joinDate: "March 2023",
    stats: {
      totalOrders: 12,
      totalSpent: "$15,800",
      avgOrderValue: "$1,316",
      lastOrder: "2 days ago",
    },
    recentBookings: [
      {
        id: "BK123",
        eventType: "Wedding Reception",
        date: "24 Feb 2024",
        amount: "$2,500",
        status: "upcoming",
      },
      {
        id: "BK122",
        eventType: "Corporate Event",
        date: "15 Jan 2024",
        amount: "$1,800",
        status: "completed",
      },
    ],
    preferences: {
      foodPreferences: "Vegetarian",
      specialRequirements: "Nut-free environment",
      preferredVenue: "Outdoor venues",
    },
  };

  const handleMessageCustomer = () => {
    navigation.navigate("Chat", {
      customerId: customer.id,
      customerName: customer.name,
      customerAvatar: `https://ui-avatars.com/api/?name=${customer.name[0]}&background=ff4500&color=fff`,
    });
  };

  const StatCard = ({ icon, label, value }) => (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Icon name={icon} type="material" size={24} color="#ff4500" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const BookingItem = ({ booking }) => (
    <TouchableOpacity
      style={styles.bookingItem}
      onPress={() =>
        navigation.navigate("BookingDetails", { bookingId: booking.id })
      }
    >
      <View style={styles.bookingInfo}>
        <Text style={styles.bookingType}>{booking.eventType}</Text>
        <Text style={styles.bookingDate}>{booking.date}</Text>
      </View>
      <View style={styles.bookingMeta}>
        <Text style={styles.bookingAmount}>{booking.amount}</Text>
        <View style={[styles.statusBadge, styles[`${booking.status}Badge`]]}>
          <Text style={[styles.statusText, styles[`${booking.status}Text`]]}>
            {booking.status.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
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
              <Icon name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>

            {/* Customer Details */}
            <View style={styles.customerHeader}>
              {/* Avatar */}
              <View
                style={[
                  styles.avatarContainer,
                  styles[`${customer.status}Avatar`],
                ]}
              >
                <Text style={styles.avatarText}>{customer.name[0]}</Text>
              </View>

              {/* Name & Meta */}
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerMeta}>
                  Member since {customer.joinDate}
                </Text>

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    styles[`${customer.status}Badge`],
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      styles[`${customer.status}Text`],
                    ]}
                  >
                    {customer.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactItem}>
            <Icon name="email" type="material" size={20} color="#ff4500" />
            <Text style={styles.contactText}>{customer.email}</Text>
          </View>
          <View style={styles.contactItem}>
            <Icon name="phone" type="material" size={20} color="#ff4500" />
            <Text style={styles.contactText}>{customer.phone}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon="shopping-bag"
            label="Total Orders"
            value={customer.stats.totalOrders}
          />
          <StatCard
            icon="attach-money"
            label="Total Spent"
            value={customer.stats.totalSpent}
          />
          <StatCard
            icon="trending-up"
            label="Avg. Order"
            value={customer.stats.avgOrderValue}
          />
          <StatCard
            icon="schedule"
            label="Last Order"
            value={customer.stats.lastOrder}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate("BookingsList")}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <Icon
                name="chevron-right"
                type="material"
                size={20}
                color="#ff4500"
              />
            </TouchableOpacity>
          </View>
          {customer.recentBookings.map((booking) => (
            <BookingItem key={booking.id} booking={booking} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Food Preferences</Text>
            <Text style={styles.preferenceValue}>
              {customer.preferences.foodPreferences}
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Special Requirements</Text>
            <Text style={styles.preferenceValue}>
              {customer.preferences.specialRequirements}
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Preferred Venue</Text>
            <Text style={styles.preferenceValue}>
              {customer.preferences.preferredVenue}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Message"
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
          buttonStyle={styles.messageButton}
          titleStyle={styles.messageButtonText}
          onPress={handleMessageCustomer}
          containerStyle={styles.buttonContainer}
        />
        <Button
          title="Create Booking"
          icon={
            <Icon
              name="add-circle-outline"
              type="material"
              size={20}
              color="#FFF"
              style={styles.buttonIcon}
            />
          }
          buttonStyle={styles.createButton}
          containerStyle={styles.buttonContainer}
          onPress={() =>
            navigation.navigate("CreateBooking", { customerId: customer.id })
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
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 1,
  },
  customerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  vipAvatar: {
    backgroundColor: "#ff4500",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  customerMeta: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.9,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },

  section: {
    backgroundColor: "#FFF",
    padding: 20,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: "#2D3436",
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    backgroundColor: "#FFF",
    marginBottom: 12,
  },
  statCard: {
    width: "50%",
    padding: 10,
    alignItems: "center",
  },
  statIcon: {
    backgroundColor: "#ffe0cc",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#636E72",
  },
  bookingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F6FA",
  },
  bookingInfo: {
    flex: 1,
  },
  bookingType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: "#636E72",
  },
  bookingMeta: {
    alignItems: "flex-end",
  },
  bookingAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 4,
  },

  upcomingBadge: {
    backgroundColor: "#E8F5E9",
  },
  completedBadge: {
    backgroundColor: "#E3F2FD",
  },
  vipBadge: {
    backgroundColor: "#ffe0cc",
  },

  upcomingText: {
    color: "#4CAF50",
  },
  completedText: {
    color: "#2196F3",
  },
  vipText: {
    color: "#ff4500",
  },
  preferenceItem: {
    marginBottom: 12,
  },
  preferenceLabel: {
    fontSize: 14,
    color: "#636E72",
    marginBottom: 4,
  },
  preferenceValue: {
    fontSize: 16,
    color: "#2D3436",
  },
  divider: {
    marginVertical: 12,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    color: "#ff4500",
    fontSize: 14,
    marginRight: 4,
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
  messageButton: {
    backgroundColor: "#FFF",
    borderColor: "#ff4500",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
  },
  messageButtonText: {
    color: "#ff4500",
  },
  createButton: {
    backgroundColor: "#ff4500",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default CustomerDetailsScreen;
