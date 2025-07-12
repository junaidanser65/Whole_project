import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Text as RNText,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { getAllMenus, deleteMenu, updateMenu } from '../../services/menuService';

const MENU_FILTERS = [
  { id: 'all', label: 'All Items', icon: 'restaurant' },
  { id: 'appetizers', label: 'Appetizers', icon: 'leaf' },
  { id: 'main', label: 'Main Course', icon: 'pizza' },
  { id: 'desserts', label: 'Desserts', icon: 'ice-cream' },
  { id: 'drinks', label: 'Drinks', icon: 'wine' },
];

const MenuScreen = ({ navigation, route }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch menu items when component mounts or when returning to screen
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      console.log('Fetching menu items...');
      const response = await getAllMenus();
      console.log('Menu items response:', response);
      
      if (response.success && response.menu_items) {
        setMenuItems(response.menu_items);
      } else {
        setError('Failed to load menu items');
      }
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError(err.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    
    // Add listener for when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMenuItems();
    });
    
    // Clean up the listener when component unmounts
    return unsubscribe;
  }, [navigation]);
  
  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchMenuItems();
  };
  
  // Handle newly added items
  useEffect(() => {
    if (route.params?.newItem) {
      // Refresh the menu items list instead of manually adding
      fetchMenuItems();
      navigation.setParams({ newItem: null });
    }
  }, [route.params?.newItem]);

  const [isExpanded, setIsExpanded] = useState(false);
  const buttonWidth = useSharedValue(56);
  const textOpacity = useSharedValue(0);

  const retractFAB = () => {
    setIsExpanded(false);
    buttonWidth.value = withSpring(56, {
      damping: 15,
      stiffness: 300,
      mass: 0.5,
      velocity: 20
    });
    textOpacity.value = withTiming(0, { duration: 50 });
  };

  const handleFABPress = () => {
    if (isExpanded) {
      navigation.navigate('AddMenuItem');
      retractFAB();
    } else {
      setIsExpanded(true);
      buttonWidth.value = withSpring(160, {
        damping: 15,
        stiffness: 300,
        mass: 0.5,
        velocity: 20
      });
      textOpacity.value = withTiming(1, { duration: 100 });
    }
  };

  const handleScreenPress = () => {
    if (isExpanded) {
      retractFAB();
    }
  };

  const animatedStyles = useAnimatedStyle(() => ({
    width: buttonWidth.value,
  }));

  const textStyles = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    display: textOpacity.value === 0 ? 'none' : 'flex',
  }));

  // Toggle item availability
  const toggleItemAvailability = (itemId) => {
    try {
      // Find the item
      const item = menuItems.find(item => item.id === itemId);
      if (!item) return;
      
      // Create updated item with toggled availability
      const updatedItem = {
        ...item,
        is_available: !item.is_available
      };
      
      // Update in the database
      updateMenu(itemId, updatedItem)
        .then(response => {
          if (response.success) {
            // Update local state
            setMenuItems(prevItems =>
              prevItems.map(item =>
                item.id === itemId
                  ? { ...item, is_available: !item.is_available }
                  : item
              )
            );
            Alert.alert('Success', `Item ${item.is_available ? 'hidden' : 'shown'} successfully`);
          } else {
            throw new Error(response.message || 'Failed to update item availability');
          }
        })
        .catch(error => {
          console.error('Error toggling item availability:', error);
          Alert.alert('Error', error.message || 'Failed to update item availability');
        });
    } catch (error) {
      console.error('Error in toggleItemAvailability:', error);
      Alert.alert('Error', 'Something went wrong when updating item availability');
    }
  };

  const handleDeleteMenuItem = (itemId) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this menu item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting menu item with ID:', itemId);
              const response = await deleteMenu(itemId);
              console.log('Delete response:', response);
              
              if (response.success) {
                // Refresh the menu items list
                fetchMenuItems();
                Alert.alert('Success', 'Menu item deleted successfully');
              } else {
                throw new Error(response.message || 'Failed to delete menu item');
              }
            } catch (error) {
              console.error('Error deleting menu item:', error);
              Alert.alert('Error', error.message || 'Failed to delete menu item');
            }
          }
        },
      ]
    );
  };

  const filteredMenuItems = menuItems.filter((item) => {
    // Filter by category
    const categoryMatch =
      selectedFilter === 'all' || item.category === selectedFilter;

    // Filter by search query
    const searchMatch = !searchQuery ? true : (
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return categoryMatch && searchMatch;
  });

  const renderMenuItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.menuItemCard}
        onPress={() => navigation.navigate('MenuItemDetails', { itemId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemImageContainer}>
          <Image
            source={{ uri: item.image || 'https://via.placeholder.com/150' }}
            style={styles.menuItemImage}
            resizeMode="cover"
          />
          {!item.is_available && (
            <View style={styles.inactiveOverlay}>
              <Ionicons name="eye-off" size={24} color="#FFFFFF" />
              <RNText style={styles.inactiveText}>Unavailable</RNText>
            </View>
          )}
          <View style={styles.availabilityBadge}>
            <View style={[
              styles.availabilityIndicator,
              item.is_available ? styles.availableIndicator : styles.unavailableIndicator
            ]} />
          </View>
        </View>
        
        <View style={styles.menuItemContent}>
          <View style={styles.menuItemHeader}>
            <RNText style={styles.menuItemName} numberOfLines={1}>{item.name}</RNText>
            <View style={styles.priceContainer}>
              <RNText style={styles.menuItemPrice}>${parseFloat(item.price).toFixed(2)}</RNText>
            </View>
          </View>
          
          <View style={styles.categoryContainer}>
            <Ionicons 
              name={MENU_FILTERS.find(f => f.id === item.category)?.icon || 'restaurant'} 
              size={14} 
              color="#6366F1" 
            />
            <RNText style={styles.menuItemCategory}>
              {item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Other'}
            </RNText>
          </View>
          
          <RNText numberOfLines={2} style={styles.menuItemDescription}>
            {item.description || 'No description available'}
          </RNText>
          
          <View style={styles.menuItemActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('EditMenuItem', { itemId: item.id })}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={16} color="#6366F1" />
              <RNText style={styles.actionText}>Edit</RNText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => toggleItemAvailability(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={item.is_available ? "eye-outline" : "eye-off-outline"} 
                size={16} 
                color={item.is_available ? "#10B981" : "#F59E0B"} 
              />
              <RNText style={[
                styles.actionText,
                { color: item.is_available ? "#10B981" : "#F59E0B" }
              ]}>
                {item.is_available ? "Hide" : "Show"}
              </RNText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteMenuItem(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <RNText style={[styles.actionText, { color: '#EF4444' }]}>
                Delete
              </RNText>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TouchableOpacity 
        activeOpacity={1} 
        style={styles.screenPressable}
        onPress={handleScreenPress}
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
                <RNText style={styles.headerTitle}>Menu Management</RNText>
                <RNText style={styles.headerSubtitle}>
                  {menuItems.length} items • {filteredMenuItems.length} visible
                </RNText>
              </View>
              
              <TouchableOpacity 
                style={styles.statsButton}
                onPress={() => navigation.navigate('AddMenuItem')}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Modern Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search menu items..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          >
            {MENU_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.id && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={filter.icon} 
                  size={16} 
                  color={selectedFilter === filter.id ? "#FFFFFF" : "#6366F1"} 
                />
                <RNText
                  style={[
                    styles.filterButtonText,
                    selectedFilter === filter.id && styles.filterButtonTextActive,
                  ]}
                >
                  {filter.label}
                </RNText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <RNText style={styles.loadingText}>Loading your menu...</RNText>
          </View>
        ) : error && menuItems.length === 0 ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
            <RNText style={styles.errorTitle}>Something went wrong</RNText>
            <RNText style={styles.errorText}>{error}</RNText>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchMenuItems}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                style={styles.retryButtonGradient}
              >
                <Ionicons name="refresh" size={16} color="#FFFFFF" />
                <RNText style={styles.retryButtonText}>Try Again</RNText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : filteredMenuItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color="#CBD5E1" />
            <RNText style={styles.emptyTitle}>
              {searchQuery ? 'No items found' : 'No menu items yet'}
            </RNText>
            <RNText style={styles.emptyText}>
              {searchQuery 
                ? `No items match "${searchQuery}". Try a different search term.`
                : 'Start building your menu by adding your first delicious item using the + button!'
              }
            </RNText>
          </View>
        ) : (
          <FlatList
            data={filteredMenuItems}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.menuList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#6366F1']}
                tintColor="#6366F1"
              />
            }
          />
        )}
      </TouchableOpacity>

      {/* Modern Floating Action Button */}
      <Animated.View style={[styles.fab, animatedStyles]}>
        <TouchableOpacity
          onPress={handleFABPress}
          activeOpacity={0.8}
          style={styles.fabTouchable}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.fabContent}>
              <Ionicons
                name="add"
                color="#FFFFFF"
                size={24}
              />
              <Animated.Text style={[styles.fabText, textStyles]}>
                Add Menu Item
              </Animated.Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  screenPressable: {
    flex: 1,
  },
  
  // Header Styles
  headerContainer: {
    marginBottom: 20,
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
  statsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Search Styles
  searchContainer: {
    marginTop: 8,
  },
  searchInputContainer: {
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
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  
  // Filter Styles
  filterSection: {
    marginBottom: 8,
  },
  filterList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#6366F1',
  },
  filterButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  
  // Content States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    borderRadius: 12,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  
  // Menu List
  menuList: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100, // Space for FAB
  },
  
  // Menu Item Card
  menuItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    marginHorizontal: 4,
    overflow: 'hidden',
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    flexDirection: 'row',
  },
  menuItemImageContainer: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  menuItemImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  inactiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  inactiveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  availabilityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  availabilityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availableIndicator: {
    backgroundColor: '#10B981',
  },
  unavailableIndicator: {
    backgroundColor: '#F59E0B',
  },
  
  // Menu Item Content
  menuItemContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  menuItemName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 12,
    letterSpacing: -0.2,
  },
  priceContainer: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuItemCategory: {
    fontSize: 12,
    color: '#6366F1',
    marginLeft: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  
  // Actions
  menuItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
    color: '#6366F1',
  },
  
  // Floating Action Button
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    height: 56,
    minWidth: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 1000,
  },
  fabTouchable: {
    flex: 1,
    width: '100%',
  },
  fabGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fabContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default MenuScreen;