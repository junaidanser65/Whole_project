import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  Text as RNText,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Ionicons } from '@expo/vector-icons';
import { getWeeklyRevenue, getMonthlyRevenue, getTodayRevenue } from "../../services/api";

const { width } = Dimensions.get("window");

const RevenueDetailsScreen = ({ route, navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedChart, setSelectedChart] = useState("line");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [todayRevenue, setTodayRevenue] = useState(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    fetchRevenueData();
    fetchTodayRevenue();
  }, [selectedPeriod]);

  const fetchRevenueData = async () => {
    try {
      if (!refreshing) setLoading(true);
      let response;
      if (selectedPeriod === "week") {
        response = await getWeeklyRevenue();
      } else {
        response = await getMonthlyRevenue();
      }

      if (response.success) {
        setRevenueData({
          labels: response.labels,
          datasets: [{ data: response.data }],
        });
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTodayRevenue = async () => {
    try {
      const response = await getTodayRevenue();
      if (response.success) {
        setTodayRevenue(response.today_revenue);
      }
    } catch (error) {
      console.error("Error fetching today's revenue:", error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchRevenueData();
    fetchTodayRevenue();
  }, [selectedPeriod]);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalRevenue = () => {
    if (!revenueData?.datasets?.[0]?.data || revenueData.datasets[0].data.length === 0) {
      return 0;
    }
    return revenueData.datasets[0].data.reduce((a, b) => (a || 0) + (b || 0), 0);
  };

  const getAverageDailyRevenue = () => {
    const total = getTotalRevenue();
    const divisor = selectedPeriod === "week" ? 7 : 30;
    return total / divisor;
  };

  const getRevenueGrowth = () => {
    if (!revenueData?.datasets?.[0]?.data || revenueData.datasets[0].data.length < 2) {
      return 0;
    }
    const data = revenueData.datasets[0].data;
    const current = data[data.length - 1] || 0;
    const previous = data[data.length - 2] || 0;
    if (previous === 0) return 0;
    const growth = ((current - previous) / previous * 100);
    return isNaN(growth) ? 0 : growth;
  };

  const TransactionCard = ({ transaction, index }) => (
    <TouchableOpacity
      style={[styles.transactionCard, { marginBottom: index === revenueData.labels.length - 1 ? 0 : 12 }]}
      onPress={() =>
        navigation.navigate("PaymentDetails", { paymentId: transaction.id })
      }
      activeOpacity={0.7}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionIconContainer}>
          <Ionicons
            name="trending-up"
            size={20}
            color="#16A34A"
          />
        </View>
        <View style={styles.transactionInfo}>
          <RNText style={styles.transactionTitle}>{transaction.title}</RNText>
          <RNText style={styles.transactionDate}>{transaction.date}</RNText>
        </View>
        <View style={styles.transactionAmountContainer}>
          <RNText style={styles.transactionAmount}>
            +{formatCurrency(transaction.amount)}
          </RNText>
          <View style={styles.growthBadge}>
            <Ionicons name="arrow-up" size={10} color="#16A34A" />
            <RNText style={styles.growthText}>12%</RNText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <RNText style={styles.loadingText}>Loading revenue data...</RNText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
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
                <RNText style={styles.headerTitle}>Revenue Analytics</RNText>
                <RNText style={styles.headerSubtitle}>
                  {selectedPeriod === "week" ? "Weekly" : "Monthly"} performance overview
                </RNText>
              </View>
            </View>

            {/* Total Revenue Display */}
            <View style={styles.revenueDisplayContainer}>
              <RNText style={styles.totalRevenueLabel}>Total Revenue</RNText>
              <RNText style={styles.totalRevenueAmount}>
                {formatCurrency(getTotalRevenue())}
              </RNText>
              <View style={styles.growthIndicator}>
                <Ionicons 
                  name={getRevenueGrowth() >= 0 ? "trending-up" : "trending-down"} 
                  size={16} 
                  color="#FFFFFF" 
                />
                <RNText style={styles.growthPercentage}>
                  {Math.abs(getRevenueGrowth()).toFixed(1)}% vs last {selectedPeriod}
                </RNText>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="today-outline" size={24} color="#6366F1" />
                </View>
                <View style={styles.trendBadge}>
                  <Ionicons name="trending-up" size={12} color="#10B981" />
                  <RNText style={styles.trendText}>+8.2%</RNText>
                </View>
              </View>
              <RNText style={styles.statValue}>
                {formatCurrency(todayRevenue || 0)}
              </RNText>
              <RNText style={styles.statLabel}>Today's Revenue</RNText>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="analytics-outline" size={24} color="#6366F1" />
                </View>
                <View style={styles.trendBadge}>
                  <Ionicons name="trending-up" size={12} color="#10B981" />
                  <RNText style={styles.trendText}>+5.1%</RNText>
                </View>
              </View>
              <RNText style={styles.statValue}>
                {formatCurrency(getAverageDailyRevenue())}
              </RNText>
              <RNText style={styles.statLabel}>Average Daily</RNText>
            </View>
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <RNText style={styles.chartTitle}>Revenue Trends</RNText>
              <RNText style={styles.chartSubtitle}>Track your earnings performance</RNText>
            </View>
            
            <View style={styles.chartControls}>
              <View style={styles.periodSelector}>
                {["week", "month"].map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      selectedPeriod === period && styles.periodButtonActive,
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <RNText
                      style={[
                        styles.periodButtonText,
                        selectedPeriod === period && styles.periodButtonTextActive,
                      ]}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </RNText>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity
                style={styles.chartTypeButton}
                onPress={() =>
                  setSelectedChart(selectedChart === "line" ? "bar" : "line")
                }
              >
                <Ionicons
                  name={selectedChart === "line" ? "bar-chart-outline" : "trending-up"}
                  size={20}
                  color="#6366F1"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.chartContainer}>
            {selectedChart === "line" ? (
              <LineChart
                data={revenueData}
                width={width - 80}
                height={240}
                chartConfig={{
                  backgroundColor: "#FFFFFF",
                  backgroundGradientFrom: "#FFFFFF",
                  backgroundGradientTo: "#FFFFFF",
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
                }}
                bezier
                style={styles.chart}
              />
            ) : (
              <BarChart
                data={revenueData}
                width={width - 80}
                height={240}
                chartConfig={{
                  backgroundColor: "#FFFFFF",
                  backgroundGradientFrom: "#FFFFFF",
                  backgroundGradientTo: "#FFFFFF",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                  labelColor: () => "#64748B",
                  style: { borderRadius: 16 },
                }}
                style={styles.chart}
              />
            )}
          </View>
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <View>
              <RNText style={styles.sectionTitle}>Recent Transactions</RNText>
              <RNText style={styles.sectionSubtitle}>Latest revenue activities</RNText>
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <RNText style={styles.viewAllText}>View All</RNText>
              <Ionicons name="chevron-forward" size={16} color="#6366F1" />
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            {revenueData?.datasets?.[0]?.data && revenueData.datasets[0].data.length > 0 ? (
              [...revenueData.datasets[0].data]
                .map((amount, index) => ({
                  id: index,
                  title: `${selectedPeriod === "week" ? "Daily" : "Monthly"} Revenue`,
                  date: revenueData.labels?.[index] || `${selectedPeriod} ${index + 1}`,
                  amount: amount || 0,
                }))
                .reverse()
                .slice(0, 5)
                .map((transaction, index) => (
                  <TransactionCard 
                    key={transaction.id} 
                    transaction={transaction} 
                    index={index}
                  />
                ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="analytics-outline" size={48} color="#CBD5E1" />
                <RNText style={styles.emptyStateText}>No transactions yet</RNText>
                <RNText style={styles.emptyStateSubtext}>Revenue data will appear here once available</RNText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerGradient: {
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    fontSize: 22,
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
  revenueDisplayContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRevenueLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalRevenueAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 12,
  },
  growthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backdropFilter: 'blur(20px)',
  },
  growthPercentage: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    color: '#FFFFFF',
  },
  
  // Stats Section
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  
  // Chart Section
  chartSection: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  chartTitleContainer: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  chartControls: {
    alignItems: 'flex-end',
    gap: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
    minWidth: 50,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chartTypeButton: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  chartContainer: {
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 16,
  },
  chart: {
    borderRadius: 16,
  },
  
  // Transactions Section
  transactionsSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  viewAllText: {
    color: '#6366F1',
    fontSize: 14,
    marginRight: 6,
    fontWeight: '600',
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  transactionDate: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16A34A',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  growthText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
    marginLeft: 2,
  },
  
  // Loading State
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
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default RevenueDetailsScreen;
