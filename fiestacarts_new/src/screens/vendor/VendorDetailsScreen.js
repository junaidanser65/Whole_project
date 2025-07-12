import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Dimensions, Alert, Share, Animated, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../../contexts/AuthContext';
import ImageGallery from '../../components/vendor/ImageGallery';
import AvailabilityCalendar from '../../components/vendor/AvailabilityCalendar';
import PricingCalculator from '../../components/vendor/PricingCalculator';
import ShareButton from '../../components/common/ShareButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useFavorites } from '../../contexts/FavoritesContext';
import BackButton from '../../components/common/BackButton';
import { getVendorMenu, getPublicVendorAvailability, createConversation } from '../../api/apiService';

const VendorDetailsScreen = ({ route, navigation }) => {
  // Get vendor from route params
  const initialVendor = route.params?.vendor || MOCK_VENDOR;
  
  const [vendor, setVendor] = useState(initialVendor);
  const [vendorImages, setVendorImages] = useState([]);
  const [vendorServices, setVendorServices] = useState([]);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [dateAvailability, setDateAvailability] = useState(null);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        
        if (route.params?.vendor) {
          const vendorFromParams = route.params.vendor;
          setVendor(vendorFromParams);
          
          // Set vendor images - use profile_image if available, otherwise use image_url
          const images = [];
          if (vendorFromParams.profile_image) {
            images.push(vendorFromParams.profile_image);
          }
          if (vendorFromParams.image_url && !images.includes(vendorFromParams.image_url)) {
            images.push(vendorFromParams.image_url);
          }
          // If no images are available, use a default image
          if (images.length === 0) {
            images.push('https://via.placeholder.com/400x300');
          }
          setVendorImages(images);
          
          // Fetch menu items from the database
          try {
            const menuItems = await getVendorMenu(vendorFromParams.id);
            console.log('Fetched menu items:', menuItems);
            setVendorServices(menuItems);
          } catch (error) {
            console.error('Error fetching menu items:', error);
            // Fallback to mock services if API fails
            const mockServices = MOCK_SERVICES[vendorFromParams.id] || [];
            console.log('Using mock services:', mockServices);
            setVendorServices(mockServices);
          }
          
          fetchAvailability(vendorFromParams.id);
        } else {
          console.log('No vendor in params, using mock vendor');
          setVendor(MOCK_VENDOR);
          setVendorImages([MOCK_VENDOR.image_url]);
          const mockServices = MOCK_SERVICES[MOCK_VENDOR.id] || [];
          setVendorServices(mockServices);
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error);
        Alert.alert('Error', 'Failed to load vendor details');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [route.params?.vendor]);

  const toggleFavorite = () => {
    setLoading(true);
    try {
      if (isFavorite(vendor.id)) {
        removeFavorite(vendor.id);
        Alert.alert('Success', 'Vendor removed from favorites');
      } else {
        addFavorite(vendor);
        Alert.alert('Success', 'Vendor added to favorites');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Find availability for selected date
    const availabilityForDate = availability.find(a => a.date === date);
    setDateAvailability(availabilityForDate);
  };

  const handleBookNow = async () => {
    if (!selectedDate) {
      Alert.alert('Select Date', 'Please select an available date first');
      return;
    }

    if (selectedServices.length === 0) {
      Alert.alert('Select Services', 'Please select at least one service before booking');
      return;
    }

    try {
      // Fetch availability for the selected date
      const response = await getPublicVendorAvailability(vendor.id, selectedDate);
      
      // Check if response exists and has the expected structure
      if (!response?.data?.availability) {
        throw new Error('Invalid response format from server');
      }

      const availableSlots = response.data.availability.available_slots || [];

      if (!availableSlots || availableSlots.length === 0) {
        Alert.alert('No Available Slots', 'There are no available time slots for this date.');
        return;
      }

      navigation.navigate('BookingForm', { 
        vendor,
        selectedDate,
        availableSlots,
        selectedServices: vendorServices.filter(service => selectedServices.includes(service.id)),
        totalPrice,
      });
    } catch (error) {
      console.error('Error fetching availability:', error);
      Alert.alert('Error', 'Failed to fetch available time slots. Please try again.');
    }
  };

  const fetchAvailability = async (vendorId) => {
    // Remove UUID validation since backend uses numeric IDs
    if (!vendorId) {
      console.log('No vendor ID provided');
      setAvailability([]);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching availability starting from:', today);
      
      // Get the next 30 days of availability
      const next30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        return date.toISOString().split('T')[0];
      });

      // Fetch availability for each day
      const availabilityPromises = next30Days.map(async (date) => {
        try {
          const response = await getPublicVendorAvailability(vendorId, date);
          console.log(`Raw API response for ${date}:`, response);
          
          const availability = response?.data?.availability;
          console.log(`Processed availability for ${date}:`, availability);

          // Check if the date has available slots
          if (availability?.is_available && 
              Array.isArray(availability?.available_slots) && 
              availability.available_slots.length > 0) {
            console.log(`Found available slots for ${date}:`, availability.available_slots);
            return {
              date,
              is_available: true,
              available_slots: availability.available_slots
            };
          }
          console.log(`No available slots for ${date}`);
          return null;
        } catch (error) {
          console.error(`Error fetching availability for ${date}:`, error);
          return null;
        }
      });

      const availabilityResults = await Promise.all(availabilityPromises);
      const availableDates = availabilityResults.filter(result => result !== null);
      
      console.log('Final availability data:', availableDates);
      setAvailability(availableDates);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setAvailability([]);
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out ${vendor.name} on our app!`,
        url: `vendorapp://vendor/${vendor.id}`,
        title: vendor.name,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share vendor');
    }
  };

  const handleChat = async () => {
    try {
      // Create or get existing conversation
      const response = await createConversation(vendor.id);
      
      if (!response.success) {
        Alert.alert('Error', 'Failed to start conversation');
        return;
      }

      // Navigate to chat with the conversation ID
      navigation.navigate('Chat', {
        screen: 'ChatDetails',
        params: {
          conversationId: response.conversation.id,
          vendorName: vendor.name,
        }
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Failed to start conversation');
    }
  };

  const handleServiceSelection = (services, total) => {
    setSelectedServices(services);
    setTotalPrice(total);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
        <LinearGradient
          colors={["#6366F1", "#8B5CF6", "#A855F7"]}
          style={styles.loadingHeader}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              
              <View style={styles.headerRight} />
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
        <LinearGradient
          colors={["#6366F1", "#8B5CF6", "#A855F7"]}
          style={styles.loadingHeader}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
             
              <View style={styles.headerRight} />
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ErrorMessage message="Vendor not found" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Back Button */}
        <View style={styles.imageContainer}>
          <ImageGallery images={vendorImages} />
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.8)', 'transparent']}
            style={styles.headerOverlay}
          >
            <SafeAreaView>
              <View style={styles.headerContent}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>

        {/* Vendor Information Card */}
        <View style={styles.vendorInfoCard}>
          <View style={styles.vendorHeader}>
            <View style={styles.vendorTitleSection}>
              <Text style={styles.vendorName}>{vendor.name}</Text>
              <Text style={styles.businessName}>{vendor.business_name || 'Restaurant'}</Text>
            </View>
            
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{vendor.rating}</Text>
            </View>
          </View>

          <View style={styles.vendorMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{vendor.reviews_count} reviews</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="card-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{vendor.price_range}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, isFavorite(vendor.id) && styles.favoriteActive]}
              onPress={toggleFavorite}
              disabled={loading}
            >
              <Ionicons
                name={isFavorite(vendor.id) ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite(vendor.id) ? '#EF4444' : '#8B5CF6'}
              />
              <Text style={[
                styles.actionButtonText,
                isFavorite(vendor.id) && styles.favoriteActiveText
              ]}>
                {loading ? 'Updating...' : (isFavorite(vendor.id) ? 'Saved' : 'Save')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleChat}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#8B5CF6" />
              <Text style={styles.actionButtonText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Availability Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.sectionCard}>
            <AvailabilityCalendar
              availability={availability}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
          </View>
        </View>

        {/* Services & Pricing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services & Pricing</Text>
          <View style={styles.sectionCard}>
            {vendorServices && vendorServices.length > 0 ? (
              <>
                <View style={styles.serviceHeader}>
                  <Ionicons name="restaurant-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.serviceCount}>{vendorServices.length} services available</Text>
                </View>
                <PricingCalculator
                  services={vendorServices}
                  onServiceSelect={handleServiceSelection}
                />
              </>
            ) : (
              <View style={styles.noServicesContainer}>
                <View style={styles.noServicesIcon}>
                  <Ionicons name="restaurant-outline" size={48} color="#CBD5E1" />
                </View>
                <Text style={styles.noServicesText}>No menu items available</Text>
                <Text style={styles.noServicesSubText}>Please check back later for updates</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Book Now Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedDate || selectedServices.length === 0) && styles.bookButtonDisabled
          ]}
          onPress={handleBookNow}
          disabled={!selectedDate || selectedServices.length === 0}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              (!selectedDate || selectedServices.length === 0)
                ? ["#9CA3AF", "#6B7280"]
                : ["#A5B4FC", "#8B5CF6", "#7C3AED"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookButtonGradient}
          >
            {!selectedDate || selectedServices.length === 0 ? (
              <>
                <Ionicons name="lock-closed" size={20} color="#FFF" />
                <Text style={styles.bookButtonText}>
                  {!selectedDate ? 'Select Date' : 'Select Services'}
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="calendar-outline" size={20} color="#FFF" />
                <Text style={styles.bookButtonText}>Book Now</Text>
                <View style={styles.priceBadge}>
                </View>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingHeader: {
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  headerRight: {
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 10,
  },
  vendorInfoCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 5,
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  vendorTitleSection: {
    flex: 1,
    marginRight: 16,
  },
  vendorName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  vendorMeta: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  favoriteActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  favoriteActiveText: {
    color: '#DC2626',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  serviceCount: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  noServicesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noServicesIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  noServicesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  noServicesSubText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  bookingSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  bookButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 3,
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 8,
    position: 'relative',
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  bookingHint: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 120,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  priceBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#8B5CF6',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default VendorDetailsScreen; 