import React, { useState, useEffect, useRef } from "react";
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
  Animated,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Easing } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "../../contexts/ProfileContext";
import { useFocusEffect } from '@react-navigation/native';
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
  const { profile, loadingProfile, refreshProfile } = useProfile(); // ✅ use profile

  const [weeklyData, setWeeklyData] = useState({
    labels: [],
    datasets: [
      {
        data: Array(7).fill(0),
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  });

  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    datasets: [
      {
        data: Array(6).fill(0),
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 3,
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
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const cardHeight = 180; // Approximate height of the balance card
  const scrollThreshold = 5; // Reduced threshold for more responsive feel

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

  // Refresh profile when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (refreshProfile) {
        refreshProfile();
      }
    }, [refreshProfile])
  );

  // Avatar Function
  const fullName = profile?.name || user?.name || "User";
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
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: () => "#64748B",
    style: { borderRadius: 16 },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#6366F1",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      strokeWidth: 0.5,
      stroke: "rgba(100, 116, 139, 0.1)",
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
        navigation.navigate('MainApp', {
          screen: 'Dashboard',
          params: {
            screen: 'ReviewDetails'
          }
        });
        break;
    }
  };



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
      <Animated.ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
            listener: (event) => {
              const currentScrollY = event.nativeEvent.contentOffset.y;
              const scrollDiff = currentScrollY - lastScrollY.current;
              
              // Skip if we're already animating or scroll is too small
              if (Math.abs(scrollDiff) < 1 || isAnimating.current) {
                lastScrollY.current = currentScrollY;
                return;
              }
              
              // Determine scroll direction based on scroll diff
              const scrollingDown = scrollDiff > 0;
              const targetY = scrollingDown ? -cardHeight : 0;
              
              // Only trigger animation if we're not already at the target position
              if ((scrollingDown && translateY._value !== -cardHeight) || 
                  (!scrollingDown && translateY._value !== 0)) {
                isAnimating.current = true;
                
                Animated.timing(translateY, {
                  toValue: targetY,
                  duration: 250,
                  useNativeDriver: true,
                  easing: scrollingDown ? 
                    Easing.out(Easing.quad) : // Smooth out when hiding
                    Easing.out(Easing.quad)   // Smooth in when showing
                }).start(({ finished }) => {
                  if (finished) isAnimating.current = false;
                });
              }
              
              lastScrollY.current = currentScrollY;
            },
          }
        )}
        scrollEventThrottle={16}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.greetingContainer}>
              <View>
              <Text style={styles.greetingText}>Good morning</Text>
              <Text style={styles.welcomeText}>{profile?.name || user?.name || "Vendor"}</Text>
              </View>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() => navigation.navigate("Profile")}
              >
                <Image
                  source={{
                  uri: `https://ui-avatars.com/api/?name=${initials}&background=6366F1&color=fff`,
                  }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
          </View>
            </View>

        {/* Balance Card */}
        <Animated.View 
          style={[
            styles.balanceCard, 
            { 
              transform: [{ translateY: translateY }],
              position: 'relative',
              zIndex: 1000,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 5,
              backgroundColor: '#fff', // Ensure background color is set for smooth shadow
            }
          ]}
        >
          <LinearGradient
            colors={["#6366F1", "#8B5CF6", "#A855F7"]}
            style={styles.balanceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceContent}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              {isLoadingBalance ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <Text style={styles.balanceAmount}>
                  ${Number(totalBalance).toFixed(2)}
                </Text>
              )}
              
              <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleReceiveMoney}
              >
                <Ionicons
                    name="download-outline"
                    size={20}
                  color="#fff"
                />
                <Text style={styles.actionText}>Receive</Text>
              </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.sectionSubtitle}>Your business metrics</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => handleStatCardPress("revenue")}
              >
                <View style={[styles.statCardAccent, { backgroundColor: "#6366F1" }]} />
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, { backgroundColor: "#EEF2FF" }]}>
                    <Ionicons name="wallet-outline" size={24} color="#6366F1" />
          </View>
        </View>
                <Text style={styles.statValue}>
                  {isLoadingRevenue ? "..." : `$${Number(todayRevenue).toFixed(2)}`}
                </Text>
                <Text style={styles.statLabel}>TODAY'S REVENUE</Text>
                <View style={styles.trendContainer}>
                  <View style={[styles.trendBadge, { backgroundColor: "rgba(34, 197, 94, 0.1)" }]}>
                    <Ionicons name="trending-up" size={12} color="#22C55E" />
                    <Text style={[styles.trendText, { color: "#22C55E" }]}>12.5%</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statCard}
                onPress={() => handleStatCardPress("bookings")}
              >
                <View style={[styles.statCardAccent, { backgroundColor: "#00D4AA" }]} />
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, { backgroundColor: "#ECFDF5" }]}>
                    <Ionicons name="calendar-outline" size={24} color="#00D4AA" />
                  </View>
                </View>
                <Text style={styles.statValue}>
                  {isLoadingBookings ? "..." : newBookings.toString()}
                </Text>
                <Text style={styles.statLabel}>NEW BOOKINGS</Text>
                <View style={styles.trendContainer}>
                  <View style={[styles.trendBadge, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
                    <Ionicons name="trending-down" size={12} color="#EF4444" />
                    <Text style={[styles.trendText, { color: "#EF4444" }]}>5.2%</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => handleStatCardPress("customers")}
              >
                <View style={[styles.statCardAccent, { backgroundColor: "#FF6B9D" }]} />
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, { backgroundColor: "#FEF7FF" }]}>
                    <Ionicons name="people-outline" size={24} color="#FF6B9D" />
                  </View>
                </View>
                <Text style={styles.statValue}>
                  {isLoadingCustomers ? "..." : totalCustomers.toString()}
                </Text>
                <Text style={styles.statLabel}>TOTAL CUSTOMERS</Text>
                <View style={styles.trendContainer}>
                  <View style={[styles.trendBadge, { backgroundColor: "rgba(34, 197, 94, 0.1)" }]}>
                    <Ionicons name="trending-up" size={12} color="#22C55E" />
                    <Text style={[styles.trendText, { color: "#22C55E" }]}>8.1%</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statCard}
                onPress={() => handleStatCardPress("ratings")}
              >
                <View style={[styles.statCardAccent, { backgroundColor: "#F59E0B" }]} />
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, { backgroundColor: "#FEF3C7" }]}>
                    <Ionicons name="star-outline" size={24} color="#F59E0B" />
                  </View>
                </View>
                <Text style={styles.statValue}>
                  {isLoadingRating ? "..." : averageRating.toString()}
                </Text>
                <Text style={styles.statLabel}>AVG RATING</Text>
                <View style={styles.trendContainer}>
                  <View style={[styles.trendBadge, { backgroundColor: "rgba(34, 197, 94, 0.1)" }]}>
                    <Ionicons name="trending-up" size={12} color="#22C55E" />
                    <Text style={[styles.trendText, { color: "#22C55E" }]}>2.3%</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <Text style={styles.chartTitle}>Revenue Overview</Text>
              <Text style={styles.chartSubtitle}>Track your earnings performance</Text>
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
            <ActivityIndicator size="large" color="#6366F1" style={styles.chartLoader} />
          ) : (
          <LineChart
              data={selectedPeriod === "weekly" ? weeklyData : monthlyData}
            width={width - 56}
            height={240}
            chartConfig={{
              ...chartConfig,
              propsForBackgroundLines: {
                strokeDasharray: "",
                strokeWidth: 0.5,
                stroke: "rgba(100, 116, 139, 0.1)",
              },
            }}
            bezier
            style={styles.chart}
          />
          )}
        </View>

        {/* Activity Section */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <View>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Text style={styles.sectionSubtitle}>Latest business updates</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("AllActivities")}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#6366F1" />
            </TouchableOpacity>
          </View>

          {isLoadingActivities ? (
            <ActivityIndicator size="large" color="#6366F1" style={styles.activityLoader} />
          ) : (
            <>
              {recentActivities.pendingBooking && (
                <TouchableOpacity 
                  style={styles.activityCard}
            onPress={() =>
                    navigation.navigate("Bookings", { 
                      initialTab: 'pending',
                      bookingId: recentActivities.pendingBooking.id 
              })
            }
                >
                  <View style={styles.activityContent}>
                    <View style={[styles.activityIconContainer, styles.bookingIcon]}>
                      <Ionicons name="calendar" size={24} color="#6366F1" />
                    </View>
                    <View style={styles.activityDetails}>
                      <Text style={styles.activityTitle}>New Booking Request</Text>
                      <Text style={styles.activityDescription}>
                        {`${recentActivities.pendingBooking.user_name} - ${new Date(recentActivities.pendingBooking.booking_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}`}
                      </Text>
                      <Text style={styles.activityTime}>
                        {getTimeAgo(recentActivities.pendingBooking.created_at)}
                      </Text>
                    </View>
                    <Text style={styles.activityAmount}>
                      ${recentActivities.pendingBooking.total_amount}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {recentActivities.latestPayment && (
                <TouchableOpacity 
                  style={styles.activityCard}
            onPress={() =>
                    navigation.navigate("Bookings", { 
                      initialTab: 'completed',
                      bookingId: recentActivities.latestPayment.id 
              })
            }
                >
                  <View style={styles.activityContent}>
                    <View style={[styles.activityIconContainer, styles.paymentIcon]}>
                      <Ionicons name="wallet" size={24} color="#00D4AA" />
                    </View>
                    <View style={styles.activityDetails}>
                      <Text style={styles.activityTitle}>Payment Received</Text>
                      <Text style={styles.activityDescription}>
                        {`${recentActivities.latestPayment.user_name} - ${new Date(recentActivities.latestPayment.booking_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}`}
                      </Text>
                      <Text style={styles.activityTime}>
                        {getTimeAgo(recentActivities.latestPayment.updated_at)}
                      </Text>
                    </View>
                    <Text style={styles.activityAmount}>
                      ${recentActivities.latestPayment.total_amount}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {recentActivities.latestReview && (
                <TouchableOpacity 
                  style={styles.activityCard}
            onPress={() =>
              navigation.navigate('MainApp', {
                screen: 'Dashboard',
                params: {
                  screen: 'ReviewDetails',
                  params: {
                    reviewId: recentActivities.latestReview.id,
                    title: `Review - ${recentActivities.latestReview.user_name}`,
                  }
                }
              })
            }
                >
                  <View style={styles.activityContent}>
                    <View style={[styles.activityIconContainer, styles.reviewIcon]}>
                      <Ionicons name="star" size={24} color="#F59E0B" />
                    </View>
                    <View style={styles.activityDetails}>
                      <Text style={styles.activityTitle}>New Review</Text>
                      <Text style={styles.activityDescription}>
                        {`${recentActivities.latestReview.user_name} - ${new Date(recentActivities.latestReview.booking_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}`}
                      </Text>
                      <Text style={styles.activityTime}>
                        {getTimeAgo(recentActivities.latestReview.created_at)}
                      </Text>
                    </View>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text style={styles.ratingText}>{recentActivities.latestReview.rating}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {!recentActivities.pendingBooking && 
               !recentActivities.latestPayment && 
               !recentActivities.latestReview && (
                <Text style={styles.noActivitiesText}>No recent activities</Text>
              )}
            </>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  
  // Header Section
  headerSection: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 5,
  },
  greetingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  
  // Balance Card - Redesigned
  balanceCard: {
    marginHorizontal: 24,
    marginTop: -20,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    zIndex: 10,
  },
  balanceGradient: {
    padding: 32,
    position: "relative",
  },
  balanceContent: {
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1,
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  actionButton: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
    minWidth: 90,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionText: {
    color: "#FFFFFF",
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  // Avatar Redesigned
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#F8FAFC',
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  
  // Stats Section - Complete Redesign
  statsSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },
  
  // Modern Stats Grid
  statsGrid: {
    gap: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  statCardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  
  // Chart Section - Modern Design
  chartSection: {
    marginHorizontal: 24,
    marginTop: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  chartTitleContainer: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  chartSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  periodButtonActive: {
    backgroundColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  periodButtonText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  chart: {
    marginTop: 16,
    borderRadius: 16,
    marginLeft: -20,
  },
  chartLoader: {
    marginTop: 20,
    marginBottom: 20,
  },
  
  // Activity Section - Complete Redesign
  activitySection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
  },
  seeAllText: {
    color: "#6366F1",
    fontSize: 14,
    marginRight: 6,
    fontWeight: "600",
  },
  
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  activityContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  activityDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 6,
    lineHeight: 20,
    fontWeight: "500",
  },
  activityTime: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  activityAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F59E0B",
    marginLeft: 6,
  },
  
  // Activity Icons
  bookingIcon: {
    backgroundColor: "#EEF2FF",
  },
  paymentIcon: {
    backgroundColor: "#ECFDF5",
  },
  reviewIcon: {
    backgroundColor: "#FEF3C7",
  },
  
  activityLoader: {
    marginTop: 20,
    marginBottom: 20,
  },
  noActivitiesText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 16,
    marginTop: 20,
    fontWeight: "600",
  },
});

export default DashboardScreen;
