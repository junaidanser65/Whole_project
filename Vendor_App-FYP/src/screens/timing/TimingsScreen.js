import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Text as RNText,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Text, Icon, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { saveVendorTiming, formatTimingData } from '../../services/timingService';
import { useAuth } from '../../contexts/AuthContext';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DEFAULT_TIMINGS = {
  openTime: '09:00',
  closeTime: '17:00',
};

const TimingsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [isDateModalVisible, setDateModalVisible] = useState(false);
  const [isStartTimeModalVisible, setStartTimeModalVisible] = useState(false);
  const [isEndTimeModalVisible, setEndTimeModalVisible] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const generateTimeSlots = () => {
    const slots = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < 48; i++) {
      const time = new Date(start);
      time.setMinutes(time.getMinutes() + i * 30);
      slots.push(time);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const CustomTimePicker = ({ isVisible, onClose, onSelect, selectedTime, title }) => (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <RNText style={styles.modalTitle}>{title}</RNText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" type="material" size={24} color="#636E72" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.timeList}>
            {timeSlots.map((time, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeItem,
                  selectedTime.getHours() === time.getHours() &&
                  selectedTime.getMinutes() === time.getMinutes() &&
                  styles.selectedTimeItem,
                ]}
                onPress={() => {
                  onSelect(time);
                  onClose();
                }}
              >
                <RNText
                  style={[
                    styles.timeItemText,
                    selectedTime.getHours() === time.getHours() &&
                    selectedTime.getMinutes() === time.getMinutes() &&
                    styles.selectedTimeItemText,
                  ]}
                >
                  {formatTime(time)}
                </RNText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const CustomDatePicker = ({ isVisible, onClose, onSelect, selectedDate }) => (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <RNText style={styles.modalTitle}>Select Date</RNText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" type="material" size={24} color="#636E72" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.dateList}>
            {[...Array(30)].map((_, index) => {
              const date = new Date();
              date.setDate(date.getDate() + index);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateItem,
                    selectedDate.toDateString() === date.toDateString() && styles.selectedDateItem,
                  ]}
                  onPress={() => {
                    onSelect(date);
                    onClose();
                  }}
                >
                  <RNText
                    style={[
                      styles.dateItemText,
                      selectedDate.toDateString() === date.toDateString() && styles.selectedDateItemText,
                    ]}
                  >
                    {formatDate(date)}
                  </RNText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const handleSave = async () => {
    try {
      // Validate times
      if (startTime >= endTime) {
        Alert.alert('Invalid Time', 'End time must be after start time');
        return;
      }

      setLoading(true);

      // Format the data according to the database structure
      const timingData = formatTimingData(selectedDate, startTime, endTime);
      
      // Add vendor_id from the authenticated user
      timingData.vendor_id = user.id;

      // Save to database
      const response = await saveVendorTiming(timingData);
      
      Alert.alert(
        'Success', 
        'Availability saved successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error saving timings:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to save availability. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <LinearGradient
          colors={['#ff4500', '#cc3700']}
          style={styles.headerGradient}
        >
          <RNText style={styles.title}>Set Availability</RNText>
          <RNText style={styles.subtitle}>
            Choose your available date and time
          </RNText>
        </LinearGradient>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.timingsContainer}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <RNText style={styles.cardTitle}>Availability Status</RNText>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isAvailable ? '#ff4500' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
              />
            </View>
          </View>

          <View style={styles.card}>
            <RNText style={styles.cardTitle}>Select Date</RNText>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setDateModalVisible(true)}
            >
              <Icon name="event" type="material" size={24} color="#636E72" />
              <RNText style={styles.pickerButtonText}>
                {formatDate(selectedDate)}
              </RNText>
            </TouchableOpacity>
          </View>

          {isAvailable && (
            <View style={styles.card}>
              <RNText style={styles.cardTitle}>Time Range</RNText>
              <View style={styles.timeContainer}>
                <TouchableOpacity
                  style={[styles.pickerButton, styles.timeButton]}
                  onPress={() => setStartTimeModalVisible(true)}
                >
                  <Icon name="access-time" type="material" size={24} color="#636E72" />
                  <RNText style={styles.pickerButtonText}>
                    {formatTime(startTime)}
                  </RNText>
                </TouchableOpacity>

                <RNText style={styles.toText}>to</RNText>

                <TouchableOpacity
                  style={[styles.pickerButton, styles.timeButton]}
                  onPress={() => setEndTimeModalVisible(true)}
                >
                  <Icon name="access-time" type="material" size={24} color="#636E72" />
                  <RNText style={styles.pickerButtonText}>
                    {formatTime(endTime)}
                  </RNText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? "Saving..." : "Save Availability"}
            onPress={handleSave}
            buttonStyle={styles.saveButton}
            containerStyle={styles.saveButtonContainer}
            loading={loading}
            disabled={loading}
          />
        </View>
      </ScrollView>

      <CustomDatePicker
        isVisible={isDateModalVisible}
        onClose={() => setDateModalVisible(false)}
        onSelect={setSelectedDate}
        selectedDate={selectedDate}
      />

      <CustomTimePicker
        isVisible={isStartTimeModalVisible}
        onClose={() => setStartTimeModalVisible(false)}
        onSelect={setStartTime}
        selectedTime={startTime}
        title="Select Start Time"
      />

      <CustomTimePicker
        isVisible={isEndTimeModalVisible}
        onClose={() => setEndTimeModalVisible(false)}
        onSelect={setEndTime}
        selectedTime={endTime}
        title="Select End Time"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  timingsContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 15,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3F5',
    padding: 15,
    borderRadius: 8,
  },
  pickerButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2D3436',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeButton: {
    flex: 1,
  },
  toText: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#636E72',
  },
  buttonContainer: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: '#ff4500',
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveButtonContainer: {
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
  },
  timeList: {
    padding: 15,
  },
  timeItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F0F3F5',
  },
  selectedTimeItem: {
    backgroundColor: '#ff4500',
  },
  timeItemText: {
    fontSize: 16,
    color: '#2D3436',
  },
  selectedTimeItemText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dateList: {
    padding: 15,
  },
  dateItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F0F3F5',
  },
  selectedDateItem: {
    backgroundColor: '#ff4500',
  },
  dateItemText: {
    fontSize: 16,
    color: '#2D3436',
  },
  selectedDateItemText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default TimingsScreen; 