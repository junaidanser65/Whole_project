import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, Dimensions, ScrollView, TouchableOpacity, Animated, SafeAreaView, FlatList, TextInput, PermissionsAndroid, Platform, Alert, ActivityIndicator } from 'react-native';
import { Button, SearchBar, Card, Icon } from '@rneui/themed';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import VendorCard from '../vendor/components/VendorCard';
import { VENDOR_IMAGES } from '../../constants/images';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import Slider from '@react-native-community/slider';
import { useFocusEffect } from '@react-navigation/native';
import { getVendors } from '../../api/apiService';
import { websocketService } from '../../services/websocketService';

// Categories data
const MOCK_CATEGORIES = [
  { id: '1', name: 'Catering', icon: 'restaurant' },
  { id: '2', name: 'Venues', icon: 'location-on' },
  { id: '3', name: 'Photography', icon: 'camera-alt' },
  { id: '4', name: 'Music', icon: 'music-note' },
  { id: '5', name: 'Decoration', icon: 'celebration' },
];

// Special offers data
const SPECIAL_OFFERS = [
  {
    id: '1',
    title: '20% Off First Booking',
    description: 'Get 20% off on your first booking with any vendor',
    code: 'FIRST20',
    expiryDate: '2024-04-30',
  },
  {
    id: '2',
    title: 'Free Decoration',
    description: 'Book a venue and get free decoration services',
    code: 'FREEDECOR',
    expiryDate: '2024-05-15',
  },
];

// Add this helper function at the top of the file, after imports
const getCategoryIcon = (category) => {
  const categoryMap = {
    'Catering': 'restaurant',
    'Venues': 'location-on',
    'Photography': 'camera-alt',
    'Music': 'music-note',
    'Decoration': 'celebration',
  };
  return categoryMap[category] || 'store';
};

