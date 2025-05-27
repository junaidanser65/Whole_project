import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity, Text } from 'react-native';
import { Button, Input, Icon, Avatar } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function EditProfileScreen({ navigation }) {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
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
          const filePath = `${user.id}/${new Date().getTime()}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, {
              uri: result.assets[0].uri,
              type: 'image/jpeg',
              name: 'avatar.jpg',
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
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
    if (!formData.first_name || !formData.last_name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
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
            label="First Name"
            value={formData.first_name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, first_name: text }))}
            containerStyle={styles.inputContainer}
            inputContainerStyle={styles.input}
            labelStyle={styles.inputLabel}
            autoCapitalize="words"
            placeholder="Enter your first name"
          />

          <Input
            label="Last Name"
            value={formData.last_name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, last_name: text }))}
            containerStyle={styles.inputContainer}
            inputContainerStyle={styles.input}
            labelStyle={styles.inputLabel}
            autoCapitalize="words"
            placeholder="Enter your last name"
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