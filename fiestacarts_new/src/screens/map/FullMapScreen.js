import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import { SearchBar, Icon, Button, Card } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import Slider from '@react-native-community/slider';
import { getDistance } from 'geolib';
import { websocketService } from '../../services/websocketService';

// Using the same mock data from MainDashboardScreen
const ALL_VENDORS = [
  {
    id: '1',
    name: 'Gourmet Catering Co.',
    category: 'Catering',
    rating: 4.8,
    reviews: 124,
    priceRange: '$$',
    image: 'https://via.placeholder.com/300x200',
    latitude: 37.78825,
    longitude: -122.4324,
    description: 'Premium catering services for all types of events.',
  },
  {
    id: '2',
    name: 'Elegant Events Venue',
    category: 'Venues',
    rating: 4.9,
    reviews: 89,
    priceRange: '$$$',
    image: 'https://via.placeholder.com/300x200',
    latitude: 37.78925,
    longitude: -122.4344,
    description: 'Luxurious venue for weddings and corporate events.',
  },
  {
    id: '3',
    name: 'Capture Moments',
    category: 'Photography',
    rating: 4.7,
    reviews: 156,
    priceRange: '$$',
    image: 'https://via.placeholder.com/300x200',
    latitude: 37.78725,
    longitude: -122.4354,
    description: 'Professional photography services for your special moments.',
  },
  {
    id: '4',
    name: 'Royal Palace',
    category: 'Venues',
    rating: 5.0,
    reviews: 230,
    priceRange: '$$$',
    image: 'https://via.placeholder.com/300x200',
    badge: 'Featured',
    latitude: 37.78625,
    longitude: -122.4344,
  },
  {
    id: '5',
    name: 'Elite Decorators',
    category: 'Decoration',
    rating: 4.9,
    reviews: 180,
    priceRange: '$$',
    image: 'https://via.placeholder.com/300x200',
    badge: 'Top Rated',
    latitude: 37.78525,
    longitude: -122.4364,
  },
];

// Add this helper function to get category icon
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

// Safe string conversion helper
function safeString(val) {
  return (val !== undefined && val !== null) ? String(val) : '';
}

