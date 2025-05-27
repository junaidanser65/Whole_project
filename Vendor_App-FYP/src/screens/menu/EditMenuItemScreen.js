import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text, Input, Button, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { getMenuById, updateMenu, deleteMenu } from '../../services/menuService';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';

const EditMenuItemScreen = ({ route, navigation }) => {
  const { itemId } = route.params;
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localImage, setLocalImage] = useState(null); // For temporary local image URI
  
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
            is_available: response.menu_item.is_available !== false
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
      quality: 1,
    });

    if (!result.canceled) {
      setLocalImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!item.name || !item.price || !item.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    setIsUploading(true);
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
        is_available: item.is_available
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
      setLoading(false);
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this menu item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
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
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  if (loading && !item) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text style={styles.loadingText}>Loading menu item...</Text>
      </SafeAreaView>
    );
  }
  
  if (error && !item) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="error-outline" type="material" size={60} color="#FF4500" />
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          title="Go Back" 
          onPress={() => navigation.goBack()} 
          buttonStyle={styles.errorButton}
        />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.imageContainer} onPress={handleImagePick}>
          {(localImage || item.image) ? (
            <Image 
              source={{ uri: localImage || item.image }} 
              style={styles.image}
              onError={(e) => console.log('Image failed to load:', e.nativeEvent.error)}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="add-photo-alternate" type="material" size={40} color="#636E72" />
              <Text style={styles.imagePlaceholderText}>Add Photo</Text>
            </View>
          )}
          {isUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          )}
        </TouchableOpacity>

        <Input
          label="Item Name*"
          value={item.name}
          onChangeText={(text) => setItem({ ...item, name: text })}
          containerStyle={styles.inputContainer}
        />

        <Input
          label="Description"
          value={item.description}
          onChangeText={(text) => setItem({ ...item, description: text })}
          multiline
          containerStyle={styles.inputContainer}
        />

        <Input
          label="Price*"
          value={item.price}
          onChangeText={(text) => setItem({ ...item, price: text })}
          keyboardType="decimal-pad"
          leftIcon={<Text style={styles.currencySymbol}>$</Text>}
          containerStyle={styles.inputContainer}
        />

        <Input
          label="Category*"
          value={item.category}
          onChangeText={(text) => setItem({ ...item, category: text })}
          containerStyle={styles.inputContainer}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Delete Item"
          onPress={handleDelete}
          buttonStyle={styles.deleteButton}
          containerStyle={[styles.buttonContainer, styles.deleteButtonContainer]}
          icon={
            <Icon
              name="delete"
              type="material"
              size={20}
              color="#FF6B6B"
              style={{ marginRight: 8 }}
            />
          }
          type="outline"
          disabled={loading || isUploading}
        />
        <Button
          title={isUploading ? "Uploading..." : "Save Changes"}
          onPress={handleSave}
          loading={loading}
          buttonStyle={styles.saveButton}
          containerStyle={styles.buttonContainer}
          disabled={isUploading}
        />
      </View>
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
    backgroundColor: '#F8F9FA',
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
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 30,
  },
  content: {
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#636E72',
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#636E72',
    marginRight: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F6FA',
    flexDirection: 'row',
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  deleteButtonContainer: {
    flex: 0.4,
  },
  saveButton: {
    backgroundColor: '#ff4500',
    borderRadius: 12,
    paddingVertical: 12,
  },
  deleteButton: {
    borderColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 12,
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
  },
});

export default EditMenuItemScreen; 