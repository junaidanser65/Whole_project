import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text as RNText,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { createMenu } from '../../services/menuService';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';

const CATEGORIES = [
  { value: 'appetizers', label: 'Appetizers', icon: 'leaf-outline' },
  { value: 'main', label: 'Main Course', icon: 'pizza-outline' },
  { value: 'desserts', label: 'Desserts', icon: 'ice-cream-outline' },
  { value: 'drinks', label: 'Drinks', icon: 'wine-outline' },
  { value: 'side', label: 'Side Dishes', icon: 'fast-food-outline' },
];

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
            onPress: () => navigation.navigate("MainApp", { screen: "Menu" }),
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

  const resetForm = () => {
    setItemName("");
    setDescription("");
    setPrice("");
    setCategory("main");
    setImage(null);
    setPreparationTime("");
    setIsVegetarian(false);
    setIsSpicy(false);
    setErrors({});
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Modern Header */}
            <View style={styles.headerContainer}>
              <LinearGradient
                colors={["#6366F1", "#8B5CF6", "#A855F7"]}
                style={styles.headerGradient}
              >
                <View style={styles.headerContent}>
                  <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                  >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  
                  <View style={styles.headerTitleSection}>
                    <RNText style={styles.headerTitle}>Add Menu Item</RNText>
                    <RNText style={styles.headerSubtitle}>
                      Create a delicious new dish for your menu
                    </RNText>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.resetButton}
                    onPress={resetForm}
                  >
                    <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.formContainer}>
              {/* Image Upload Section */}
              <View style={styles.imageSection}>
                <RNText style={styles.sectionTitle}>Item Photo</RNText>
                <TouchableOpacity 
                  style={[styles.imageUpload, errors.image && styles.imageUploadError]} 
                  onPress={pickImage}
                  activeOpacity={0.7}
                >
                  {image ? (
                    <View style={styles.imageContainer}>
                      <Image source={{ uri: image }} style={styles.uploadedImage} />
                      {isUploading && (
                        <View style={styles.uploadingOverlay}>
                          <ActivityIndicator size="large" color="#FFFFFF" />
                          <RNText style={styles.uploadingText}>Uploading...</RNText>
                        </View>
                      )}
                      <View style={styles.imageActions}>
                        <TouchableOpacity 
                          style={styles.changeImageButton}
                          onPress={pickImage}
                        >
                          <Ionicons name="camera-outline" size={16} color="#6366F1" />
                          <RNText style={styles.changeImageText}>Change</RNText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <View style={styles.uploadIconContainer}>
                        <Ionicons name="camera-outline" size={32} color="#6366F1" />
                      </View>
                      <RNText style={styles.uploadTitle}>Add Photo</RNText>
                      <RNText style={styles.uploadSubtitle}>Tap to upload an image of your dish</RNText>
                    </View>
                  )}
                </TouchableOpacity>
                {errors.image && <RNText style={styles.errorText}>{errors.image}</RNText>}
              </View>

              {/* Basic Information */}
              <View style={styles.formSection}>
                <RNText style={styles.sectionTitle}>Basic Information</RNText>
                
                <View style={styles.inputGroup}>
                  <RNText style={styles.inputLabel}>Item Name *</RNText>
                  <View style={[styles.inputContainer, errors.itemName && styles.inputContainerError]}>
                    <Ionicons name="restaurant-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={itemName}
                      onChangeText={setItemName}
                      placeholder="Enter item name"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  {errors.itemName && <RNText style={styles.errorText}>{errors.itemName}</RNText>}
                </View>

                <View style={styles.inputGroup}>
                  <RNText style={styles.inputLabel}>Description *</RNText>
                  <View style={[styles.inputContainer, styles.textAreaContainer, errors.description && styles.inputContainerError]}>
                    <Ionicons name="document-text-outline" size={20} color="#94A3B8" style={[styles.inputIcon, styles.textAreaIcon]} />
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Describe your dish..."
                      placeholderTextColor="#94A3B8"
                      multiline
                      numberOfLines={4}
                    />
                  </View>
                  {errors.description && <RNText style={styles.errorText}>{errors.description}</RNText>}
                </View>

                <View style={styles.inputGroup}>
                  <RNText style={styles.inputLabel}>Price *</RNText>
                  <View style={[styles.inputContainer, errors.price && styles.inputContainerError]}>
                    <Ionicons name="cash-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <RNText style={styles.currencySymbol}>$</RNText>
                    <TextInput
                      style={[styles.textInput, styles.priceInput]}
                      value={price}
                      onChangeText={setPrice}
                      placeholder="0.00"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                    />
                  </View>
                  {errors.price && <RNText style={styles.errorText}>{errors.price}</RNText>}
                </View>
              </View>

              {/* Category Selection */}
              <View style={styles.formSection}>
                <RNText style={styles.sectionTitle}>Category</RNText>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.categoryCard,
                        category === cat.value && styles.categoryCardActive,
                      ]}
                      onPress={() => setCategory(cat.value)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.categoryIconContainer,
                        category === cat.value && styles.categoryIconContainerActive,
                      ]}>
                        <Ionicons 
                          name={cat.icon} 
                          size={24} 
                          color={category === cat.value ? "#FFFFFF" : "#6366F1"} 
                        />
                      </View>
                      <RNText style={[
                        styles.categoryLabel,
                        category === cat.value && styles.categoryLabelActive,
                      ]}>
                        {cat.label}
                      </RNText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Dietary Options */}
              <View style={styles.formSection}>
                <RNText style={styles.sectionTitle}>Dietary Options</RNText>
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={[styles.optionCard, isVegetarian && styles.optionCardActive]}
                    onPress={() => setIsVegetarian(!isVegetarian)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.optionIconContainer, isVegetarian && styles.optionIconContainerActive]}>
                      <Ionicons 
                        name="leaf-outline" 
                        size={20} 
                        color={isVegetarian ? "#FFFFFF" : "#10B981"} 
                      />
                    </View>
                    <RNText style={[styles.optionText, isVegetarian && styles.optionTextActive]}>
                      Vegetarian
                    </RNText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.optionCard, isSpicy && styles.optionCardActive]}
                    onPress={() => setIsSpicy(!isSpicy)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.optionIconContainer, isSpicy && styles.optionIconContainerActive]}>
                      <Ionicons 
                        name="flame-outline" 
                        size={20} 
                        color={isSpicy ? "#FFFFFF" : "#EF4444"} 
                      />
                    </View>
                    <RNText style={[styles.optionText, isSpicy && styles.optionTextActive]}>
                      Spicy
                    </RNText>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity 
                style={[styles.submitButton, isUploading && styles.submitButtonDisabled]} 
                onPress={handleSubmit}
                disabled={isUploading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isUploading ? ["#94A3B8", "#94A3B8"] : ["#6366F1", "#8B5CF6"]}
                  style={styles.submitButtonGradient}
                >
                  {isUploading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <RNText style={styles.submitButtonText}>Creating Item...</RNText>
                    </View>
                  ) : (
                    <View style={styles.submitButtonContent}>
                      <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                      <RNText style={styles.submitButtonText}>Add to Menu</RNText>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  
  // Header Styles
  headerContainer: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitleSection: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Form Styles
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  
  // Image Upload Styles
  imageSection: {
    marginBottom: 20,
  },
  imageUpload: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    backgroundColor: '#FFFFFF',
  },
  imageUploadError: {
    borderColor: '#EF4444',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  imageActions: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  changeImageText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  // Input Styles
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#0F172A',
    letterSpacing: -0.1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
  },
  textAreaContainer: {
    height: 120,
    alignItems: 'flex-start',
  },
  textAreaIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 4,
    paddingBottom: 4,
  },
  priceInput: {
    paddingLeft: 8,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '700',
    marginRight: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  
  // Category Styles
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCardActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
    borderWidth: 2,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconContainerActive: {
    backgroundColor: '#6366F1',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: '#6366F1',
    fontWeight: '700',
  },
  
  // Dietary Options Styles
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCardActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
    borderWidth: 2,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionIconContainerActive: {
    backgroundColor: '#6366F1',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  optionTextActive: {
    color: '#6366F1',
    fontWeight: '700',
  },
  
  // Submit Button Styles
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: -0.1,
  },
  submitButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AddMenuItemScreen;