export default function FullMapScreen({ route, navigation }) {
  // Accept both 'vendors' and 'nearbyVendors' from route.params for compatibility
  const { userLocation, vendors: vendorsParam, nearbyVendors: nearbyVendorsParam } = route.params || {};
  const initialVendors = vendorsParam || nearbyVendorsParam || [];
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [region, setRegion] = useState({
    latitude: userLocation?.latitude || 37.78825,
    longitude: userLocation?.longitude || -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [radiusKm, setRadiusKm] = useState(10);
  const [vendorsWithLocations, setVendorsWithLocations] = useState(initialVendors);
  const [filteredVendors, setFilteredVendors] = useState(initialVendors);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const markersRef = useRef({});

  // Initialize map and vendors when component mounts
  useEffect(() => {
    if (userLocation && initialVendors?.length > 0) {
      console.log('Initializing with:', { userLocation, vendorCount: initialVendors.length });
      
      // Set initial region
      const initialRegion = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(initialRegion);
      
      // Set vendors
      setVendorsWithLocations(initialVendors);
      setFilteredVendors(initialVendors);

      // Animate to user location if map is ready
      if (mapRef) {
        mapRef.animateToRegion(initialRegion, 1000);
      }
    }
  }, [userLocation, initialVendors, mapRef]);

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
        if (safeString(vendor.id) === safeString(data.vendorId)) {
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

    // Update filteredVendors
    setFilteredVendors(prevVendors => {
      const updatedVendors = prevVendors.map(vendor => {
        if (safeString(vendor.id) === safeString(data.vendorId)) {
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
    if (mapRef) {
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

  // Handle WebSocket location removal
  const handleLocationRemoved = (data) => {
    console.log('Received location removal:', data);
    
    if (!data.vendorId) {
      console.warn('Invalid location removal data:', data);
      return;
    }

    // Remove vendor from vendorsWithLocations
    setVendorsWithLocations(prevVendors => 
      prevVendors.filter(vendor => safeString(vendor.id) !== safeString(data.vendorId))
    );

    // Remove vendor from filteredVendors
    setFilteredVendors(prevVendors => 
      prevVendors.filter(vendor => safeString(vendor.id) !== safeString(data.vendorId))
    );

    // Remove marker from map safely
    if (mapRef) {
      const marker = markersRef.current[data.vendorId];
      if (marker) {
        try {
          // Clean up the marker reference
          delete markersRef.current[data.vendorId];
        } catch (error) {
          console.warn('Error removing marker:', error);
        }
      }
    }
  };

  // Connect to WebSocket when component mounts
  useEffect(() => {
    console.log('[FullMap] Setting up WebSocket connection');
    const unsubscribeLocationUpdate = websocketService.subscribe('location_update', handleLocationUpdate);
    const unsubscribeLocationRemoved = websocketService.subscribe('location_removed', handleLocationRemoved);
    
    // Register with WebSocket server
    websocketService.send({
      type: 'register',
      vendorId: 'customer'
    });

    return () => {
      console.log('[FullMap] Cleaning up WebSocket connection');
      unsubscribeLocationUpdate();
      unsubscribeLocationRemoved();
    };
  }, []);

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

      // Search filter with null checks
      const searchLower = search.toLowerCase();
      const vendorName = (vendor.name || '').toLowerCase();
      const vendorCategory = (vendor.category || '').toLowerCase();
      const vendorBusinessName = (vendor.business_name || '').toLowerCase();
      const vendorAddress = (vendor.address || '').toLowerCase();

      const matchesSearch = !search || 
        vendorName.includes(searchLower) ||
        vendorCategory.includes(searchLower) ||
        vendorBusinessName.includes(searchLower) ||
        vendorAddress.includes(searchLower);

      return isInRadius && matchesSearch;
    });

    setFilteredVendors(filtered);
    setLastUpdateTime(new Date().toLocaleTimeString());
  };

  // Handle radius change
  const handleRadiusChange = (newRadius) => {
    setRadiusKm(newRadius);
    filterVendors();
  };

  // Handle search change
  const handleSearchChange = (text) => {
    setSearch(text);
    filterVendors();
  };

  const handleRadiusApply = () => {
    filterVendors();
  };

  const handleVendorPress = (vendor) => {
    if (!vendor) {
      console.error('No vendor data available');
      return;
    }

    navigation.navigate('VendorDetails', { vendor });
  };

  const handleMarkerPress = (vendor) => {
    setSelectedVendor(vendor);
    setRegion({
      latitude: vendor.latitude,
      longitude: vendor.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  // Add console logs to debug
  console.log('UserLocation:', userLocation);
  console.log('Initial Vendors:', initialVendors?.length);
  console.log('Current Region:', region);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Search Bar Overlay */}
        <View style={styles.searchOverlay}>
          <SearchBar
            placeholder="Search vendors..."
            onChangeText={handleSearchChange}
            value={search}
            containerStyle={styles.searchContainer}
            inputContainerStyle={styles.searchInputContainer}
            platform="default"
          />
        </View>

        {/* Radius Control */}
        <View style={styles.radiusControl}>
          <View style={styles.radiusHeader}>
            <Text style={styles.radiusLabel}>Search Radius: {radiusKm}km</Text>
            <TouchableOpacity 
              style={styles.radiusButton}
              onPress={handleRadiusApply}
            >
              <Text style={styles.radiusButtonText}>Apply</Text>
            </TouchableOpacity>
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

        {/* Map */}
        <MapView
          ref={ref => setMapRef(ref)}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
          showsMyLocationButton={false}
          onRegionChangeComplete={setRegion}
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
          {filteredVendors
            .filter(vendor => vendor.id !== undefined && vendor.latitude !== undefined && vendor.longitude !== undefined)
            .map((vendor) => (
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
                description={`${vendor.category || 'Other'} • ${vendor.rating}⭐`}
                onPress={() => handleMarkerPress(vendor)}
                anchor={{ x: 0.5, y: 1.0 }}
              >
                <View style={styles.markerContainer}>
                  <View style={[styles.marker, { backgroundColor: colors.white }]}>
                    <Icon 
                      name={getCategoryIcon(vendor.category)} 
                      size={18} 
                      color={colors.primary} 
                      type="material"
                    />
                  </View>
                  <Text style={styles.markerLabel} numberOfLines={1}>
                    {vendor.name}
                  </Text>
                </View>
              </Marker>
            ))}
        </MapView>

        {/* My Location Button */}
        <TouchableOpacity 
          style={styles.myLocationButton}
          onPress={() => {
            if (userLocation && mapRef) {
              mapRef.animateToRegion({
                ...userLocation,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }, 1000);
            }
          }}
        >
          <Icon name="my-location" size={24} color={colors.primary} />
        </TouchableOpacity>

        {/* Selected Vendor Card */}
        {selectedVendor && (
          <View style={styles.vendorCardContainer}>
            <Card containerStyle={styles.vendorCard}>
              <View style={styles.vendorInfo}>
                <View style={styles.vendorHeader}>
                  <View style={styles.vendorTitleContainer}>
                    <Text style={styles.vendorName}>{selectedVendor.name}</Text>
                    <Text style={styles.businessName}>{selectedVendor.business_name}</Text>
                    <Text style={styles.vendorCategory}>{selectedVendor.category}</Text>
                  </View>
                  {selectedVendor.badge && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{selectedVendor.badge}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.vendorDetails}>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" color={colors.primary} size={16} />
                    <Text style={styles.rating}>{selectedVendor.rating}</Text>
                    <Text style={styles.reviews}>({selectedVendor.reviews} reviews)</Text>
                  </View>
                  <Text style={styles.priceRange}>{selectedVendor.priceRange}</Text>
                </View>

                {/* Contact Information */}
                <View style={styles.contactInfo}>
                  {selectedVendor.address && (
                    <View style={styles.contactRow}>
                      <Icon name="location-on" size={16} color={colors.textLight} />
                      <Text style={styles.contactText}>{selectedVendor.address}</Text>
                    </View>
                  )}
                  {selectedVendor.phone_number && (
                    <View style={styles.contactRow}>
                      <Icon name="phone" size={16} color={colors.textLight} />
                      <Text style={styles.contactText}>{selectedVendor.phone_number}</Text>
                    </View>
                  )}
                  {selectedVendor.email && (
                    <View style={styles.contactRow}>
                      <Icon name="email" size={16} color={colors.textLight} />
                      <Text style={styles.contactText}>{selectedVendor.email}</Text>
                    </View>
                  )}
                </View>

                {/* Description */}
                {selectedVendor.description && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionText} numberOfLines={2}>
                      {selectedVendor.description}
                    </Text>
                  </View>
                )}

                <Button
                  title="View Full Details"
                  onPress={() => navigation.navigate('VendorDetails', { vendor: selectedVendor })}
                  buttonStyle={styles.detailsButton}
                  icon={
                    <Icon
                      name="arrow-forward"
                      size={16}
                      color={colors.white}
                      style={styles.buttonIcon}
                    />
                  }
                />
              </View>
            </Card>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  searchOverlay: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg + 50,
    right: spacing.lg,
    zIndex: 1,
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
  },
  searchInputContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    height: 45,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  markerContainer: {
    alignItems: 'center',
    width: 60,
    marginLeft: -10,
    marginBottom: -30,
  },
  badgeContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeText: {
    ...typography.caption,
    color: colors.background,
    fontSize: 8,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 2,
  },
  vendorCardContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
  },
  vendorCard: {
    margin: 0,
    borderRadius: 12,
    padding: spacing.md,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  vendorInfo: {
    flexDirection: 'column',
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vendorTitleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  vendorName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  businessName: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.xs / 2,
  },
  vendorCategory: {
    ...typography.body,
    color: colors.textLight,
  },
  vendorDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
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
  contactInfo: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  contactText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.xs,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  descriptionText: {
    ...typography.body,
    color: colors.textLight,
    lineHeight: 20,
  },
  detailsButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginLeft: spacing.xs,
  },
  radiusControl: {
    position: 'absolute',
    top: spacing.lg + 60,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1,
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
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    maxWidth: 60,
    fontSize: 10,
  },
  myLocationButton: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
}); 