import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMenuById } from '../../services/menuService';

const MenuItemDetailsScreen = ({ route, navigation }) => {
  const { itemId } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        const response = await getMenuById(itemId);
        console.log('Menu item details:', response);
        
        if (response.success && response.menu_item) {
          setItem(response.menu_item);
        } else {
          setError('Failed to load menu item');
        }
      } catch (err) {
        console.error('Error fetching menu item:', err);
        setError(err.message || 'Failed to load menu item');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [itemId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Menu Item Details</Text>
          </View>
          <View style={styles.headerButton} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading menu item...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Menu Item Details</Text>
          </View>
          <View style={styles.headerButton} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
          <Text style={styles.errorText}>{error || 'Menu item not found'}</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const InfoSection = ({ title, children, icon }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon && <Ionicons name={icon} size={20} color="#6366F1" style={styles.sectionIcon} />}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Menu Item Details</Text>
          <Text style={styles.headerSubtitle}>Item information</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.image || 'https://via.placeholder.com/400x300?text=No+Image' }} 
            style={styles.image}
            onError={(e) => console.log('Image failed to load:', e.nativeEvent.error)}
          />
          <View style={styles.imageOverlay}>
            <View style={[styles.availabilityBadge, item.is_available ? styles.availableBadge : styles.unavailableBadge]}>
              <Ionicons 
                name={item.is_available ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color="white" 
              />
              <Text style={styles.availabilityBadgeText}>
                {item.is_available ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Basic Information */}
          <View style={styles.mainInfoCard}>
            <View style={styles.categoryContainer}>
              <Ionicons name="restaurant" size={16} color="#6366F1" />
              <Text style={styles.category}>{item.category?.toUpperCase() || 'GENERAL'}</Text>
            </View>
            
            <Text style={styles.name}>{item.name}</Text>
            
            {item.description && (
              <Text style={styles.description}>{item.description}</Text>
            )}
            
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>${parseFloat(item.price || 0).toFixed(2)}</Text>
            </View>

            {/* Dietary Options */}
            {(item.isVegetarian || item.isSpicy) && (
              <View style={styles.dietaryOptions}>
                {item.isVegetarian && (
                  <View style={styles.dietaryBadge}>
                    <Ionicons name="leaf" size={14} color="#22C55E" />
                    <Text style={[styles.dietaryText, { color: '#22C55E' }]}>Vegetarian</Text>
                  </View>
                )}
                {item.isSpicy && (
                  <View style={styles.dietaryBadge}>
                    <Ionicons name="flame" size={14} color="#EF4444" />
                    <Text style={[styles.dietaryText, { color: '#EF4444' }]}>Spicy</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Availability Status */}
          <View style={styles.section}>
            <View style={styles.availabilityCard}>
              <View style={styles.availabilityInfo}>
                <Text style={styles.availabilityTitle}>Availability Status</Text>
                <Text style={[
                  styles.availabilityStatus,
                  { color: item.is_available ? '#22C55E' : '#EF4444' }
                ]}>
                  {item.is_available ? 'Currently Available' : 'Currently Unavailable'}
                </Text>
              </View>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: item.is_available ? '#22C55E' : '#EF4444' }
              ]}>
                <Ionicons 
                  name={item.is_available ? "checkmark" : "close"} 
                  size={20} 
                  color="white" 
                />
              </View>
            </View>
          </View>

          {/* Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <InfoSection title="Ingredients" icon="leaf-outline">
              <View style={styles.tagContainer}>
                {item.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientTag}>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </InfoSection>
          )}

          {/* Allergens */}
          {item.allergens && item.allergens.length > 0 && (
            <InfoSection title="Allergens" icon="warning-outline">
              <View style={styles.tagContainer}>
                {item.allergens.map((allergen, index) => (
                  <View key={index} style={styles.allergenTag}>
                    <Ionicons name="warning" size={12} color="#EF4444" />
                    <Text style={styles.allergenText}>{allergen}</Text>
                  </View>
                ))}
              </View>
            </InfoSection>
          )}

          {/* Nutritional Information */}
          {item.nutritionalInfo && Object.keys(item.nutritionalInfo).length > 0 && (
            <InfoSection title="Nutritional Information" icon="fitness-outline">
              <View style={styles.nutritionGrid}>
                {Object.entries(item.nutritionalInfo).map(([key, value]) => (
                  <View key={key} style={styles.nutritionCard}>
                    <Text style={styles.nutritionValue}>{value}</Text>
                    <Text style={styles.nutritionLabel}>{key}</Text>
                  </View>
                ))}
              </View>
            </InfoSection>
          )}

          {/* Item Stats */}
          <InfoSection title="Item Information" icon="information-circle-outline">
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="calendar-outline" size={20} color="#6366F1" />
                <Text style={styles.statLabel}>Added</Text>
                <Text style={styles.statValue}>
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="time-outline" size={20} color="#6366F1" />
                <Text style={styles.statLabel}>Updated</Text>
                <Text style={styles.statValue}>
                  {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
          </InfoSection>
          
          <View style={styles.spacing} />
        </View>
      </ScrollView>
      
      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditMenuItem', { itemId })}
        >
          <Ionicons name="create" size={20} color="white" />
          <Text style={styles.editButtonText}>Edit Item</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  availableBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
  },
  unavailableBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  availabilityBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    padding: 20,
  },
  mainInfoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  category: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 6,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6366F1',
  },
  dietaryOptions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  dietaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dietaryText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityInfo: {
    flex: 1,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  availabilityStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientTag: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  ingredientText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '500',
  },
  allergenTag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
  },
  allergenText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutritionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  editButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  spacing: {
    height: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  errorButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MenuItemDetailsScreen;