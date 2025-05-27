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
} from 'react-native';
import { SearchBar, Icon } from 'react-native-elements';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { getAllMenus, deleteMenu, updateMenu } from '../../services/menuService';

const MENU_FILTERS = [
  { id: 'all', label: 'All Items' },
  { id: 'appetizers', label: 'Appetizers' },
  { id: 'main', label: 'Main Course' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'drinks', label: 'Drinks' },
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
      >
        <View style={styles.menuItemImageContainer}>
          <Image
            source={{ uri: item.image || 'https://via.placeholder.com/150' }}
            style={styles.menuItemImage}
            resizeMode="cover"
          />
          {!item.is_available && (
            <View style={styles.inactiveOverlay}>
              <Text style={styles.inactiveText}>Unavailable</Text>
            </View>
          )}
        </View>
        <View style={styles.menuItemContent}>
          <View style={styles.menuItemHeader}>
            <Text style={styles.menuItemName}>{item.name}</Text>
            <Text style={styles.menuItemPrice}>${parseFloat(item.price).toFixed(2)}</Text>
          </View>
          <Text style={styles.menuItemCategory}>
            {item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Other'}
          </Text>
          <Text numberOfLines={2} style={styles.menuItemDescription}>
            {item.description || 'No description available'}
          </Text>
          <View style={styles.menuItemActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('EditMenuItem', { itemId: item.id })}
            >
              <Icon name="edit" size={18} color="#555" />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteMenuItem(item.id)}
            >
              <Icon
                name="delete"
                size={18}
                color="#FF4500"
              />
              <Text style={[styles.actionText, {color: '#FF4500'}]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        activeOpacity={1} 
        style={styles.screenPressable}
        onPress={handleScreenPress}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={['#ff4500', '#cc3700']}
            style={styles.headerGradient}
          >
            <Text style={styles.title}>Menu</Text>
            <SearchBar
              placeholder="Search menu items..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              containerStyle={styles.searchContainer}
              inputContainerStyle={styles.searchInputContainer}
              inputStyle={styles.searchInput}
              lightTheme
              round
            />
          </LinearGradient>
        </View>

        <View style={styles.filterContainer}>
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
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === filter.id && styles.filterButtonTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4500" />
          <Text style={styles.loadingText}>Loading menu items...</Text>
        </View>
      ) : error && menuItems.length === 0 ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" type="material" size={60} color="#FF4500" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchMenuItems}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredMenuItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="restaurant-menu" type="material" size={60} color="#CCCCCC" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No items match your search' : 'No menu items found'}
          </Text>
          <TouchableOpacity 
            style={styles.addFirstButton}
            onPress={() => navigation.navigate('AddMenuItem')}
          >
            <Text style={styles.addFirstButtonText}>Add Your First Item</Text>
          </TouchableOpacity>
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
              colors={['#FF4500']}
            />
          }
        />
      )}
      </TouchableOpacity>

      <Animated.View style={[styles.fab, animatedStyles]}>
        <TouchableOpacity
          onPress={handleFABPress}
          activeOpacity={0.8}
          style={styles.fabTouchable}
        >
          <LinearGradient
            colors={['#ff4500', '#cc3700']}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.fabContent}>
              <Icon
                name="add"
                type="material"
                color="#FFF"
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
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  addFirstButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
  },
  addFirstButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    paddingHorizontal: 0,
  },
  searchInputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  menuList: {
    padding: 16,
    paddingBottom: 80, // Add padding to avoid FAB overlap
  },
  menuItemCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
  },
  menuItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemContent: {
    padding: 15,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 8,
    lineHeight: 20,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4500',
  },
  menuItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#ffe0cc',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    height: 56,
    minWidth: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#ff4500',
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
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6FA',
  },
  filterList: {
    paddingHorizontal: 15,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F6FA',
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#ff4500',
  },
  filterButtonText: {
    color: '#636E72',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  menuItemImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  screenPressable: {
    flex: 1,
  },
  menuItemImageContainer: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  inactiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  menuItemCategory: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
});

export default MenuScreen;