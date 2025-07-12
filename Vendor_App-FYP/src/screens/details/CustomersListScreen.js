import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text as RNText,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getVendorCustomers } from '../../services/api';



const CustomersListScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = new Animated.Value(0);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await getVendorCustomers();
      if (response.success) {
        // Transform the data to include status based on total orders
        const transformedCustomers = response.customers.map(customer => ({
          ...customer,
          status: customer.total_orders > 10 ? 'vip' : 
                 customer.total_orders >= 1 ? 'active' : 'new',
          totalOrders: customer.total_orders,
          totalSpent: `$${customer.total_spent.toFixed(2)}`,
          lastOrder: formatLastOrder(customer.last_order_date)
        }));
        setCustomers(transformedCustomers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatLastOrder = (dateString) => {
    if (!dateString) return 'No orders yet';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchQuery.trim() === '' || 
      (customer.name && customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.phone_number && customer.phone_number.includes(searchQuery));
    return matchesSearch;
  });

  const handleMessageCustomer = (customer) => {
    navigation.navigate('ChatDetails', {
      conversationId: null,
      userId: customer.id,
      userName: customer.name,
      userImage: customer.avatar || null,
    });
  };

  // const handleCustomerPress = (customer) => {
  //   navigation.navigate('CustomerDetails', { customerId: customer.id });
  // };

  const getStatusStyles = (status) => {
    const styles = {
      vip: {
        badge: { backgroundColor: '#FEF3C7' },
        text: { color: '#F59E0B' },
        avatar: { backgroundColor: '#F59E0B' },
      },
      active: {
        badge: { backgroundColor: '#DCFCE7' },
        text: { color: '#16A34A' },
        avatar: { backgroundColor: '#16A34A' },
      },
      new: {
        badge: { backgroundColor: '#DBEAFE' },
        text: { color: '#2563EB' },
        avatar: { backgroundColor: '#2563EB' },
      }
    };
    return styles[status] || styles.new;
  };

  const CustomerCard = ({ customer }) => (
    <TouchableOpacity
      style={styles.customerCard}
      // onPress={() => handleCustomerPress(customer)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.customerSection}>
          <View style={[styles.avatarContainer, getStatusStyles(customer.status).avatar]}>
            <RNText style={styles.avatarText}>{customer.name[0]}</RNText>
          </View>
          <View style={styles.customerInfo}>
            <RNText style={styles.customerName}>{customer.name}</RNText>
            <RNText style={styles.customerEmail}>{customer.email}</RNText>
            <RNText style={styles.customerPhone}>{customer.phone_number}</RNText>
          </View>
        </View>
        
        <View style={[styles.statusBadge, getStatusStyles(customer.status).badge]}>
          <RNText style={[styles.statusText, getStatusStyles(customer.status).text]}>
            {customer.status.toUpperCase()}
          </RNText>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="receipt-outline" size={20} color="#6366F1" />
          </View>
          <View style={styles.statInfo}>
            <RNText style={styles.statValue}>{customer.totalOrders}</RNText>
            <RNText style={styles.statLabel}>Orders</RNText>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="cash-outline" size={20} color="#6366F1" />
          </View>
          <View style={styles.statInfo}>
            <RNText style={styles.statValue}>{customer.totalSpent}</RNText>
            <RNText style={styles.statLabel}>Spent</RNText>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="time-outline" size={20} color="#6366F1" />
          </View>
          <View style={styles.statInfo}>
            <RNText style={styles.statValue} numberOfLines={1}>{customer.lastOrder}</RNText>
            <RNText style={styles.statLabel}>Last Order</RNText>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.chatButton}
        onPress={() => handleMessageCustomer(customer)}
      >
        <Ionicons name="chatbubble-outline" size={20} color="#6366F1" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchCustomers();
  }, []);

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="people-outline" size={60} color="#94A3B8" />
      </View>
      <RNText style={styles.emptyTitle}>No customers found</RNText>
      <RNText style={styles.emptySubtitle}>
        You don't have any customers yet
      </RNText>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <RNText style={styles.loadingText}>Loading customers...</RNText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
              <RNText style={styles.headerTitle}>Customers</RNText>
              <RNText style={styles.headerSubtitle}>
                Manage your customer relationships
              </RNText>
            </View>
            
            <View style={styles.headerStats}>
              <RNText style={styles.statsNumber}>{filteredCustomers.length}</RNText>
              <RNText style={styles.statsLabel}>Total</RNText>
            </View>
          </View>

          {/* Modern Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search customers..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>



      {/* Customers List */}
      <FlatList
        data={filteredCustomers}
        renderItem={({ item }) => <CustomerCard customer={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.customersList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={EmptyListComponent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerGradient: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    fontSize: 24,
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
  headerStats: {
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchSection: {
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  customersList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  customerEmail: {
    fontSize: 14,
    color: '#6366F1',
    marginBottom: 2,
    fontWeight: '500',
  },
  customerPhone: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statInfo: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  chatButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: '#FFF',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default CustomersListScreen; 