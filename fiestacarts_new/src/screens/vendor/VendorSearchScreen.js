import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, SearchBar, Icon } from "@rneui/themed";
import { colors, spacing, typography } from "../../styles/theme";
import VendorCard from "./components/VendorCard";
import { LinearGradient } from "expo-linear-gradient";
import { getVendors } from "../../api/apiService";

export default function VendorSearchScreen({ navigation, route }) {
  const { category } = route.params || {};

  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchBarAnimation = new Animated.Value(0);

  useEffect(() => {
    Animated.spring(searchBarAnimation, {
      toValue: isSearchFocused ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [isSearchFocused]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await getVendors();
      if (response && response.success) {
        let fetchedVendors = response.vendors;

        // Only include verified vendors
        fetchedVendors = fetchedVendors.filter(
          (v) => v.is_verified === 1 || v.is_verified === true
        );

        // If a category is selected, filter by category
        if (category) {
          fetchedVendors = fetchedVendors.filter(
            (v) => v.category?.toLowerCase() === category.toLowerCase()
          );
        }

        setVendors(fetchedVendors);
        setAllVendors(fetchedVendors);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = allVendors.filter(
        (vendor) =>
          vendor.name?.toLowerCase().includes(query) ||
          vendor.business_name?.toLowerCase().includes(query) ||
          vendor.address?.toLowerCase().includes(query) ||
          vendor.category?.toLowerCase().includes(query)
      );
      setVendors(filtered);
    } else {
      setVendors(allVendors);
    }
  }, [searchQuery, allVendors]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVendors();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark || "#1a237e"]}
      style={styles.headerContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={colors.background} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {category ? category : "Search Vendors"}
          </Text>
          <Text style={styles.subtitle}>
            {vendors.length} {vendors.length === 1 ? "vendor" : "vendors"} found
          </Text>
        </View>
      </View>
      <Animated.View
        style={[
          styles.searchContainer,
          {
            transform: [
              {
                scale: searchBarAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.02],
                }),
              },
            ],
          },
        ]}
      >
        <SearchBar
          placeholder="Search vendors..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          containerStyle={styles.searchBarContainer}
          inputContainerStyle={styles.searchInputContainer}
          inputStyle={styles.searchInput}
          searchIcon={{ color: colors.textLight }}
          clearIcon={{ color: colors.textLight }}
          platform="default"
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
      </Animated.View>
    </LinearGradient>
  );

  const renderVendorCard = ({ item }) => (
    <Animated.View
      style={[
        styles.vendorCardContainer,
        {
          opacity: searchBarAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.8],
          }),
        },
      ]}
    >
      <VendorCard
        vendor={item}
        onPress={() => navigation.navigate("VendorDetails", { vendor: item })}
      />
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.headerWrapper}>{renderHeader()}</View>
      <FlatList
        data={vendors}
        renderItem={renderVendorCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="search-off" size={64} color={colors.textLight} />
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? `No vendors found matching "${searchQuery}"`
                : "No vendors found"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrapper: {
    backgroundColor: "white",
  },
  headerContainer: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h1,
    color: colors.background,
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  searchBarContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  searchInputContainer: {
    backgroundColor: colors.white,
    borderRadius: 15,
    height: 50,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  searchInput: {
    ...typography.body,
    color: colors.text,
    fontSize: 16,
  },
  listContent: {
    padding: spacing.lg,
  },
  vendorCardContainer: {
    marginBottom: spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.md,
    textAlign: "center",
  },
});
