import React, { useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Text, SearchBar, Icon, Button } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const BOOKING_FILTERS = [
  { id: "all", label: "All Bookings" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "pending", label: "Pending" },
  { id: "cancelled", label: "Cancelled" },
];

const BookingsListScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Mock bookings data
  const bookings = [
    {
      id: "1",
      customerName: "Sarah Johnson",
      eventType: "Wedding Reception",
      date: "24 Feb 2024",
      time: "6:00 PM",
      amount: "$2,500",
      status: "upcoming",
      guests: 150,
    },
    {
      id: "2",
      customerName: "Mike Anderson",
      eventType: "Corporate Event",
      date: "23 Feb 2024",
      time: "2:00 PM",
      amount: "$1,800",
      status: "pending",
      guests: 80,
    },
    {
      id: "3",
      customerName: "Emily Wilson",
      eventType: "Birthday Party",
      date: "22 Feb 2024",
      time: "4:00 PM",
      amount: "$1,200",
      status: "completed",
      guests: 40,
    },
  ];

  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter =
      selectedFilter === "all" || booking.status === selectedFilter;
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.eventType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const BookingCard = ({ booking }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() =>
        navigation.navigate("BookingDetails", { bookingId: booking.id })
      }
    >
      <View style={styles.bookingHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{booking.customerName[0]}</Text>
          </View>
          <View style={styles.bookingInfo}>
            <Text style={styles.customerName}>{booking.customerName}</Text>
            <Text style={styles.eventType}>{booking.eventType}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, styles[`${booking.status}Badge`]]}>
          <Text style={[styles.statusText, styles[`${booking.status}Text`]]}>
            {booking.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailItem}>
          <Icon name="event" type="material" size={16} color="#636E72" />
          <Text style={styles.detailText}>{booking.date}</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="schedule" type="material" size={16} color="#636E72" />
          <Text style={styles.detailText}>{booking.time}</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="people" type="material" size={16} color="#636E72" />
          <Text style={styles.detailText}>{booking.guests} guests</Text>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <Text style={styles.amount}>{booking.amount}</Text>
        <Button
          title="View Details"
          type="clear"
          icon={
            <Icon
              name="chevron-right"
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
      {/* <Animated.View style={styles.header}>
        <LinearGradient
          colors={["#ff4500", "#cc3700"]}
          style={styles.headerGradient}
        >
          <Text style={styles.title}>Bookings</Text>
          <SearchBar
            placeholder="Search bookings..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            containerStyle={styles.searchContainer}
            inputContainerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
            lightTheme
            round
          />
        </LinearGradient>
      </Animated.View> */}
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

          <Text style={styles.title}>Bookings</Text>
        </LinearGradient>

        {/* Search Bar positioned to overlap both sections */}
        <View style={styles.searchWrapper}>
          <SearchBar
            placeholder="Search bookings..."
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
          data={BOOKING_FILTERS}
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
        data={filteredBookings}
        renderItem={({ item }) => <BookingCard booking={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.bookingsList}
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
  // header: {
  //   marginBottom: 12,
  // },
  // headerGradient: {
  //   padding: 20,
  // },
  // title: {
  //   fontSize: 28,
  //   fontWeight: "bold",
  //   color: "#FFF",
  //   marginBottom: 15,
  // },
  // searchContainer: {
  //   backgroundColor: "transparent",
  //   borderTopWidth: 0,
  //   borderBottomWidth: 0,
  //   paddingHorizontal: 0,
  // },
  // searchInputContainer: {
  //   backgroundColor: "#FFF",
  //   borderRadius: 12,
  // },
  // searchInput: {
  //   fontSize: 16,
  // },
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
  bookingsList: {
    padding: 20,
  },
  bookingCard: {
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
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
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
  bookingInfo: {
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: -100,
  },
  upcomingBadge: {
    backgroundColor: "#E8F5E9",
  },
  pendingBadge: {
    backgroundColor: "#FFF3E0",
  },
  completedBadge: {
    backgroundColor: "#E3F2FD",
  },
  cancelledBadge: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  upcomingText: {
    color: "#4CAF50",
  },
  pendingText: {
    color: "#FF9800",
  },
  completedText: {
    color: "#2196F3",
  },
  cancelledText: {
    color: "#F44336",
  },
  bookingDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F5F6FA",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#636E72",
  },
  bookingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
  },
  viewDetailsText: {
    color: "#ff4500",
    fontSize: 14,
    marginRight: 4,
  },
});

export default BookingsListScreen;
