import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Text, Icon, Button, Divider } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart, BarChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

const RevenueDetailsScreen = ({ route, navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedChart, setSelectedChart] = useState("line");
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const revenueData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [500, 800, 600, 1200, 1800, 1500, 2000],
      },
    ],
  };

  const TransactionItem = ({ transaction }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() =>
        navigation.navigate("PaymentDetails", { paymentId: transaction.id })
      }
    >
      <View style={styles.transactionIcon}>
        <Icon
          name={
            transaction.type === "income" ? "arrow-downward" : "arrow-upward"
          }
          type="material"
          size={20}
          color={transaction.type === "income" ? "#4CAF50" : "#F44336"}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{transaction.title}</Text>
        <Text style={styles.transactionDate}>{transaction.date}</Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: transaction.type === "income" ? "#4CAF50" : "#F44336" },
        ]}
      >
        {transaction.type === "income" ? "+" : "-"}${transaction.amount}
      </Text>
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
            <Text style={styles.periodLabel}>This Month</Text>
            <Text style={styles.totalRevenue}>$12,400</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>+12%</Text>
                <Text style={styles.statLabel}>vs Last Month</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>$1,200</Text>
                <Text style={styles.statLabel}>Average Daily</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {/* <Text style={styles.sectionTitle}>Revenue Trend</Text> */}
            <View>
              <Text style={styles.sectionTitle}>Revenue</Text>
              <Text style={styles.sectionTitle}>Overview</Text>
            </View>

            <View style={styles.chartControls}>
              <View style={styles.periodSelector}>
                {["week", "month", "year"].map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      selectedPeriod === period && styles.periodButtonActive,
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <Text
                      style={[
                        styles.periodButtonText,
                        selectedPeriod === period &&
                          styles.periodButtonTextActive,
                      ]}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.chartTypeSelector}>
                <TouchableOpacity
                  style={styles.chartTypeButton}
                  onPress={() =>
                    setSelectedChart(selectedChart === "line" ? "bar" : "line")
                  }
                >
                  <Icon
                    name={selectedChart === "line" ? "show-chart" : "bar-chart"}
                    type="material"
                    size={24}
                    color="#ff4500"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {selectedChart === "line" ? (
            <LineChart
              data={revenueData}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#FFF",
                backgroundGradientFrom: "#FFF",
                backgroundGradientTo: "#FFF",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 85, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <BarChart
              data={revenueData}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#FFF",
                backgroundGradientFrom: "#FFF",
                backgroundGradientTo: "#FFF",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 85, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={styles.chart}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {[
            {
              id: "1",
              type: "income",
              title: "Wedding Reception Booking",
              date: "24 Feb 2024",
              amount: "2,500",
            },
            {
              id: "2",
              type: "expense",
              title: "Equipment Purchase",
              date: "23 Feb 2024",
              amount: "800",
            },
            {
              id: "3",
              type: "income",
              title: "Birthday Party Booking",
              date: "22 Feb 2024",
              amount: "1,200",
            },
          ].map((transaction) => (
            <React.Fragment key={transaction.id}>
              <TransactionItem transaction={transaction} />
              <Divider style={styles.divider} />
            </React.Fragment>
          ))}
          <Button
            title="View All Transactions"
            type="clear"
            titleStyle={styles.viewAllButton}
            // onPress={() => navigation.navigate("Transactions")}
          />
        </View>
      </ScrollView>
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  periodLabel: {
    color: "#FFF",
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 8,
  },
  totalRevenue: {
    color: "#FFF",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 15,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: "#FFF",
    fontSize: 12,
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 15,
  },
  section: {
    padding: 20,
    backgroundColor: "#FFF",
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
  },
  chartControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#F5F6FA",
    borderRadius: 20,
    padding: 4,
    marginRight: 10,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  periodButtonActive: {
    backgroundColor: "#ff4500",
  },
  periodButtonText: {
    fontSize: 14,
    color: "#636E72",
  },
  periodButtonTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  chartTypeButton: {
    padding: 8,
    backgroundColor: "#ffe0cc",
    borderRadius: 8,
  },
  chart: {
    marginTop: 20,
    borderRadius: 16,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  transactionIcon: {
    backgroundColor: "#F5F6FA",
    padding: 10,
    borderRadius: 8,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    color: "#2D3436",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: "#636E72",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    marginVertical: 8,
  },
  viewAllButton: {
    color: "#ff4500",
    fontSize: 14,
    marginTop: 10,
  },
});

export default RevenueDetailsScreen;
