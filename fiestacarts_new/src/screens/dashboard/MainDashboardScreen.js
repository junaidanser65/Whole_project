import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Dimensions, ScrollView, TouchableOpacity, Animated, SafeAreaView, FlatList, TextInput, StatusBar, ActivityIndicator, Platform, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import VendorCard from '../vendor/components/VendorCard';
import { getVendors } from '../../api/apiService';
import * as Location from 'expo-location';
import { websocketService } from '../../services/websocketService';

const CATEGORIES = [
  { id: '1', name: 'Catering', icon: 'restaurant-outline', color: '#FF6B6B' },
  { id: '2', name: 'Venues', icon: 'location-outline', color: '#4ECDC4' },
  { id: '3', name: 'Photography', icon: 'camera-outline', color: '#45B7D1' },
  { id: '4', name: 'Music', icon: 'musical-notes-outline', color: '#96CEB4' },
  { id: '5', name: 'Decoration', icon: 'flower-outline', color: '#FFEAA7' },
];

const SPECIAL_OFFERS = [
  {
    id: '1',
    title: '20% Off First Booking',
    description: 'Get 20% off on your first booking with any vendor',
    code: 'FIRST20',
    expiryDate: '2024-04-30',
    gradient: ['#667eea', '#764ba2'],
    icon: 'pricetag-outline'
  },
  {
    id: '2',
    title: 'Free Decoration',
    description: 'Book a venue and get free decoration services',
    code: 'FREEDECOR',
    expiryDate: '2024-05-15',
    gradient: ['#f093fb', '#f5576c'],
    icon: 'gift-outline'
  },
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.75;

export default function MainDashboardScreen({ navigation }) {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [featuredVendors, setFeaturedVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchVendors();
    getUserLocation();

    // Subscribe to websocket location updates
    const handleLocationUpdate = (data) => {
      setVendors(prevVendors => prevVendors.map(vendor => {
        if (String(vendor.id) === String(data.vendorId)) {
          return {
            ...vendor,
            latitude: parseFloat(data.location.latitude),
            longitude: parseFloat(data.location.longitude),
            location: {
              latitude: parseFloat(data.location.latitude),
              longitude: parseFloat(data.location.longitude),
              timestamp: data.timestamp || new Date().toISOString()
            }
          };
        }
        return vendor;
      }));
    };

    const handleLocationRemoved = (data) => {
      setVendors(prevVendors => prevVendors.map(vendor => {
        if (String(vendor.id) === String(data.vendorId)) {
          // Remove lat/lng so marker disappears
          return {
            ...vendor,
            latitude: undefined,
            longitude: undefined,
            location: null
          };
        }
        return vendor;
      }));
    };

    const unsubscribeLocationUpdate = websocketService.subscribe('location_update', handleLocationUpdate);
    const unsubscribeLocationRemoved = websocketService.subscribe('location_removed', handleLocationRemoved);

    // Register as customer for location updates
    websocketService.send({ type: 'register', vendorId: 'customer' });

    return () => {
      unsubscribeLocationUpdate();
      unsubscribeLocationRemoved();
    };
  }, []);

  const fetchVendors = async () => {
    setIsRefreshing(true);
    setLoadingVendors(true);
    try {
      const response = await getVendors();
      if (response && response.success) {
        // Add latitude/longitude from latest location
        const vendorsWithLatLng = response.vendors.map(vendor => {
          const latestLocation = vendor.locations && vendor.locations.length > 0
            ? vendor.locations[vendor.locations.length - 1]
            : null;
          return {
            ...vendor,
            latitude: latestLocation ? parseFloat(latestLocation.latitude) : undefined,
            longitude: latestLocation ? parseFloat(latestLocation.longitude) : undefined,
            location: latestLocation || null,
          };
        });
        setVendors(vendorsWithLatLng);
        setFeaturedVendors(vendorsWithLatLng.slice(0, 5));
        setFilteredVendors(vendorsWithLatLng);
        // Debug: Log the first vendor to see available fields
        if (vendorsWithLatLng.length > 0) {
          console.log('First vendor data:', vendorsWithLatLng[0]);
          console.log('Available image fields:', {
            profile_image: vendorsWithLatLng[0].profile_image,
            image_url: vendorsWithLatLng[0].image_url,
            image: vendorsWithLatLng[0].image
          });
        }
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoadingVendors(false);
      setIsRefreshing(false);
    }
  };

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({});
      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setUserLocation(userCoords);
      setMapRegion(userCoords);
      setIsMapLoading(false);
    } catch (error) {
      setIsMapLoading(false);
    }
  };

  // Filter vendors by search/category
  useEffect(() => {
    let filtered = vendors;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      console.log('Filtering vendors with query:', q, 'Vendors:', vendors);
      filtered = filtered.filter(v =>
        v.name?.toLowerCase().includes(q) ||
        v.business_name?.toLowerCase().includes(q) ||
        v.address?.toLowerCase().includes(q)
      );
    }
    setFilteredVendors(filtered);
  }, [searchQuery, vendors]);

  // Header with improved design
  const renderHeader = () => (
    <LinearGradient
      colors={["#6366F1", "#8B5CF6", "#A855F7"]}
      style={styles.header}
    >
      <SafeAreaView>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.greetingSection}>
              <Text style={styles.greetingText}>
                {loading ? 'Loading...' : `Hi, ${user?.name?.split(' ')[0] || 'Guest'}! 👋`}
              </Text>
              <Text style={styles.headerTitle}>Find the perfect vendor</Text>
              <Text style={styles.headerTitle}>for your event</Text>
              <Text style={styles.headerSubtitle}>Browse, book, and manage all your event needs in one place.</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity 
                style={styles.profileBtn}
                onPress={() => navigation.navigate('ProfileMain')}
              >
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileInitial}>
                    {loading ? 'G' : (user?.name?.charAt(0)?.toUpperCase() || 'G')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={20} color="#8B5CF6" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search vendors, services..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  // Featured Vendors with improved cards
  const renderFeaturedVendors = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Vendors</Text>
        <TouchableOpacity onPress={() => navigation.navigate('VendorSearch', { featured: true })}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredContainer}
      >
        {featuredVendors.map((vendor, index) => (
          <TouchableOpacity
            key={vendor.id}
            style={[styles.featuredCard, { marginLeft: index === 0 ? 20 : 0 }]}
            onPress={() => navigation.navigate('VendorDetails', { vendor })}
            activeOpacity={0.9}
          >
                          <View style={styles.featuredImageContainer}>
                <Image 
                  source={{ uri: vendor.profile_image || vendor.image_url || 'https://via.placeholder.com/300x200' }}
                  style={styles.featuredImage}
                  defaultSource={{ uri: 'https://via.placeholder.com/300x200' }}
                />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.featuredOverlay}
              />
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.featuredRating}>{vendor.rating || '0.0'}</Text>
              </View>
            </View>
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredName} numberOfLines={1}>{vendor.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Special Offers with better design
  const renderSpecialOffers = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Special Offers</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.offersContainer}
      >
        {SPECIAL_OFFERS.map((offer, index) => (
          <LinearGradient
            key={offer.id}
            colors={offer.gradient}
            style={[styles.offerCard, { marginLeft: index === 0 ? 20 : 0 }]}
          >
            <View style={styles.offerHeader}>
              <Ionicons name={offer.icon} size={28} color="#FFF" />
              <View style={styles.offerCodeBadge}>
                <Text style={styles.offerCodeText}>{offer.code}</Text>
              </View>
            </View>
            <Text style={styles.offerTitle}>{offer.title}</Text>
            <Text style={styles.offerDescription}>{offer.description}</Text>
            <Text style={styles.offerExpiry}>Expires {offer.expiryDate}</Text>
          </LinearGradient>
        ))}
      </ScrollView>
    </View>
  );

  // Map Preview with better styling
  const renderMapPreview = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vendors Near You</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FullMap', { userLocation, vendors: vendors.filter(v => v.id !== undefined && v.latitude !== undefined && v.longitude !== undefined) })}>
          <Text style={styles.seeAllText}>View Map</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mapContainer}>
        {isMapLoading ? (
          <View style={styles.mapLoadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        ) : (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={mapRegion}
            showsUserLocation={true}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            {vendors.slice(0, 5).filter(v => v.id !== undefined && v.latitude !== undefined && v.longitude !== undefined).map(vendor => (
              <Marker
                key={vendor.id}
                coordinate={{ latitude: vendor.latitude, longitude: vendor.longitude }}
                title={vendor.name}
                description={vendor.category}
              >
                <View style={styles.mapMarker}>
                  <Ionicons name="location" size={24} color="#8B5CF6" />
                </View>
              </Marker>
            ))}
          </MapView>
        )}
      </View>
    </View>
  );

  // All Vendors with improved grid
  const renderAllVendors = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Vendors</Text>
        <Text style={styles.resultCount}>{filteredVendors.length} vendors</Text>
      </View>
      {loadingVendors ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading vendors...</Text>
        </View>
      ) : filteredVendors.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color="#CBD5E1" />
          <Text style={styles.emptyStateTitle}>No vendors found</Text>
          <Text style={styles.emptyStateText}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        <View style={styles.vendorsGrid}>
          {filteredVendors.map((vendor, index) => (
            <TouchableOpacity
              key={vendor.id}
              style={styles.vendorGridCard}
              onPress={() => navigation.navigate('VendorDetails', { vendor })}
              activeOpacity={0.9}
            >
              <View style={styles.vendorImageContainer}>
                <Image 
                  source={{ uri: vendor.profile_image || vendor.image_url || 'https://via.placeholder.com/200x120' }}
                  style={styles.vendorImage}
                  defaultSource={{ uri: 'https://via.placeholder.com/200x120' }}
                />
                <View style={styles.vendorRatingBadge}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.vendorRating}>{vendor.rating || '4.8'}</Text>
                </View>
              </View>
              <View style={styles.vendorInfo}>
                <Text style={styles.vendorName} numberOfLines={1}>{vendor.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={fetchVendors}
            colors={["#6366F1"]}
            tintColor="#6366F1"
          />
        }
      >
        {renderHeader()}
        {renderFeaturedVendors()}
        {renderSpecialOffers()}
        {renderMapPreview()}
        {renderAllVendors()}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginTop: 30,
    paddingBottom: 30,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greetingSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: '#E0E7FF',
    fontWeight: '500',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: '800',
    lineHeight: 32,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#C7D2FE',
    marginTop: 8,
    lineHeight: 20,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  searchContainer: {
    marginTop: 8,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  clearBtn: {
    padding: 4,
  },
  categoriesSection: {
    marginTop: 24,
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 15,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 12,
  },
  categoryCardActive: {
    transform: [{ scale: 1.05 }],
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
  featuredContainer: {
    paddingBottom: 20,
    paddingRight: 20,
  },
  featuredCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  featuredImageContainer: {
    position: 'relative',
    height: 160,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredRating: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  featuredInfo: {
    padding: 16,
  },
  featuredName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  featuredCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  featuredBookBtn: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  featuredBookText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  offersContainer: {
    paddingRight: 20,
  },
  offerCard: {
    width: CARD_WIDTH * 0.85,
    padding: 20,
    borderRadius: 20,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerCodeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  offerCodeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  offerDescription: {
    fontSize: 14,
    color: '#E0E7FF',
    lineHeight: 20,
    marginBottom: 12,
  },
  offerExpiry: {
    fontSize: 12,
    color: '#C7D2FE',
    fontWeight: '500',
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  map: {
    flex: 1,
  },
  mapLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  mapMarker: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '500',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  vendorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  vendorGridCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  vendorImageContainer: {
    position: 'relative',
    height: 120,
  },
  vendorImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  vendorRatingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  vendorRating: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  vendorInfo: {
    padding: 12,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  vendorCategory: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  vendorPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  resultCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 100,
  },
});