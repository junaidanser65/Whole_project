import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { Text, Input, Button, Avatar, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';
import { updateProfile } from '../../services/api';

const EditProfileScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profile_image || 'https://randomuser.me/api/portraits/men/1.jpg');  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    business_name: user?.business_name || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    profile_image: user?.profile_image || profileImage,
  });const [errors, setErrors] = useState({});
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Start with form already visible
    fadeAnim.setValue(1);
  }, []);
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
        quality: 0.8, // Slightly reduced quality for better performance
      });

      console.log('Image picker result:', result);      if (!result.canceled && result.assets[0]) {
        setLoading(true);
        try {
          // Upload to Cloudinary
          const uploadResult = await uploadImageToCloudinary(result.assets[0].uri);
          console.log('Cloudinary upload result:', uploadResult);

          if (uploadResult.success) {
            const newImageUrl = uploadResult.imageUrl;
            setProfileImage(newImageUrl);
            // Store the Cloudinary URL to be saved with other profile data
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
        fadeAnim.setValue(1);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setLoading(false);
    }
  };  const validateForm = () => {
    let newErrors = {};
    
    // Required field validations
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.business_name.trim()) newErrors.business_name = 'Business name is required';
    
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
    if (loading) return; // Prevent multiple submissions while loading

    // Validate form before submission
    if (!validateForm()) {
      Alert.alert('Required Fields', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {      // Ensure we have the latest profile image
      const currentProfileImage = formData.profile_image || profileImage;
      
      const profileData = {
        name: formData.name?.trim() || '',
        business_name: formData.business_name?.trim() || '',
        phone_number: formData.phone_number?.trim() || '',
        address: formData.address?.trim() || '',
        profile_image: currentProfileImage
      };

      // Check for empty required fields before submission
      const requiredFields = ['name', 'business_name', 'phone_number', 'address'];
      const emptyFields = requiredFields.filter(field => !profileData[field]);
      
      if (emptyFields.length > 0) {
        Alert.alert('Required Fields', `Please fill in: ${emptyFields.join(', ')}`);
        setLoading(false);
        return;
      }

      console.log('Submitting form data:', profileData);

      const response = await updateProfile(profileData);

      console.log('Profile update response:', response);      if (response.success) {
        // Update local user context if available
        if (updateUser) {
          // Ensure we're updating the user context with the latest data
          const updatedUser = {
            ...user,
            ...profileData,
            profile_image: profileData.profile_image // Explicitly set profile image
          };
          console.log('Updating user context with:', updatedUser);
          await updateUser(updatedUser);
        }
        
        // Add a small delay to ensure state updates are processed
        setTimeout(() => {
          Alert.alert('Success', 'Profile updated successfully');
          navigation.goBack();
        }, 100);
      } else {
        const errorMessage = response.error || response.message || 'Failed to update profile';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message || 'Failed to save profile changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (placeholder, value, onChange, icon, keyboardType = 'default', disabled = false) => (
    <Input
      placeholder={placeholder}
      value={value}
      onChangeText={(text) => {
        onChange(text);
        setErrors({ ...errors, [placeholder.toLowerCase()]: '' });
      }}
      leftIcon={<Icon name={icon} type="material" size={24} color="#B2BEC3" />}
      containerStyle={styles.inputContainer}
      inputContainerStyle={styles.input}
      errorStyle={{ color: '#FF6B6B' }}
      errorMessage={errors[placeholder.toLowerCase()] || ''}
      keyboardType={keyboardType}
      disabled={disabled}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.content}>
          <Animated.View style={styles.header}>
            <LinearGradient
              colors={["#ff4500", "#cc3700"]}
              style={styles.gradientBackground}
            >
              {/* Back Button */}
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Icon name="arrow-back" size={28} color="#FFF" />
              </TouchableOpacity>

              {/* Profile Image */}
              <TouchableOpacity
                onPress={pickImage}
                style={styles.avatarContainer}
              >
                <Avatar
                  size={120}
                  rounded
                  source={{ uri: profileImage }}
                  containerStyle={styles.avatar}
                >
                  <Avatar.Accessory size={36} onPress={pickImage} />
                </Avatar>
              </TouchableOpacity>

              {/* Change Photo Text */}
              <Text style={styles.changePhotoText}>Tap to change photo</Text>
            </LinearGradient>
          </Animated.View>
          <Animated.View style={[styles.form, { opacity: fadeAnim }]}>            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Business Information</Text>
              {renderInput(
                "Full Name",
                formData.name,
                (text) => setFormData({ ...formData, name: text }),
                "person"
              )}
              {renderInput(
                "Business Name",
                formData.business_name,
                (text) => setFormData({ ...formData, business_name: text }),
                "business"
              )}
              {renderInput(
                "Email",
                formData.email,
                (text) => setFormData({ ...formData, email: text }),
                "email",
                "email-address",
                true
              )}
              {renderInput(
                "Phone Number",
                formData.phone_number,
                (text) => setFormData({ ...formData, phone_number: text }),
                "phone",
                "phone-pad"
              )}
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Location</Text>
              {renderInput(
                "Business Address",
                formData.address,
                (text) => setFormData({ ...formData, address: text }),
                "home"
              )}
            </View>
          </Animated.View>

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              type="outline"
              onPress={() => navigation.goBack()}
              buttonStyle={styles.cancelButton}
              titleStyle={styles.cancelButtonText}
              containerStyle={styles.buttonWrapper}
            />
            <Button
              title={loading ? "Saving..." : "Save Changes"}
              onPress={handleSave}
              loading={loading}
              buttonStyle={styles.saveButton}
              containerStyle={styles.buttonWrapper}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  gradientBackground: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 1,
  },
  avatarContainer: {
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  avatar: {
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  changePhotoText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  form: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  formSection: {
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2D3436",
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderBottomWidth: 0,
    backgroundColor: "#F0F3F5",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    borderColor: "#ff4500",
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: "#ff4500",
  },
  saveButton: {
    backgroundColor: "#ff4500",
    paddingVertical: 12,
    borderRadius: 12,
  },
});

export default EditProfileScreen;