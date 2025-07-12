import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, StatusBar, Platform, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';

export default function SavedVendorsScreen({ navigation }) {
  const { user } = useAuth();
  const { favorites, removeFavorite } = useFavorites();
  const [loading, setLoading] = useState(true);

  // Set loading to false after component mounts
  useEffect(() => {
    setLoading(false);
  }, []);

  const handleRemoveVendor = (vendorId) => {
    Alert.alert(
      'Remove Vendor',
      'Are you sure you want to remove this vendor from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          onPress: () => {
            removeFavorite(vendorId);
            Alert.alert('Success', 'Vendor removed from saved list');
          },
          style: 'destructive' 
        },
      ]
    );
  };

  const renderVendorCard = ({ item: vendor }) => (
    <View style={styles.vendorCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('VendorDetails', { vendor })}
        activeOpacity={0.9}
      >
        <View style={styles.vendorImageContainer}>
          {vendor.profile_image && vendor.profile_image.trim() !== '' ? (
            <Image
              source={{ uri: vendor.profile_image }}
              style={styles.vendorImage}
            />
          ) : (
            <View style={styles.vendorImagePlaceholder}>
              <Ionicons
                name="storefront-outline"
                size={48}
                color="#8B5CF6"
              />
            </View>
          )}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleRemoveVendor(vendor.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="heart" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.vendorInfo}>
          <Text style={styles.vendorName} numberOfLines={1}>{vendor.name}</Text>
          <Text style={styles.vendorCategory} numberOfLines={1}>{vendor.category}</Text>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>{vendor.rating || '4.8'}</Text>
            <Text style={styles.reviews}>({vendor.reviews_count || 0} reviews)</Text>
          </View>
          
          {vendor.price_range && (
            <Text style={styles.priceRange}>{vendor.price_range}</Text>
          )}
          
          {vendor.description && (
            <Text style={styles.description} numberOfLines={2}>
              {vendor.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
        <LinearGradient
          colors={["#6366F1", "#8B5CF6", "#A855F7"]}
          style={styles.header}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Saved Vendors</Text>
              <View style={styles.headerRight} />
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading saved vendors...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      {/* Header */}
      <LinearGradient
        colors={["#6366F1", "#8B5CF6", "#A855F7"]}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Saved Vendors</Text>
            
            <View style={styles.headerRight} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <FlatList
        data={favorites}
        renderItem={renderVendorCard}
        keyExtractor={vendor => vendor.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyStateTitle}>No saved vendors yet</Text>
            <Text style={styles.emptyStateText}>
              Save your favorite vendors to easily find them later
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Dashboard')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                style={styles.browseButtonGradient}
              >
                <Ionicons name="search-outline" size={20} color="#FFF" />
                <Text style={styles.browseButtonText}>Browse Vendors</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    marginTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },
  headerRight: {
    width: 40,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  vendorCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
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
  vendorImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
    marginRight: 4,
  },
  reviews: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceRange: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
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
    marginBottom: 32,
  },
  browseButton: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 200,
  },
  browseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 8,
  },
}); 