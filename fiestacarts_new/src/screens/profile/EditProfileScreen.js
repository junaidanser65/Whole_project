import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity, Text } from 'react-native';
import { Button, Input, Icon, Avatar } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';

export default function EditProfileScreen({ navigation }) {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    avatar_url: user?.avatar_url || null,
  });

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setLoading(true);
        try {
          const uploadResult = await uploadImageToCloudinary(result.assets[0].uri);
          
          if (uploadResult.success) {
            setFormData(prev => ({ ...prev, avatar_url: uploadResult.imageUrl }));
          } else {
            throw new Error(uploadResult.error || 'Failed to upload image');
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to upload image');
          console.error('Upload error:', error);
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name: formData.name,
        phone_number: formData.phone_number,
        address: formData.address,
        avatar_url: formData.avatar_url,
      });
      navigation.goBack();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBackground} />
      <TouchableOpacity style={styles.backButtonContainer} onPress={() => navigation.goBack()}>
        <View style={styles.backButtonCircle}>
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </View>
      </TouchableOpacity>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity 
            style={styles.avatarWrapper} 
            onPress={handleImagePick}
            disabled={loading}
          >
            <Avatar
              size={120}
              rounded
              source={formData.avatar_url ? { uri: formData.avatar_url } : undefined}
              icon={!formData.avatar_url ? { name: 'person', type: 'material' } : undefined}
              containerStyle={styles.avatar}
            >
              <Avatar.Accessory 
                size={36} 
                style={styles.avatarAccessory}
              />
            </Avatar>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Input
            label="Full Name"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            containerStyle={styles.inputContainer}
            inputContainerStyle={styles.input}
            labelStyle={styles.inputLabel}
            autoCapitalize="words"
            placeholder="Enter your full name"
          />

          <Input
            label="Email"
            value={formData.email}
            disabled
            containerStyle={styles.inputContainer}
            inputContainerStyle={[styles.input, styles.disabledInput]}
            labelStyle={styles.inputLabel}
            inputStyle={styles.disabledText}
            rightIcon={<Icon name="lock" size={20} color={colors.textLight} />}
          />

          <Input
            label="Phone Number"
            value={formData.phone_number}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phone_number: text }))}
            containerStyle={styles.inputContainer}
            inputContainerStyle={styles.input}
            labelStyle={styles.inputLabel}
            keyboardType="phone-pad"
            placeholder="Enter your phone number"
          />

          <Input
            label="Address"
            value={formData.address}
            onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
            containerStyle={styles.inputContainer}
            inputContainerStyle={styles.input}
            labelStyle={styles.inputLabel}
            multiline
            numberOfLines={3}
            placeholder="Enter your address"
          />
        </View>

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          buttonStyle={styles.saveButton}
          containerStyle={styles.saveButtonContainer}
          titleStyle={styles.saveButtonText}
          loadingProps={{ color: colors.white }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButtonContainer: {
    position: 'absolute',
    top: spacing.xl + spacing.xs,
    left: spacing.md,
    zIndex: 1,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  content: {
    paddingTop: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  avatarWrapper: {
    alignItems: 'center',
  },
  avatar: {
    borderWidth: 4,
    borderColor: colors.black,
  },
  avatarAccessory: {
    backgroundColor: colors.primary,
    borderColor: colors.black,
  },
  changePhotoText: {
    ...typography.body,
    color: colors.black,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  formContainer: {
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 48,
    backgroundColor: colors.surface,
  },
  disabledInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    opacity: 0.7,
  },
  disabledText: {
    color: colors.textLight,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    height: 56,
  },
  saveButtonText: {
    ...typography.button,
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
}); 