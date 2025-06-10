import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "../../contexts/ProfileContext";
import { getTotalBalance, getTodayRevenue, getNewBookings, getTotalCustomers, getAverageRating, getWeeklyRevenue, getMonthlyRevenue, getRecentActivities } from "../../services/api";

const DashboardScreen = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [totalBalance, setTotalBalance] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [newBookings, setNewBookings] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingRating, setIsLoadingRating] = useState(true);
  const isSmallDevice = width < 375;
  // const { user, loading } = useAuth();
  // const { profile, loadingProfile, errorProfile } = useProfile();

  // useEffect(() => {
  //   console.log("User is loged in by user name:", user);
  //   console.log("Profile is loged in by user name:", profile);
  // }, []);

  const { user, loading } = useAuth();
  const { profile, loadingProfile } = useProfile(); // ✅ use profile

  const [weeklyData, setWeeklyData] = useState({
    labels: [],
    datasets: [
      {
        data: Array(7).fill(0),
        color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  });

  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    datasets: [
      {
        data: Array(6).fill(0),
        color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  });

  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [recentActivities, setRecentActivities] = useState({
    pendingBooking: null,
    latestPayment: null,
    latestReview: null
  });
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  const fetchTotalBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await getTotalBalance();
      if (response.success) {
        setTotalBalance(response.total_balance || 0);
      } else {
        setTotalBalance(0);
      }
    } catch (error) {
      console.error('Error fetching total balance:', error);
      setTotalBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const fetchTodayRevenue = async () => {
    try {
      setIsLoadingRevenue(true);
      const response = await getTodayRevenue();
      if (response.success) {
        setTodayRevenue(response.today_revenue || 0);
      } else {
        setTodayRevenue(0);
      }
    } catch (error) {
      console.error('Error fetching today\'s revenue:', error);
      setTodayRevenue(0);
    } finally {
      setIsLoadingRevenue(false);
    }
  };

  const fetchNewBookings = async () => {
    try {
      setIsLoadingBookings(true);
      const response = await getNewBookings();
      if (response.success) {
        setNewBookings(response.new_bookings || 0);
      } else {
        setNewBookings(0);
      }
    } catch (error) {
      console.error('Error fetching new bookings:', error);
      setNewBookings(0);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const fetchTotalCustomers = async () => {
    try {
      setIsLoadingCustomers(true);
      const response = await getTotalCustomers();
      if (response.success) {
        setTotalCustomers(response.total_customers || 0);
      } else {
        setTotalCustomers(0);
      }
    } catch (error) {
      console.error('Error fetching total customers:', error);
      setTotalCustomers(0);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const fetchAverageRating = async () => {
    try {
      setIsLoadingRating(true);
      const response = await getAverageRating();
      if (response.success) {
        setAverageRating(response.average_rating || 0);
      } else {
        setAverageRating(0);
      }
    } catch (error) {
      console.error('Error fetching average rating:', error);
      setAverageRating(0);
    } finally {
      setIsLoadingRating(false);
    }
  };

  const fetchWeeklyRevenue = async () => {
    try {
      const response = await getWeeklyRevenue();
      if (response.success) {
        setWeeklyData(prev => ({
          labels: response.labels,
          datasets: [{
            ...prev.datasets[0],
            data: response.data
          }]
        }));
      }
    } catch (error) {
      console.error('Error fetching weekly revenue:', error);
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      const response = await getMonthlyRevenue();
      if (response.success) {
        setMonthlyData(prev => ({
          labels: response.labels,
          datasets: [{
            ...prev.datasets[0],
            data: response.data
          }]
        }));
      }
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
    } finally {
      setIsLoadingChart(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      setIsLoadingActivities(true);
      const response = await getRecentActivities();
      if (response.success) {
        setRecentActivities(response.activities);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  useEffect(() => {
    fetchTotalBalance();
    fetchTodayRevenue();
    fetchNewBookings();
    fetchTotalCustomers();
    fetchAverageRating();
    fetchWeeklyRevenue();
    fetchMonthlyRevenue();
    fetchRecentActivities();
  }, []);

  useEffect(() => {
    if (user) {
      console.log("User is logged in:", user);
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      console.log("Fetched Profile:", profile);
    }
  }, [profile]); // ✅ ensure console logs when profile is fetched

  // Avatar Function
  const fullName = user?.name || "User";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 85, 0, ${opacity})`,
    labelColor: () => "#636E72",
    style: { borderRadius: 16 },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#ff4500",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      strokeWidth: 0.5,
      stroke: "rgba(0, 0, 0, 0.05)",
    },
    formatYLabel: (value) => `$${value}`,
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([
      fetchTotalBalance(),
      fetchTodayRevenue(),
      fetchNewBookings(),
      fetchTotalCustomers(),
      fetchAverageRating(),
      fetchWeeklyRevenue(),
      fetchMonthlyRevenue(),
      fetchRecentActivities()
    ]).finally(() => setRefreshing(false));
  }, []);

  // const handleAddBalance = () => {
  //   navigation.navigate('AddBalance');
  // };

  // const handleSendMoney = () => {
  //   navigation.navigate('SendMoney');
  // };

  const handleReceiveMoney = () => {
    navigation.navigate("ReceiveMoney");
  };

  const handleChat = () => {
    navigation.navigate('Chat');
  };

  const handleViewRevenue = () => {
    navigation.navigate('MainApp', {
      screen: 'Dashboard',
      params: {
        screen: 'RevenueDetails'
      }
    });
  };

  const handleStatCardPress = (type) => {
    switch (type) {
      case "revenue":
        handleViewRevenue();
        break;
      case "bookings":
        navigation.navigate("Bookings", { initialTab: 'pending' });
        break;
      case "customers":
        navigation.navigate("CustomersList");
        break;
      case "ratings":
        navigation.navigate("RatingsReviews");
        break;
    }
  };

  const StatCard = ({ icon, label, value, trend, color, type }) => (
    <TouchableOpacity
      style={styles.statCardNew}
      onPress={() => handleStatCardPress(type)}
    >
      <LinearGradient
        colors={[color + "15", color + "05"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statGradient}
      >
        <View style={styles.statContent}>
          <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>
              {" "}
              {label.split(" ").length > 1
                ? label.split(" ").join("\n")
                : label}
            </Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
          </View>
        </View>
        {trend && (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor:
                  trend > 0
                    ? "rgba(46, 213, 115, 0.15)"
                    : "rgba(255, 71, 87, 0.15)",
              },
            ]}
          >
            <Ionicons
              name={trend > 0 ? "trending-up" : "trending-down"}
              size={14}
              color={trend > 0 ? "#2ed573" : "#ff4757"}
            />
            <Text
              style={[
                styles.trendText,
                { color: trend > 0 ? "#2ed573" : "#ff4757" },
              ]}
            >
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  // Helper function to format time ago
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Main Balance Card */}
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={["#ff4500", "#cc3700"]}
            style={styles.balanceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceHeader}>
              <View>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                {isLoadingBalance ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.balanceAmount}>
                    ${Number(totalBalance).toFixed(2)}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() => navigation.navigate("Profile")}
              >
                <Image
                  source={{
                    uri: `https://ui-avatars.com/api/?name=${initials}&background=ff4500&color=fff`,
                  }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.quickActions}>
              {/* <TouchableOpacity
                style={styles.actionButton}
                onPress={handleAddBalance}
              >
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
                <Text style={styles.actionText}>Add</Text>
              </TouchableOpacity> */}
              {/* <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSendMoney}
              >
                <Ionicons name="arrow-up-circle-outline" size={24} color="#fff" />
                <Text style={styles.actionText}>Send</Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleReceiveMoney}
              >
                <Ionicons
                  name="arrow-down-circle-outline"
                  size={24}
                  color="#fff"
                />
                <Text style={styles.actionText}>Receive</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleChat}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={24}
                  color="#fff"
                />
                <Text style={styles.actionText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="wallet-outline"
              label="Today's Revenue"
              value={isLoadingRevenue ? "..." : `$${Number(todayRevenue).toFixed(2)}`}
              trend={12.5}
              color="#ff4500"
              type="revenue"
            />
            <StatCard
              icon="calendar-outline"
              label="New Bookings"
              value={isLoadingBookings ? "..." : newBookings.toString()}
              trend={-5.2}
              color="#4834d4"
              type="bookings"
            />
            <StatCard
              icon="people-outline"
              label="Total Customers"
              value={isLoadingCustomers ? "..." : totalCustomers.toString()}
              trend={8.1}
              color="#20bf6b"
              type="customers"
            />
            <StatCard
              icon="star-outline"
              label="Avg Rating"
              value={isLoadingRating ? "..." : averageRating.toString()}
              trend={2.3}
              color="#f39c12"
              type="ratings"
            />
          </View>
        </View>

        {/* Chart Section - Updated */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Revenue</Text>
              <Text style={styles.chartTitle}>Overview</Text>
            </View>
            <View style={styles.periodSelector}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedPeriod("weekly");
                  fetchWeeklyRevenue();
                }}
                style={[
                  styles.periodButton,
                  selectedPeriod === "weekly" && styles.periodButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === "weekly" &&
                      styles.periodButtonTextActive,
                  ]}
                >
                  Week
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedPeriod("monthly");
                  fetchMonthlyRevenue();
                }}
                style={[
                  styles.periodButton,
                  selectedPeriod === "monthly" && styles.periodButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === "monthly" &&
                      styles.periodButtonTextActive,
                  ]}
                >
                  Month
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {isLoadingChart ? (
            <ActivityIndicator size="large" color="#ff4500" style={styles.chartLoader} />
          ) : (
          <LineChart
              data={selectedPeriod === "weekly" ? weeklyData : monthlyData}
            width={width - 50}
            height={180}
            chartConfig={{
              ...chartConfig,
              propsForBackgroundLines: {
                strokeDasharray: "",
                strokeWidth: 0.5,
                stroke: "rgba(0, 0, 0, 0.05)",
              },
            }}
            bezier
            style={styles.chart}
          />
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AllActivities")}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#ff4500" />
            </TouchableOpacity>
          </View>

          {isLoadingActivities ? (
            <ActivityIndicator size="large" color="#ff4500" style={styles.activityLoader} />
          ) : (
            <>
              {recentActivities.pendingBooking && (
          <ActivityItem
            type="booking"
            title="New Booking Request"
                  description={`${recentActivities.pendingBooking.user_name} - ${new Date(recentActivities.pendingBooking.booking_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}`}
                  time={getTimeAgo(recentActivities.pendingBooking.created_at)}
                  amount={`$${recentActivities.pendingBooking.total_amount}`}
            onPress={() =>
                    navigation.navigate("Bookings", { 
                      initialTab: 'pending',
                      bookingId: recentActivities.pendingBooking.id 
              })
            }
          />
              )}

              {recentActivities.latestPayment && (
          <ActivityItem
            type="payment"
            title="Payment Received"
                  description={`${recentActivities.latestPayment.user_name} - ${new Date(recentActivities.latestPayment.booking_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}`}
                  time={getTimeAgo(recentActivities.latestPayment.updated_at)}
                  amount={`$${recentActivities.latestPayment.total_amount}`}
            onPress={() =>
                    navigation.navigate("Bookings", { 
                      initialTab: 'completed',
                      bookingId: recentActivities.latestPayment.id 
              })
            }
          />
              )}

              {recentActivities.latestReview && (
          <ActivityItem
            type="review"
            title="New Review"
                  description={`${recentActivities.latestReview.user_name} - ${new Date(recentActivities.latestReview.booking_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}`}
                  time={getTimeAgo(recentActivities.latestReview.created_at)}
                  rating={recentActivities.latestReview.rating}
            onPress={() =>
              navigation.navigate("ReviewDetails", {
                      reviewId: recentActivities.latestReview.id,
                      title: `Review - ${recentActivities.latestReview.user_name}`,
              })
            }
          />
              )}

              {!recentActivities.pendingBooking && 
               !recentActivities.latestPayment && 
               !recentActivities.latestReview && (
                <Text style={styles.noActivitiesText}>No recent activities</Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ActivityItem = ({
  type,
  title,
  description,
  time,
  amount,
  rating,
  onPress,
}) => (
  <TouchableOpacity style={styles.activityItem} onPress={onPress}>
    <View style={styles.activityLeft}>
      <View style={[styles.activityIcon, styles[`${type}Icon`]]}>
        <Ionicons
          name={
            type === "booking"
              ? "calendar"
              : type === "payment"
              ? "wallet"
              : "star"
          }
          size={20}
          color="#fff"
        />
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityDescription}>{description}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
    </View>
    {amount && <Text style={styles.activityAmount}>{amount}</Text>}
    {rating && (
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#FFB800" />
        <Text style={styles.ratingText}>{rating}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  contentContainer: {
    paddingBottom: 24,
  },
  balanceCard: {
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  balanceGradient: {
    padding: 24,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "600",
    color: "#ffffff",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingHorizontal: 20,
  },
  actionButton: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionText: {
    color: "#ffffff",
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    padding: 10,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "47%",
    height: 150,
    marginBottom: 10,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#636E72",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  chartContainer: {
    margin: 24,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },
  periodButtonActive: {
    backgroundColor: "#ff4500",
  },
  periodButtonText: {
    fontSize: 13,
    color: "#636E72",
  },
  periodButtonTextActive: {
    color: "#FFF",
    fontWeight: "500",
  },
  chart: {
    marginTop: 8,
    borderRadius: 16,
    marginLeft: -20,
  },
  activityContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
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
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  seeAllText: {
    color: "#ff4500",
    fontSize: 14,
    marginRight: 4,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bookingIcon: {
    backgroundColor: "#4834d4",
  },
  paymentIcon: {
    backgroundColor: "#20bf6b",
  },
  reviewIcon: {
    backgroundColor: "#FFB800",
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2D3436",
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: "#636E72",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: "#95a5a6",
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3436",
    marginLeft: 4,
  },
  statCardNew: {
    width: "50%",
    borderRadius: 16,
    padding: 16,
  },
  statGradient: {
    padding: 16,
    borderRadius: 16,
  },
  chartLoader: {
    marginTop: 20,
    marginBottom: 20,
  },
  activityLoader: {
    marginTop: 20,
    marginBottom: 20,
  },
  noActivitiesText: {
    textAlign: 'center',
    color: '#636E72',
    fontSize: 16,
    marginTop: 20,
  },
});

export default DashboardScreen;
// import React, { useEffect } from "react";
// import { View, Text } from "react-native";
// import { useAuth } from "../../contexts/AuthContext";

// const DashboardScreen = () => {
//   const { user, loading } = useAuth();

//   useEffect(() => {
//     if (user) {
//       console.log("Logged-in User Info:", user);
//     }
//   }, [user]);

//   if (loading) return <Text>Loading...</Text>;

//   return (
//     <View>
//       <Text>Welcome, {user?.name || "Guest"}!</Text>
//     </View>
//   );
// };

// export default DashboardScreen;

