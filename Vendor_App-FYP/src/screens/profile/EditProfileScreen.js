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
  Text as RNText,
  Switch,
} from 'react-native';
import { Input, Button, Avatar, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';

const EditProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg');
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zip_code || '',
  });
  const [errors, setErrors] = useState({});
  const fadeAnim = new Animated.Value(0);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || false);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
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
        quality: 0.7,
      });
  
      if (!result.canceled && result.assets[0].uri) {
        try {
          setLoading(true);
          const uri = result.assets[0].uri;
          
          // Set the local image first for immediate feedback
          setProfileImage(uri);
          
          // Upload to Cloudinary
          const uploadResult = await uploadImageToCloudinary(uri);
          if (uploadResult && uploadResult.imageUrl) {
            setProfileImage(uploadResult.imageUrl);
          } else {
            throw new Error('Failed to get upload URL');
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          Alert.alert(
            'Upload Failed',
            'Failed to upload image to server. Please try again.',
            [{ text: 'OK' }]
          );
          // Revert to previous image if upload fails
          setProfileImage(user?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg');
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setLoading(false);
    }
  };  

  const validateForm = () => {
    let newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    // Add more validations as needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Implement the actual profile update logic with Supabase
      const updatedProfile = {
        ...formData,
        isAvailable,
      };
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
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
              <RNText style={styles.changePhotoText}>Tap to change photo</RNText>
            </LinearGradient>
          </Animated.View>
          <Animated.View style={[styles.form, { opacity: fadeAnim }]}>
            <View style={styles.formSection}>
              <RNText style={styles.sectionTitle}>Availability Status</RNText>
              <View style={styles.availabilityContainer}>
                <RNText style={styles.availabilityText}>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </RNText>
                <Switch
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={isAvailable ? '#ff4500' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => setIsAvailable(previousState => !previousState)}
                  value={isAvailable}
                  style={styles.switch}
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <RNText style={styles.sectionTitle}>Personal Information</RNText>
              {renderInput(
                "First Name",
                formData.firstName,
                (text) => setFormData({ ...formData, firstName: text }),
                "person"
              )}
              {renderInput(
                "Last Name",
                formData.lastName,
                (text) => setFormData({ ...formData, lastName: text }),
                "person"
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
                formData.phone,
                (text) => setFormData({ ...formData, phone: text }),
                "phone",
                "phone-pad"
              )}
            </View>

            <View style={styles.formSection}>
              <RNText style={styles.sectionTitle}>Address</RNText>
              {renderInput(
                "Address",
                formData.address,
                (text) => setFormData({ ...formData, address: text }),
                "home"
              )}
              {renderInput(
                "City",
                formData.city,
                (text) => setFormData({ ...formData, city: text }),
                "location-city"
              )}
              {renderInput(
                "State",
                formData.state,
                (text) => setFormData({ ...formData, state: text }),
                "place"
              )}
              {renderInput(
                "ZIP Code",
                formData.zipCode,
                (text) => setFormData({ ...formData, zipCode: text }),
                "markunread-mailbox",
                "numeric"
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
    marginBottom: 10,
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
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F0F3F5',
    borderRadius: 10,
    marginBottom: 15,
  },
  availabilityText: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '500',
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
});

export default EditProfileScreen;