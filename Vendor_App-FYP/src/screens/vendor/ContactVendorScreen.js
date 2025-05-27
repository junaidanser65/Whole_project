import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Image,
  Animated,
} from 'react-native';
import { Text, Input, Button, Icon, Avatar, Overlay } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

const subjectOptions = [
  'General Inquiry',
  'Booking Request',
  'Pricing Question',
  'Availability Check',
  'Other',
];

const ContactVendorScreen = ({ route, navigation }) => {
  const { vendor } = route.params;
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSend = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual message sending logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setAttachment(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const renderSuccessModal = () => (
    <Overlay
      isVisible={showSuccessModal}
      onBackdropPress={() => {
        setShowSuccessModal(false);
        navigation.goBack();
      }}
      overlayStyle={styles.modal}
    >
      <View style={styles.modalContent}>
        <LinearGradient
          colors={['#FF9A8B', '#FF6A88', '#FF99AC']}
          style={styles.modalGradient}
        >
          <Icon
            name="check-circle"
            type="material"
            size={60}
            color="#FFFFFF"
          />
        </LinearGradient>
        <Text h4 style={styles.modalTitle}>Message Sent!</Text>
        <Text style={styles.modalText}>Your message has been successfully sent to {vendor.name}.</Text>
        <Button
          title="OK"
          onPress={() => {
            setShowSuccessModal(false);
            navigation.goBack();
          }}
          buttonStyle={styles.modalButton}
          titleStyle={styles.modalButtonText}
        />
      </View>
    </Overlay>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView style={styles.content}>
            <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
              <LinearGradient
                colors={['#FF9A8B', '#FF6A88', '#FF99AC']}
                style={styles.avatarGradient}
              >
                <Avatar
                  rounded
                  size={100}
                  source={{ uri: vendor.image || 'https://via.placeholder.com/150' }}
                  containerStyle={styles.avatar}
                />
              </LinearGradient>
              <Text h4 style={styles.title}>Contact {vendor.name}</Text>
              <Text style={styles.subtitle}>
                Send a message to inquire about services or ask questions
              </Text>
            </Animated.View>

            <Animated.View style={[styles.form, { opacity: fadeAnim }]}>
              <View style={styles.pickerContainer}>
                <Text style={styles.inputLabel}>Subject</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formData.subject}
                    onValueChange={(itemValue) => setFormData({ ...formData, subject: itemValue })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select a subject" value="" color="#636E72" />
                    {subjectOptions.map((option, index) => (
                      <Picker.Item key={index} label={option} value={option} color="#2D3436" />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.messageInputContainer}>
                <Text style={styles.inputLabel}>Message</Text>
                <Input
                  placeholder="Type your message here..."
                  value={formData.message}
                  onChangeText={(text) => setFormData({ ...formData, message: text })}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  inputContainerStyle={styles.messageField}
                  inputStyle={styles.messageInput}
                  disabled={loading}
                  maxLength={500}
                />
                <Text style={styles.charCount}>{formData.message.length}/500</Text>
              </View>

              <TouchableWithoutFeedback onPress={pickImage}>
                <View style={styles.attachmentButton}>
                  <Icon name="attach-file" type="material" size={24} color="#FF6B6B" />
                  <Text style={styles.attachmentText}>
                    {attachment ? 'Change attachment' : 'Add attachment'}
                  </Text>
                </View>
              </TouchableWithoutFeedback>

              {attachment && (
                <View style={styles.attachmentPreviewContainer}>
                  <Image source={{ uri: attachment }} style={styles.attachmentPreview} />
                  <TouchableWithoutFeedback onPress={() => setAttachment(null)}>
                    <View style={styles.removeAttachment}>
                      <Icon name="close" type="material" size={20} color="#FFFFFF" />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              )}

              <View style={styles.vendorInfo}>
                <LinearGradient
                  colors={['#FF9A8B33', '#FF6A8833', '#FF99AC33']}
                  style={styles.infoGradient}
                >
                  <Icon
                    name="info"
                    type="material"
                    size={20}
                    color="#FF6B6B"
                  />
                  <Text style={styles.infoText}>
                    Average response time: 24 hours
                  </Text>
                </LinearGradient>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Cancel"
                  onPress={() => navigation.goBack()}
                  buttonStyle={styles.cancelButton}
                  titleStyle={styles.cancelButtonText}
                  containerStyle={styles.buttonWrapper}
                />
                <Button
                  title={loading ? 'Sending...' : 'Send Message'}
                  onPress={handleSend}
                  disabled={loading}
                  loading={loading}
                  icon={
                    !loading && (
                      <Icon
                        name="send"
                        type="material"
                        size={20}
                        color="#FFFFFF"
                        style={styles.sendIcon}
                      />
                    )
                  }
                  buttonStyle={styles.sendButton}
                  containerStyle={styles.buttonWrapper}
                />
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      {renderSuccessModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarGradient: {
    padding: 3,
    borderRadius: 55,
    marginBottom: 20,
  },
  avatar: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  title: {
    color: '#2D3436',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#636E72',
    lineHeight: 22,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#DFE6E9',
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    overflow: 'hidden',
  },
  picker: {
    height: 60,
  },
  messageInputContainer: {
    marginBottom: 20,
  },
  messageField: {
    borderWidth: 1,
    borderColor: '#DFE6E9',
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F8F9FA',
    minHeight: 120,
  },
  messageInput: {
    fontSize: 16,
    color: '#2D3436',
    paddingTop: 12,
  },
  charCount: {
    textAlign: 'right',
    color: '#636E72',
    fontSize: 12,
    marginTop: 5,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  attachmentText: {
    marginLeft: 10,
    color: '#FF6B6B',
    fontSize: 16,
  },
  attachmentPreviewContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  attachmentPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeAttachment: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 5,
  },
  vendorInfo: {
    marginBottom: 25,
  },
  infoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
  },
  infoText: {
    marginLeft: 10,
    color: '#2D3436',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 15,
  },
  cancelButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 15,
  },
  sendIcon: {
    marginRight: 10,
  },
  modal: {
    width: '85%',
    borderRadius: 20,
    padding: 0,
    overflow: 'hidden',
  },
  modalContent: {
    alignItems: 'center',
    padding: 25,
  },
  modalGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    marginBottom: 15,
    color: '#2D3436',
  },
  modalText: {
    textAlign: 'center',
    marginBottom: 25,
    color: '#636E72',
    fontSize: 16,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalButtonText: {
    fontSize: 16,
  },
});

export default ContactVendorScreen;