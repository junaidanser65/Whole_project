import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getMenuById, updateMenu, deleteMenu } from '../../services/menuService';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';

const CATEGORIES = [
  { id: 'main', name: 'Main Course', icon: 'restaurant' },
  { id: 'appetizer', name: 'Appetizer', icon: 'leaf' },
  { id: 'dessert', name: 'Dessert', icon: 'ice-cream' },
  { id: 'beverage', name: 'Beverage', icon: 'wine' },
  { id: 'snack', name: 'Snack', icon: 'pizza' },
];

const EditMenuItemScreen = ({ route, navigation }) => {
  const { itemId } = route.params;
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localImage, setLocalImage] = useState(null);
  
  // Fetch menu item data when component mounts
  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        console.log('Fetching menu item with ID:', itemId);
        const response = await getMenuById(itemId);
        console.log('Menu item data received:', response);
        
        if (response.success && response.menu_item) {
          setItem({
            id: response.menu_item.id,
            name: response.menu_item.name || '',
            description: response.menu_item.description || '',
            price: response.menu_item.price?.toString() || '',
            category: response.menu_item.category || 'main',
            image: response.menu_item.image || null,
            is_available: response.menu_item.is_available !== false,
            isVegetarian: response.menu_item.isVegetarian || false,
            isSpicy: response.menu_item.isSpicy || false,
          });
        } else {
          setError('Failed to load menu item data');
        }
      } catch (err) {
        console.error('Error fetching menu item:', err);
        setError(err.message || 'Failed to load menu item');
        Alert.alert('Error', 'Failed to load menu item data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuItem();
  }, [itemId]);

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to add images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLocalImage(result.assets[0].uri);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Changes',
      'Are you sure you want to reset all changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setLocalImage(null);
            // Reset to original values by refetching
            setLoading(true);
            const originalFetch = async () => {
              try {
                const response = await getMenuById(itemId);
                if (response.success && response.menu_item) {
                  setItem({
                    id: response.menu_item.id,
                    name: response.menu_item.name || '',
                    description: response.menu_item.description || '',
                    price: response.menu_item.price?.toString() || '',
                    category: response.menu_item.category || 'main',
                    image: response.menu_item.image || null,
                    is_available: response.menu_item.is_available !== false,
                    isVegetarian: response.menu_item.isVegetarian || false,
                    isSpicy: response.menu_item.isSpicy || false,
                  });
                }
              } catch (error) {
                console.error('Error resetting:', error);
              } finally {
                setLoading(false);
              }
            };
            originalFetch();
          }
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!item.name || !item.price || !item.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    setIsUploading(!!localImage);
    try {
      let imageUrl = item.image;
      
      // If there's a new local image, upload it to Cloudinary
      if (localImage) {
        const uploadResult = await uploadImageToCloudinary(localImage);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload image');
        }
        imageUrl = uploadResult.imageUrl;
      }
      
      const menuData = {
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        category: item.category,
        image: imageUrl,
        is_available: item.is_available,
        isVegetarian: item.isVegetarian,
        isSpicy: item.isSpicy,
      };
      
      const response = await updateMenu(item.id, menuData);
      console.log('Update response:', response);
      
      if (response.success) {
        Alert.alert('Success', 'Menu item updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(response.message || 'Failed to update menu item');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      Alert.alert('Error', error.message || 'Failed to update menu item');
    } finally {
      setSaving(false);
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this menu item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              console.log('Deleting menu item with ID:', item.id);
              const response = await deleteMenu(item.id);
              console.log('Delete response:', response);
              
              if (response.success) {
                Alert.alert('Success', 'Menu item deleted successfully', [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ]);
              } else {
                throw new Error(response.message || 'Failed to delete menu item');
              }
            } catch (error) {
              console.error('Error deleting menu item:', error);
              Alert.alert('Error', error.message || 'Failed to delete menu item');
            } finally {
              setDeleting(false);
            }
          }
        },
      ]
    );
  };

  if (loading && !item) {
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
            <Text style={styles.headerTitle}>Edit Menu Item</Text>
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
  
  if (error && !item) {
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
            <Text style={styles.headerTitle}>Edit Menu Item</Text>
          </View>
          <View style={styles.headerButton} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
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
          <Text style={styles.headerTitle}>Edit Menu Item</Text>
          <Text style={styles.headerSubtitle}>Update item details</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Upload Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.imageContainer} onPress={handleImagePick}>
            {(localImage || item.image) ? (
              <>
                <Image 
                  source={{ uri: localImage || item.image }} 
                  style={styles.image}
                  onError={(e) => console.log('Image failed to load:', e.nativeEvent.error)}
                />
                <View style={styles.imageOverlay}>
                  <View style={styles.changeButton}>
                    <Ionicons name="camera" size={20} color="white" />
                    <Text style={styles.changeButtonText}>Change</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <View style={styles.uploadIcon}>
                  <Ionicons name="camera-outline" size={40} color="#8B5CF6" />
                </View>
                <Text style={styles.imagePlaceholderTitle}>Add Photo</Text>
                <Text style={styles.imagePlaceholderSubtitle}>Tap to upload image</Text>
              </View>
            )}
            {isUploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="restaurant-outline" size={20} color="#6366F1" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Item name *"
                value={item.name}
                onChangeText={(text) => setItem({ ...item, name: text })}
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={[styles.inputContainer, styles.inputContainerMultiline]}>
              <View style={[styles.inputIconContainer, styles.inputIconContainerMultiline]}>
                <Ionicons name="document-text-outline" size={20} color="#6366F1" />
              </View>
              <TextInput
                style={[styles.textInput, styles.textInputMultiline]}
                placeholder="Description (optional)"
                value={item.description}
                onChangeText={(text) => setItem({ ...item, description: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="cash-outline" size={20} color="#6366F1" />
              </View>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={[styles.textInput, { paddingLeft: 8 }]}
                placeholder="Price *"
                value={item.price}
                onChangeText={(text) => setItem({ ...item, price: text })}
                keyboardType="decimal-pad"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category *</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  item.category === category.id && styles.categoryCardSelected
                ]}
                onPress={() => setItem({ ...item, category: category.id })}
              >
                <Ionicons 
                  name={category.icon} 
                  size={24} 
                  color={item.category === category.id ? 'white' : '#6366F1'} 
                />
                <Text style={[
                  styles.categoryCardText,
                  item.category === category.id && styles.categoryCardTextSelected
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dietary Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Options</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                item.isVegetarian && styles.optionCardSelected
              ]}
              onPress={() => setItem({ ...item, isVegetarian: !item.isVegetarian })}
            >
              <Ionicons 
                name="leaf" 
                size={20} 
                color={item.isVegetarian ? 'white' : '#22C55E'} 
              />
              <Text style={[
                styles.optionCardText,
                item.isVegetarian && styles.optionCardTextSelected
              ]}>
                Vegetarian
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                item.isSpicy && styles.optionCardSelected
              ]}
              onPress={() => setItem({ ...item, isSpicy: !item.isSpicy })}
            >
              <Ionicons 
                name="flame" 
                size={20} 
                color={item.isSpicy ? 'white' : '#EF4444'} 
              />
              <Text style={[
                styles.optionCardText,
                item.isSpicy && styles.optionCardTextSelected
              ]}>
                Spicy
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Availability Toggle */}
        <View style={[styles.section, styles.lastSection]}>
          <TouchableOpacity
            style={styles.availabilityToggle}
            onPress={() => setItem({ ...item, is_available: !item.is_available })}
          >
            <View style={styles.availabilityInfo}>
              <Text style={styles.availabilityTitle}>Item Availability</Text>
              <Text style={[
                styles.availabilityStatus,
                { color: item.is_available ? '#22C55E' : '#EF4444' }
              ]}>
                {item.is_available ? 'Available' : 'Unavailable'}
              </Text>
            </View>
            <View style={[
              styles.toggleSwitch,
              item.is_available && styles.toggleSwitchActive
            ]}>
              <View style={[
                styles.toggleThumb,
                item.is_available && styles.toggleThumbActive
              ]} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.deleteButton, deleting && styles.buttonDisabled]}
          onPress={handleDelete}
          disabled={deleting || saving}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          )}
          <Text style={styles.deleteButtonText}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, (saving || deleting) && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving || deleting}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="checkmark" size={20} color="white" />
          )}
          <Text style={styles.saveButtonText}>
            {isUploading ? 'Uploading...' : saving ? 'Saving...' : 'Save Changes'}
          </Text>
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
  content: {
    flex: 1,
    padding: 20,
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
  lastSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  changeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePlaceholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  imagePlaceholderSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
  },
  inputIconContainer: {
    marginRight: 12,
  },
  inputIconContainerMultiline: {
    paddingTop: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  textInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
    marginRight: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  categoryCardSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  categoryCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  categoryCardTextSelected: {
    color: 'white',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  optionCardSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  optionCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 8,
  },
  optionCardTextSelected: {
    color: 'white',
  },
  availabilityToggle: {
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
  },
  availabilityStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  toggleSwitch: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#22C55E',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  saveButton: {
    flex: 2,
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
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
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

export default EditMenuItemScreen; 