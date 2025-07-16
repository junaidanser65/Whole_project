import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Animated,
  Text,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import { LinearGradient } from 'expo-linear-gradient';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';
import { updateProfile, apiClient } from '../../services/api';

const EditProfileScreen = ({ navigation, route }) => {
  const { user, updateUser } = useAuth();
  const { refreshProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(
    user?.profile_image || 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'
  );
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    business_name: user?.business_name || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    profile_image: user?.profile_image || profileImage,
  });
  const [errors, setErrors] = useState({});
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Add useEffect to fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.id) {
          console.log('Fetching profile for user ID:', user.id);
          const { profile } = await apiClient.getProfileById(user.id);
          console.log('Profile data received:', profile);
          
          if (profile) {
            setProfileImage(profile.profile_image || profileImage);
            setFormData(prev => ({
              ...prev,
              name: profile.name || prev.name,
              email: profile.email || prev.email,
              business_name: profile.business_name || prev.business_name,
              phone_number: profile.phone_number || prev.phone_number,
              address: profile.address || prev.address,
              profile_image: profile.profile_image || prev.profile_image
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
    
    // Animate form entrance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [user?.id]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to change your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Image picker result:', result);
      
      if (!result.canceled && result.assets[0]) {
        setImageUploading(true);
        try {
          // Upload to Cloudinary
          const uploadResult = await uploadImageToCloudinary(result.assets[0].uri);
          console.log('Cloudinary upload result:', uploadResult);

          if (uploadResult.success) {
            const newImageUrl = uploadResult.imageUrl;
            setProfileImage(newImageUrl);
            setFormData(prev => ({ 
              ...prev, 
              profile_image: newImageUrl 
            }));
            
            // Update the user context immediately with the new image
            if (updateUser) {
              await updateUser({
                ...user,
                profile_image: newImageUrl
              });
            }
          } else {
            Alert.alert('Error', 'Failed to upload image. Please try again.');
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          Alert.alert('Error', 'Failed to upload image to cloud storage.');
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    
    // Required field validations
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.business_name.trim()) newErrors.business_name = 'Business description is required';
    
    // Phone number format validation
    if (formData.phone_number.trim() && !/^\+?\d{10,12}$/.test(formData.phone_number.trim())) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }

    // Email format validation
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (saving || imageUploading) return;

    if (!validateForm()) {
      Alert.alert('Invalid Information', 'Please check the highlighted fields and try again.');
      return;
    }

    setSaving(true);
    try {
      const currentProfileImage = formData.profile_image || profileImage;
      
      const profileData = {
        name: formData.name?.trim() || '',
        business_name: formData.business_name?.trim() || '',
        phone_number: formData.phone_number?.trim() || '',
        address: formData.address?.trim() || '',
        profile_image: currentProfileImage
      };

      console.log('Submitting form data:', profileData);

      const response = await updateProfile(profileData);
      console.log('Profile update response:', response);
      
      if (response.success) {
        if (updateUser) {
          const updatedUser = {
            ...user,
            ...profileData,
            profile_image: profileData.profile_image
          };
          console.log('Updating user context with:', updatedUser);
          await updateUser(updatedUser);
        }
        
        // Refresh profile data
        if (refreshProfile) {
          await refreshProfile();
        }
        
        if (route.params?.onProfileUpdate) {
          route.params.onProfileUpdate();
        }
        
        setTimeout(() => {
          Alert.alert('Success', 'Profile updated successfully', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        }, 100);
      } else {
        const errorMessage = response.error || response.message || 'Failed to update profile';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message || 'Failed to save profile changes. Please try again.');
    } finally {
      setSaving(false);
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
            setFormData({
              name: user?.name || '',
              email: user?.email || '',
              business_name: user?.business_name || '',
              phone_number: user?.phone_number || '',
              address: user?.address || '',
              profile_image: user?.profile_image || profileImage,
            });
            setProfileImage(user?.profile_image || 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png');
            setErrors({});
          }
        },
      ]
    );
  };

  const renderInput = ({ 
    label, 
    value, 
    onChangeText, 
    icon, 
    keyboardType = 'default', 
    editable = true,
    multiline = false,
    placeholder,
    fieldKey
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[
        styles.inputContainer, 
        errors[fieldKey] && styles.inputContainerError,
        !editable && styles.inputContainerDisabled
      ]}>
        <View style={styles.inputIconContainer}>
          <Ionicons name={icon} size={20} color={editable ? "#6366F1" : "#94A3B8"} />
        </View>
        <TextInput
          style={[styles.textInput, multiline && styles.textInputMultiline]}
          placeholder={placeholder || label}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            if (errors[fieldKey]) {
              setErrors(prev => ({ ...prev, [fieldKey]: '' }));
            }
          }}
          keyboardType={keyboardType}
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          placeholderTextColor="#94A3B8"
        />
        {!editable && (
          <View style={styles.lockedIndicator}>
            <Ionicons name="lock-closed" size={16} color="#94A3B8" />
          </View>
        )}
      </View>
      {errors[fieldKey] && (
        <Text style={styles.errorText}>{errors[fieldKey]}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header and Profile Image Section */}
          <Animated.View style={[styles.imageSection, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={["#6366F1", "#8B5CF6", "#A855F7"]}
              style={styles.imageGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity 
                  style={styles.headerButton} 
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                
                <View style={styles.headerCenter}>
                  <Text style={styles.headerTitle}>Edit Profile</Text>
                  <Text style={styles.headerSubtitle}>Update your information</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={pickImage}
                style={styles.avatarContainer}
                disabled={imageUploading}
              >
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.avatar}
                  />
                  {imageUploading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="large" color="#FFFFFF" />
                    </View>
                  )}
                  <View style={styles.avatarAccessory}>
                    <Ionicons name="camera" size={20} color="white" />
                  </View>
                </View>
              </TouchableOpacity>
              
              <Text style={styles.changePhotoText}>
                {imageUploading ? 'Uploading...' : 'Tap to change photo'}
              </Text>
              <Text style={styles.changePhotoSubtext}>
                Choose a professional photo for your business
              </Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.form, { opacity: fadeAnim }]}>
            {/* Personal Information */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={20} color="#6366F1" style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              
              {renderInput({
                label: "Full Name",
                value: formData.name,
                onChangeText: (text) => setFormData({ ...formData, name: text }),
                icon: "person-outline",
                placeholder: "Enter your full name",
                fieldKey: "name"
              })}

              {renderInput({
                label: "Email Address",
                value: formData.email,
                onChangeText: (text) => setFormData({ ...formData, email: text }),
                icon: "mail-outline",
                keyboardType: "email-address",
                editable: false,
                placeholder: "Your email address",
                fieldKey: "email"
              })}

              {renderInput({
                label: "Phone Number",
                value: formData.phone_number,
                onChangeText: (text) => setFormData({ ...formData, phone_number: text }),
                icon: "call-outline",
                keyboardType: "phone-pad",
                placeholder: "Enter your phone number",
                fieldKey: "phone_number"
              })}
            </View>

            {/* Business Information */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="business-outline" size={20} color="#6366F1" style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Business Information</Text>
              </View>
              
              {renderInput({
                label: "Business Description",
                value: formData.business_name,
                onChangeText: (text) => setFormData({ ...formData, business_name: text }),
                icon: "storefront-outline",
                placeholder: "Enter your business description",
                fieldKey: "business_name"
              })}

              {renderInput({
                label: "Business Address",
                value: formData.address,
                onChangeText: (text) => setFormData({ ...formData, address: text }),
                icon: "location-outline",
                multiline: true,
                placeholder: "Enter your complete business address",
                fieldKey: "address"
              })}
            </View>

            <View style={styles.spacing} />
          </Animated.View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cancelButton, saving && styles.buttonDisabled]}
            onPress={() => navigation.goBack()}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color="#EF4444" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, (saving || imageUploading) && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving || imageUploading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={saving ? ['#94A3B8', '#94A3B8'] : ['#6366F1', '#8B5CF6']}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="checkmark" size={18} color="white" />
              )}
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
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
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageGradient: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarAccessory: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  changePhotoSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    paddingHorizontal: 20,
  },
  formSection: {
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
    marginBottom: 20,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
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
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputContainerDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  inputIconContainer: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
  },
  textInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
    paddingBottom: 8,
  },
  lockedIndicator: {
    marginLeft: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelButton: {
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
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  saveButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
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
  spacing: {
    height: 24,
  },
});

export default EditProfileScreen;