const SearchHeader = ({ searchQuery, setSearchQuery, isSearchActive, setIsSearchActive }) => {
  const searchInputRef = useRef(null);

  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);
  }, [setSearchQuery]);

  const handleSearchClose = useCallback(() => {
    setIsSearchActive(false);
    setSearchQuery('');
    searchInputRef.current?.blur();
  }, [setIsSearchActive, setSearchQuery]);

  const handleSearchPress = useCallback(() => {
    setIsSearchActive(true);
    searchInputRef.current?.focus();
  }, [setIsSearchActive]);

  return (
    <View style={styles.searchHeader}>
      <Animated.View 
        style={[
          styles.searchContainer,
          isSearchActive ? {
            flex: 1,
            marginRight: spacing.sm,
          } : {
            width: 45,
          }
        ]}
      >
        {isSearchActive ? (
          <>
            <Icon name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search vendors..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholderTextColor={colors.textLight}
              autoFocus={true}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              blurOnSubmit={false}
              onFocus={() => setIsSearchActive(true)}
              onBlur={() => {
                if (!searchQuery) {
                  setIsSearchActive(false);
                }
              }}
            />
            {searchQuery ? (
              <TouchableOpacity 
                style={styles.searchCloseButton}
                onPress={handleSearchClose}
              >
                <Icon name="close" size={20} color={colors.textLight} />
              </TouchableOpacity>
            ) : null}
          </>
        ) : (
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearchPress}
          >
            <Icon name="search" size={24} color={colors.background} />
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

// Custom marker component
const CustomMarker = ({ vendor, onPress }) => {
  return (
    <View style={styles.markerContainer}>
      <View style={styles.marker}>
        <Icon 
          name={getCategoryIcon(vendor.category)} 
          size={16} 
          color={colors.white} 
          type="material"
        />
      </View>
      <Text style={styles.markerLabel} numberOfLines={1}>
        {vendor.name}
      </Text>
    </View>
  );
};

export default function MainDashboardScreen({ navigation }) {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef(null);
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [region, setRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [vendorsWithLocations, setVendorsWithLocations] = useState([]);
  const [nearbyVendors, setNearbyVendors] = useState([]);
  const [radiusKm, setRadiusKm] = useState(10); // Default 10km
  const [isMapLoading, setIsMapLoading] = useState(true);

  const scrollViewRef = useRef(null);
  const [mapRegion, setMapRegion] = useState(null);
  const mapRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const updateTimeoutRef = useRef(null);
  const [vendorLocations, setVendorLocations] = useState({});

  // Initialize markers ref
  const markersRef = useRef({});

  // Add mapKey state for forcing re-renders
  const [mapKey, setMapKey] = useState(0);

  // Fetch vendors from API
  const fetchVendors = async () => {
    try {
      setLoadingVendors(true);
      console.log('Fetching vendors...');
      const response = await getVendors();
      console.log('Vendors API Response:', response);
      if (response && response.success) {
        console.log('Setting vendors:', response.vendors);
        setVendors(response.vendors);
        
        // Transform vendors data for map display
        const transformedVendors = response.vendors.map(vendor => {
          if (vendor.locations && vendor.locations.length > 0) {
            const location = vendor.locations[0];
            return {
              ...vendor,
              latitude: parseFloat(location.latitude),
              longitude: parseFloat(location.longitude),
              location: {
                latitude: parseFloat(location.latitude),
                longitude: parseFloat(location.longitude)
              }
            };
          }
          return vendor;
        }).filter(vendor => vendor.latitude && vendor.longitude);
        
        console.log('Transformed vendors with locations:', transformedVendors);
        setVendorsWithLocations(transformedVendors);
      } else {
        console.log('API returned success: false');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      Alert.alert('Error', 'Failed to fetch vendors');
    } finally {
      setLoadingVendors(false);
    }
  };

  // Use useFocusEffect to refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchVendors();
      getUserLocation();
    }, [])
  );

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to see nearby vendors');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      setUserLocation(userCoords);
      setRegion(userCoords);
      setIsMapLoading(false);

      // Update nearby vendors based on user location
      if (vendors.length > 0) {
        const vendorsInRange = vendors.filter(vendor => {
          if (!vendor.locations || vendor.locations.length === 0) return false;
          const vendorLocation = vendor.locations[0]; // Use first location
          const distance = getDistance(
            { latitude: userCoords.latitude, longitude: userCoords.longitude },
            { latitude: vendorLocation.latitude, longitude: vendorLocation.longitude }
          );
          return distance <= radiusKm * 1000;
        });
        setNearbyVendors(vendorsInRange);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your location');
      setIsMapLoading(false);
    }
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const filteredVendors = useMemo(() => {
    if (!searchQuery) return vendors;
    
    const query = searchQuery.toLowerCase().trim();
    return vendors.filter(vendor => {
      const nameMatch = vendor.name?.toLowerCase().includes(query);
      const businessNameMatch = vendor.business_name?.toLowerCase().includes(query);
      const addressMatch = vendor.address?.toLowerCase().includes(query);
      const categoryMatch = vendor.category?.toLowerCase().includes(query);
      
      return nameMatch || businessNameMatch || addressMatch || categoryMatch;
    });
  }, [vendors, searchQuery]);

  const handleVendorPress = (vendor) => {
    navigation.navigate('VendorDetails', { vendor });
  };

  const animateSearch = (show) => {
    Animated.parallel([
      Animated.timing(searchWidthAnim, {
        toValue: show ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(searchOpacityAnim, {
        toValue: show ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      if (show) {
        searchInputRef.current?.focus();
      }
    });
  };

  // Filter vendors based on radius and search
  const filterVendors = () => {
    if (!userLocation || !vendorsWithLocations.length) return;

    const filtered = vendorsWithLocations.filter(vendor => {
      // Distance filter
      const distance = getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: vendor.latitude, longitude: vendor.longitude }
      );
      const isInRadius = distance <= radiusKm * 1000;

      // Search filter
      const matchesSearch = !searchQuery || 
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.category?.toLowerCase().includes(searchQuery.toLowerCase());

      return isInRadius && matchesSearch;
    });

    setNearbyVendors(filtered);
    setLastUpdateTime(new Date().toLocaleTimeString());
  };

  // Handle radius change
  const handleRadiusChange = (newRadius) => {
    console.log('\n=== RADIUS CHANGE ===');
    console.log('New radius:', newRadius, 'km');
    setRadiusKm(newRadius);
    filterVendors();
  };

  // Handle region change with debounce
  const handleRegionChange = useCallback((region) => {
    setMapRegion(region);
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      filterVendors();
    }, 300);
  }, [userLocation, vendorsWithLocations, radiusKm, searchQuery]);

  // Add effect to handle radius changes
  useEffect(() => {
    if (userLocation && vendorsWithLocations.length > 0) {
      filterVendors();
    }
  }, [radiusKm, userLocation, vendorsWithLocations]);

  // Handle WebSocket location updates
  const handleLocationUpdate = (data) => {
    console.log('Received location update:', data);
    
    if (!data.vendorId || !data.location) {
      console.warn('Invalid location update data:', data);
      return;
    }

    const updatedLocation = {
      latitude: parseFloat(data.location.latitude),
      longitude: parseFloat(data.location.longitude),
      timestamp: data.timestamp || new Date().toISOString()
    };

    console.log('Processed location update:', {
      vendorId: data.vendorId,
      location: updatedLocation
    });

    // Update vendorsWithLocations
    setVendorsWithLocations(prevVendors => {
      const updatedVendors = prevVendors.map(vendor => {
        // Convert both IDs to strings for comparison
        if (String(vendor.id) === String(data.vendorId)) {
          console.log('Updating vendor location:', {
            vendorId: vendor.id,
            oldLocation: vendor.location,
            newLocation: updatedLocation
          });
          return {
            ...vendor,
            latitude: updatedLocation.latitude,
            longitude: updatedLocation.longitude,
            location: updatedLocation
          };
        }
        return vendor;
      });
      return updatedVendors;
    });

    // Update nearbyVendors
    setNearbyVendors(prevVendors => {
      const updatedVendors = prevVendors.map(vendor => {
        // Convert both IDs to strings for comparison
        if (String(vendor.id) === String(data.vendorId)) {
          return {
            ...vendor,
            latitude: updatedLocation.latitude,
            longitude: updatedLocation.longitude,
            location: updatedLocation
          };
        }
        return vendor;
      });
      return updatedVendors;
    });

    // Update map markers smoothly
    if (mapRef.current) {
      const marker = markersRef.current[data.vendorId];
      if (marker) {
        // Animate the marker to the new position
        marker.animateMarkerToCoordinate({
          latitude: updatedLocation.latitude,
          longitude: updatedLocation.longitude
        }, 500); // 500ms animation duration
      }
    }
  };

  // Connect to WebSocket when component mounts
  useEffect(() => {
    console.log('[MainDashboard] Setting up WebSocket connection');
    const unsubscribe = websocketService.subscribe('location_update', handleLocationUpdate);
    
    // Register with WebSocket server
    websocketService.send({
      type: 'register',
      vendorId: 'customer' // or any identifier for the customer app
    });

    return () => {
      console.log('[MainDashboard] Cleaning up WebSocket connection');
      unsubscribe();
    };
  }, [handleLocationUpdate]);

  // Add a separate effect for handling map region changes
  useEffect(() => {
    if (mapRegion) {
      console.log('[MainDashboard] Map region changed, updating nearby vendors');
      filterVendors();
    }
  }, [mapRegion, radiusKm]);

  const renderMap = () => (
    <View style={styles.section}>
      <View style={styles.mapHeader}>
        <Text style={styles.sectionTitle}>Nearby Vendors</Text>
        <TouchableOpacity 
          style={styles.fullMapButton}
          onPress={() => navigation.navigate('FullMap', { 
            userLocation,
            nearbyVendors: vendorsWithLocations
          })}
        >
          <Text style={styles.seeAllText}>View Full Map</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.radiusControl}>
        <View style={styles.radiusHeader}>
          <Text style={styles.radiusLabel}>Search Radius: {radiusKm}km</Text>
          {lastUpdateTime && (
            <Text style={styles.lastUpdateText}>Last update: {lastUpdateTime}</Text>
          )}
        </View>
        <Slider
          style={styles.radiusSlider}
          minimumValue={1}
          maximumValue={50}
          step={1}
          value={radiusKm}
          onValueChange={handleRadiusChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
      </View>

      <View style={styles.mapContainer}>
        {isMapLoading && (
          <View style={styles.mapLoadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
        
        {region && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={[
              styles.map,
              isMapLoading && styles.hiddenMap
            ]}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onMapReady={() => {
              console.log('Map ready');
              setIsMapLoading(false);
              if (region) {
                filterVendors();
              }
            }}
            onRegionChange={handleRegionChange}
          >
            {userLocation && (
              <Circle
                center={userLocation}
                radius={radiusKm * 1000}
                fillColor="rgba(255, 99, 71, 0.1)"
                strokeColor="rgba(255, 99, 71, 0.3)"
                strokeWidth={1}
              />
            )}
            {nearbyVendors.map((vendor) => (
              <Marker
                key={vendor.id}
                ref={ref => {
                  if (ref) {
                    markersRef.current[vendor.id] = ref;
                  }
                }}
                coordinate={{
                  latitude: vendor.latitude,
                  longitude: vendor.longitude,
                }}
                title={vendor.name}
                description={`${vendor.category || 'Vendor'} • ${vendor.rating || 0}⭐`}
                onPress={() => navigation.navigate('VendorDetails', { vendor })}
              >
                <CustomMarker 
                  vendor={vendor} 
                  onPress={() => navigation.navigate('VendorDetails', { vendor })}
                />
              </Marker>
            ))}
          </MapView>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeText}>
                {loading ? 'Loading...' : 'Welcome back,'}
              </Text>
              <Text style={styles.nameText}>
                {loading ? '' : user?.name ? `${user.name.split(' ')[0]}!` : 'Guest!'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Icon name="notifications" size={24} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>

        <SearchHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearchActive={isSearchActive}
          setIsSearchActive={setIsSearchActive}
        />

        {loadingVendors ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading vendors...</Text>
          </View>
        ) : (
          <>
            {searchQuery ? (
              <>
                {filteredVendors.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Icon name="search-off" size={64} color={colors.textLight} />
                    <Text style={styles.emptyStateText}>No vendors found matching "{searchQuery}"</Text>
                  </View>
                ) : (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Search Results</Text>
                      <Text style={styles.resultCount}>{filteredVendors.length} vendors found</Text>
                    </View>
                    <View style={styles.vendorList}>
                      {filteredVendors.map((vendor) => (
                        <VendorCard
                          key={vendor.id}
                          vendor={vendor}
                          onPress={() => handleVendorPress(vendor)}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </>
            ) : (
              <>
                {/* Categories */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                  </View>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                  >
                    {MOCK_CATEGORIES.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={styles.categoryItem}
                        onPress={() => {
                          const filteredVendors = vendors.filter(vendor => 
                            vendor.business_name?.toLowerCase().includes(category.name.toLowerCase()) ||
                            vendor.name?.toLowerCase().includes(category.name.toLowerCase())
                          );
                          navigation.navigate('VendorSearch', {
                            vendors: filteredVendors,
                            category: category.name
                          });
                        }}
                      >
                        <View style={styles.categoryIconContainer}>
                          <Icon name={category.icon} size={32} color={colors.primary} />
                        </View>
                        <Text style={styles.categoryName} numberOfLines={1}>{category.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Special Offers */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Special Offers</Text>
                    <TouchableOpacity>
                      <Text style={styles.seeAllText}>View All</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.offersContainer}
                  >
                    {SPECIAL_OFFERS.map((offer) => (
                      <Card key={offer.id} containerStyle={styles.offerCard}>
                        <View style={styles.offerContent}>
                          <View style={styles.offerIconContainer}>
                            <Icon name="local-offer" color={colors.primary} size={24} />
                          </View>
                          <View style={styles.offerInfo}>
                            <Text style={styles.offerTitle}>{offer.title}</Text>
                            <Text style={styles.offerDescription}>{offer.description}</Text>
                            <View style={styles.offerMeta}>
                              <View style={styles.offerCodeContainer}>
                                <Text style={styles.offerCode}>{offer.code}</Text>
                              </View>
                              <Text style={styles.offerExpiry}>Expires: {offer.expiryDate}</Text>
                            </View>
                          </View>
                        </View>
                      </Card>
                    ))}
                  </ScrollView>
                </View>

                {/* Featured Vendors */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Featured Vendors</Text>
                    <TouchableOpacity>
                      <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.featuredContainer}
                  >
                    {vendors.slice(0, 3).map((vendor) => (
                      <VendorCard
                        key={vendor.id}
                        vendor={vendor}
                        onPress={() => handleVendorPress(vendor)}
                        featured={true}
                        style={styles.featuredVendorCard}
                      />
                    ))}
                  </ScrollView>
                </View>

                {/* All Vendors Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>All Vendors</Text>
                    <TouchableOpacity>
                      <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={vendors}
                    horizontal={false}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    contentContainerStyle={styles.vendorList}
                    renderItem={({ item }) => (
                      <VendorCard
                        vendor={item}
                        onPress={() => handleVendorPress(item)}
                      />
                    )}
                    keyExtractor={item => item.id.toString()}
                  />
                </View>

                {renderMap()}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl + 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    padding: spacing.lg,
  },
  welcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    ...typography.body,
    color: colors.background,
    opacity: 0.8,
  },
  nameText: {
    ...typography.h1,
    color: colors.background,
    marginTop: spacing.xs,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: -25,
    marginBottom: spacing.md,
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 25,
    height: 45,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    height: '100%',
  },
  searchIcon: {
    marginLeft: spacing.sm,
  },
  searchButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  searchCloseButton: {
    padding: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
    backgroundColor: colors.background,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
    width: 80,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryName: {
    ...typography.caption,
    textAlign: 'center',
    width: '100%',
  },
  vendorCard: {
    padding: 0,
    margin: 0,
    marginBottom: spacing.md,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  vendorImage: {
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  vendorInfo: {
    padding: spacing.md,
  },
  vendorName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  vendorCategory: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  vendorDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...typography.body,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  reviews: {
    ...typography.caption,
    color: colors.textLight,
  },
  priceRange: {
    ...typography.body,
    color: colors.primary,
  },
  mapContainer: {
    height: 300,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  selectedCategory: {
    transform: [{ scale: 1.05 }],
  },
  selectedCategoryIcon: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectedCategoryText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  searchResults: {
    padding: spacing.md,
    flex: 1,
  },
  searchResultsTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  seeAllText: {
    ...typography.body,
    color: colors.primary,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  vendorList: {
    paddingHorizontal: spacing.lg,
  },
  featuredContainer: {
    paddingHorizontal: spacing.lg,
  },
  featuredVendorCard: {
    width: 280,
    marginRight: spacing.md,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  mapTitle: {
    ...typography.h3,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  noResultsText: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  offersContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  offerCard: {
    width: 300,
    marginRight: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: colors.white,
    borderWidth: 0,
  },
  offerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  offerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  offerInfo: {
    flex: 1,
  },
  offerTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  offerDescription: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  offerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerCodeContainer: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 4,
  },
  offerCode: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  offerExpiry: {
    ...typography.caption,
    color: colors.textLight,
  },
  markerContainer: {
    alignItems: 'center',
    width: 150,
    marginLeft: -60,
    marginBottom: -20,
    paddingRight: 10,
    paddingLeft: 10,
  },
  marker: {
    width: 30,
    height: 32.5,
    borderRadius: 15,
    backgroundColor: colors.primary,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerLabel: {
    ...typography.caption,
    backgroundColor: colors.white,
    color: colors.text,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: 4,
    marginTop: spacing.xs,
    textAlign: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    maxWidth: 140,
  },
  radiusControl: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  radiusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  radiusLabel: {
    ...typography.body,
    color: colors.text,
  },
  radiusButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  radiusButtonText: {
    ...typography.button,
    color: colors.white,
  },
  radiusSlider: {
    width: '100%',
    height: 40,
  },
  mapLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    zIndex: 1,
  },
  loadingText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  hiddenMap: {
    opacity: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  mapHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullMapButton: {
    padding: spacing.xs,
  },
  lastUpdateText: {
    ...typography.caption,
    color: colors.textLight,
    marginLeft: spacing.sm,
  },
  resultCount: {
    ...typography.caption,
    color: colors.textLight,
    marginLeft: spacing.sm,
  },
});