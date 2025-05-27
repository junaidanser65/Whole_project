import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { createMenu } from '../../services/menuService';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';
import { Icon } from 'react-native-elements';
import * as Permissions from 'expo-permissions';

const AddMenuItemScreen = ({ navigation }) => {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('main');
  const [image, setImage] = useState(null);
  const [preparationTime, setPreparationTime] = useState('');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isSpicy, setIsSpicy] = useState(false);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const checkPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Sorry, we need camera and gallery permissions to upload images.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    }
    return true;
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const pickImage = async () => {
    const hasPermissions = await checkPermissions();
    
    if (!hasPermissions) return;

    Alert.alert(
      'Choose Image',
      'Would you like to take a photo or choose from gallery?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: pickFromGallery,
        },
      ],
      { cancelable: true }
    );
  };

  const validateForm = () => {
    let tempErrors = {};

    if (!itemName) tempErrors.itemName = 'Item name is required';
    if (!description) tempErrors.description = 'Description is required';
    if (!price) tempErrors.price = 'Price is required';
    else if (isNaN(parseFloat(price))) tempErrors.price = 'Price must be a number';
    if (!image) tempErrors.image = 'Please upload an image';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsUploading(true);
      try {
        let imageUrl = null;
        if (image) {
          const uploadResult = await uploadImageToCloudinary(image);
          if (!uploadResult.success) {
            throw new Error(uploadResult.error || 'Failed to upload image');
          }
          imageUrl = uploadResult.imageUrl;
        }

        const menuItem = {
          name: itemName,
          description,
          price: parseFloat(price),
          category,
          image: imageUrl,
          is_available: true,
        };

        const response = await createMenu(menuItem);
        console.log("Menu item created:", response);

        Alert.alert("Success", "Menu item added successfully!", [
          {
            text: "Add Another",
            onPress: () => {
              setItemName("");
              setDescription("");
              setPrice("");
              setCategory("main");
              setImage(null);
              setPreparationTime("");
              setIsVegetarian(false);
              setIsSpicy(false);
              setErrors({});
            },
          },
          {
            text: "Go to Menu",
            onPress: () => navigation.navigate("Menu"),
          },
        ]);
      } catch (error) {
        console.error("Error creating menu item:", error);
        Alert.alert(
          "Error",
          error.message || "Something went wrong. Please try again."
        );
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add New Menu Item</Text>
          </View>

          <View style={styles.formContainer}>
            <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
              {image ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.uploadedImage} />
                  {isUploading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="large" color="#FFFFFF" />
                      <Text style={styles.uploadingText}>Uploading...</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Icon
                    name="add-photo-alternate"
                    type="material"
                    size={40}
                    color="#FF8C42"
                    style={styles.uploadIcon}
                  />
                  <Text style={styles.uploadText}>Tap to upload image</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Name*</Text>
              <TextInput
                style={[styles.input, styles.textInput, errors.itemName && styles.inputError]}
                value={itemName}
                onChangeText={setItemName}
                placeholder="Enter item name"
                placeholderTextColor="#999"
              />
              {errors.itemName && <Text style={styles.errorText}>{errors.itemName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description*</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter item description"
                placeholderTextColor="#999"
                multiline
              />
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price*</Text>
              <TextInput
                style={[styles.input, errors.price && styles.inputError]}
                value={price}
                onChangeText={setPrice}
                placeholder="Enter price"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Appetizer" value="appetizer" />
                  <Picker.Item label="Main Course" value="main" />
                  <Picker.Item label="Dessert" value="dessert" />
                  <Picker.Item label="Beverage" value="beverage" />
                  <Picker.Item label="Side Dish" value="side" />
                </Picker>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, isUploading && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Add Menu Item</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F2',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#FF8C42',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  imageUpload: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FF8C42',
    borderStyle: 'dashed',
    backgroundColor: '#FFF',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0E6',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadText: {
    color: '#FF8C42',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  uploadIcon: {
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 48,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  attributesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  attributeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF8C42',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  attributeButtonActive: {
    backgroundColor: '#FF8C42',
  },
  attributeText: {
    color: '#FF8C42',
    fontSize: 16,
    fontWeight: '500',
  },
  attributeTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
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

export default AddMenuItemScreen;