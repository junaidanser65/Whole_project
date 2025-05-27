import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Text, SearchBar, Icon, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const CUSTOMER_FILTERS = [
  { id: 'all', label: 'All Customers' },
  { id: 'active', label: 'Active' },
  { id: 'new', label: 'New' },
  { id: 'vip', label: 'VIP' },
];

const CustomersListScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Mock customers data
  const customers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 234-567-8900',
      totalOrders: 5,
      totalSpent: '$12,500',
      lastOrder: '2 days ago',
      status: 'vip',
    },
    {
      id: '2',
      name: 'Michael Brown',
      email: 'michael.b@email.com',
      phone: '+1 234-567-8901',
      totalOrders: 2,
      totalSpent: '$3,200',
      lastOrder: '1 week ago',
      status: 'active',
    },
    {
      id: '3',
      name: 'Emma Wilson',
      email: 'emma.w@email.com',
      phone: '+1 234-567-8902',
      totalOrders: 1,
      totalSpent: '$800',
      lastOrder: 'Just now',
      status: 'new',
    },
  ];

  const filteredCustomers = customers.filter(customer => {
    const matchesFilter = selectedFilter === 'all' || customer.status === selectedFilter;
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const handleMessageCustomer = (customer) => {
    navigation.navigate('Chat', {
      customerId: customer.id,
      customerName: customer.name,
      customerAvatar: customer.avatar || `https://ui-avatars.com/api/?name=${customer.name[0]}&background=FF6B6B&color=fff`,
    });
  };

  const handleCustomerPress = (customer) => {
    navigation.navigate('CustomerDetails', { customerId: customer.id });
  };

  const CustomerCard = ({ customer }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => handleCustomerPress(customer)}
    >
      <View style={styles.customerHeader}>
        <View style={styles.customerInfo}>
          <View
            style={[styles.avatarContainer, styles[`${customer.status}Avatar`]]}
          >
            <Text style={styles.avatarText}>{customer.name[0]}</Text>
          </View>
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <Text style={styles.customerContact}>{customer.email}</Text>
            <Text style={styles.customerContact}>{customer.phone}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleMessageCustomer(customer)}
          style={styles.messageButton}
        >
          <Icon name="message" type="material" size={20} color="#ff4500" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Orders</Text>
          <Text style={styles.statValue}>{customer.totalOrders}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Spent</Text>
          <Text style={styles.statValue}>{customer.totalSpent}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Last Order</Text>
          <Text style={styles.statValue}>{customer.lastOrder}</Text>
        </View>
      </View>

      <View style={styles.customerFooter}>
        <View style={[styles.statusBadge, styles[`${customer.status}Badge`]]}>
          <Text style={[styles.statusText, styles[`${customer.status}Text`]]}>
            {customer.status.toUpperCase()}
          </Text>
        </View>
        {/* Commenting out view profile button for now
        <TouchableOpacity style={styles.viewProfileButton}>
          <Text style={styles.viewProfileText}>View Profile</Text>
          <Icon name="chevron-right" type="material" size={20} color="#FF6B6B" />
        </TouchableOpacity>
        */}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
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

          <Text style={styles.title}>Customers</Text>
        </LinearGradient>

        {/* Search Bar positioned to overlap both sections */}
        <View style={styles.searchWrapper}>
          <SearchBar
            placeholder="Search customers..."
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
          data={CUSTOMER_FILTERS}
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
        data={filteredCustomers}
        renderItem={({ item }) => <CustomerCard customer={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.customersList}
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
  customersList: {
    padding: 20,
  },
  customerCard: {
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
  customerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  customerInfo: {
    flexDirection: "row",
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  vipAvatar: {
    backgroundColor: "#FF6B6B",
  },
  activeAvatar: {
    backgroundColor: "#4CAF50",
  },
  newAvatar: {
    backgroundColor: "#2196F3",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 4,
  },
  customerContact: {
    fontSize: 14,
    color: "#636E72",
    marginBottom: 2,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F5F6FA",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
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
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#F5F6FA",
    marginHorizontal: 10,
  },
  customerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  vipBadge: {
    backgroundColor: "#FFE9E9",
  },
  activeBadge: {
    backgroundColor: "#E8F5E9",
  },
  newBadge: {
    backgroundColor: "#E3F2FD",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  vipText: {
    color: "#FF6B6B",
  },
  activeText: {
    color: "#4CAF50",
  },
  newText: {
    color: "#2196F3",
  },
  viewProfileText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginRight: 4,
  },
  messageButton: {
    padding: 8,
    backgroundColor: "#ffe0cc",
    borderRadius: 8,
  },
});

export default CustomersListScreen; 