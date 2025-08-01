import React, { useState, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
  const [numberOfSlots, setNumberOfSlots] = useState(1);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isDateModalVisible, setDateModalVisible] = useState(false);
  const [isSlotNumberModalVisible, setSlotNumberModalVisible] = useState(false);
  const [isTimeSlotModalVisible, setTimeSlotModalVisible] = useState(false);
  const [editingSlotIndex, setEditingSlotIndex] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);

  // Auto-generate time slots when numberOfSlots changes
  useEffect(() => {
    const generateDefaultSlots = () => {
      const slots = [];
      const baseTime = new Date();
      baseTime.setHours(9, 0, 0, 0); // Start at 9 AM
      
      for (let i = 0; i < numberOfSlots; i++) {
        const slotTime = new Date(baseTime);
        slotTime.setHours(baseTime.getHours() + (i * 2)); // 2-hour intervals
        
        slots.push({
          id: Date.now() + i,
          time: slotTime,
          label: `Slot ${i + 1}`
        });
      }
      
      setTimeSlots(slots);
    };

    if (numberOfSlots > 0) {
      generateDefaultSlots();
    }
  }, [numberOfSlots]);

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

  const timeGridSlots = generateTimeSlots();

  const SlotNumberPicker = ({ isVisible, onClose, onSelect, selectedNumber }) => (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modernModalContent}>
          <View style={styles.modernModalHeader}>
            <View style={styles.modalTitleContainer}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="list" size={24} color="#6366F1" />
              </View>
              <View>
                <RNText style={styles.modernModalTitle}>Number of Time Slots</RNText>
                <RNText style={styles.modernModalSubtitle}>How many time slots do you want to offer?</RNText>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modernCloseButton}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.slotNumberGrid} showsVerticalScrollIndicator={false}>
            <View style={styles.slotNumberContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => {
                const isSelected = selectedNumber === number;
                
                return (
                  <TouchableOpacity
                    key={number}
                    style={[
                      styles.slotNumberItem,
                      isSelected && styles.selectedSlotNumberItem
                    ]}
                    onPress={() => {
                      onSelect(number);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <RNText style={[
                      styles.slotNumberText,
                      isSelected && styles.selectedSlotNumberText
                    ]}>
                      {number}
                    </RNText>
                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const CustomTimePicker = ({ isVisible, onClose, onSelect, selectedTime, title }) => (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modernModalContent}>
          <View style={styles.modernModalHeader}>
            <View style={styles.modalTitleContainer}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="time" size={24} color="#6366F1" />
              </View>
              <View>
                <RNText style={styles.modernModalTitle}>{title}</RNText>
                <RNText style={styles.modernModalSubtitle}>Select your preferred time</RNText>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modernCloseButton}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          {/* Time Period Filters */}
          <View style={styles.timePeriodFilters}>
            <RNText style={styles.filterLabel}>Quick Select</RNText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickSelectContainer}>
              {[
                { label: 'Morning', start: 9, icon: 'sunny' },
                { label: 'Afternoon', start: 13, icon: 'partly-sunny' },
                { label: 'Evening', start: 17, icon: 'moon' },
                { label: 'Night', start: 20, icon: 'moon-outline' }
              ].map((period, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickSelectButton}
                  onPress={() => {
                    const newTime = new Date();
                    newTime.setHours(period.start, 0, 0, 0);
                    onSelect(newTime);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name={period.icon} size={20} color="#6366F1" />
                  <RNText style={styles.quickSelectText}>{period.label}</RNText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Time Grid */}
          <RNText style={styles.sectionTitle}>Select Time</RNText>
          <ScrollView style={styles.timeGrid} showsVerticalScrollIndicator={false}>
            <View style={styles.timeGridContainer}>
              {timeGridSlots.map((time, index) => {
                const isSelected = selectedTime.getHours() === time.getHours() && 
                                selectedTime.getMinutes() === time.getMinutes();
                const isPastTime = new Date() > time && new Date().toDateString() === time.toDateString();
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeGridItem,
                      isSelected && styles.selectedTimeGridItem,
                      isPastTime && styles.pastTimeGridItem
                    ]}
                    onPress={() => {
                      if (!isPastTime) {
                        onSelect(time);
                        onClose();
                      }
                    }}
                    disabled={isPastTime}
                    activeOpacity={0.7}
                  >
                    <RNText style={[
                      styles.timeGridText,
                      isSelected && styles.selectedTimeGridText,
                      isPastTime && styles.pastTimeGridText
                    ]}>
                      {formatTime(time)}
                    </RNText>
                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
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
        <View style={styles.modernModalContent}>
          <View style={styles.modernModalHeader}>
            <View style={styles.modalTitleContainer}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="calendar" size={24} color="#6366F1" />
              </View>
              <View>
                <RNText style={styles.modernModalTitle}>Select Date</RNText>
                <RNText style={styles.modernModalSubtitle}>Choose your available date</RNText>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modernCloseButton}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          {/* Quick Date Filters */}
          <View style={styles.timePeriodFilters}>
            <RNText style={styles.filterLabel}>Quick Select</RNText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickSelectContainer}>
              {[
                { label: 'Today', days: 0, icon: 'today' },
                { label: 'Tomorrow', days: 1, icon: 'calendar-outline' },
                { label: 'This Week', days: 7, icon: 'calendar' },
                { label: 'Next Week', days: 14, icon: 'calendar-sharp' }
              ].map((period, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickSelectButton}
                  onPress={() => {
                    const newDate = new Date();
                    newDate.setDate(newDate.getDate() + period.days);
                    onSelect(newDate);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name={period.icon} size={20} color="#6366F1" />
                  <RNText style={styles.quickSelectText}>{period.label}</RNText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Date Cards */}
          <RNText style={styles.sectionTitle}>Available Dates</RNText>
          <ScrollView style={styles.dateCardsContainer} showsVerticalScrollIndicator={false}>
            {[...Array(30)].map((_, index) => {
              const date = new Date();
              date.setDate(date.getDate() + index);
              const isSelected = selectedDate.toDateString() === date.toDateString();
              const isToday = new Date().toDateString() === date.toDateString();
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNumber = date.getDate();
              const monthName = date.toLocaleDateString('en-US', { month: 'short' });
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateCard,
                    isSelected && styles.selectedDateCard,
                    isToday && styles.todayDateCard
                  ]}
                  onPress={() => {
                    onSelect(date);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.dateCardLeft}>
                    <View style={[
                      styles.dateCardIcon,
                      isSelected && styles.selectedDateCardIcon,
                      isToday && styles.todayDateCardIcon
                    ]}>
                      <RNText style={[
                        styles.dateCardDay,
                        isSelected && styles.selectedDateCardDay,
                        isToday && styles.todayDateCardDay
                      ]}>
                        {dayName}
                      </RNText>
                      <RNText style={[
                        styles.dateCardNumber,
                        isSelected && styles.selectedDateCardNumber,
                        isToday && styles.todayDateCardNumber
                      ]}>
                        {dayNumber}
                      </RNText>
                    </View>
                    <View style={styles.dateCardInfo}>
                      <RNText style={[
                        styles.dateCardTitle,
                        isSelected && styles.selectedDateCardTitle
                      ]}>
                        {formatDate(date)}
                      </RNText>
                      <RNText style={[
                        styles.dateCardSubtitle,
                        isSelected && styles.selectedDateCardSubtitle
                      ]}>
                        {isToday ? 'Today' : `${monthName} ${dayNumber}`}
                        {isToday && ' • Available now'}
                      </RNText>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={styles.dateSelectedIndicator}>
                      <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
                    </View>
                  )}
                  {isToday && !isSelected && (
                    <View style={styles.todayBadge}>
                      <RNText style={styles.todayBadgeText}>Today</RNText>
                    </View>
                  )}
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
      // Validate time slots
      if (timeSlots.length === 0) {
        Alert.alert('Invalid Time Slots', 'Please add at least one time slot');
        return;
      }

      setLoading(true);

      // Format the data according to the database structure
      const timingData = formatTimingData(selectedDate, timeSlots);
      
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

  const addTimeSlot = () => {
    const newSlot = {
      id: Date.now(),
      time: new Date(),
      label: `Slot ${timeSlots.length + 1}`
    };
    setTimeSlots([...timeSlots, newSlot]);
    setNumberOfSlots(numberOfSlots + 1);
  };

  const updateSlotLabels = (slots) => {
    return slots.map((slot, index) => ({
      ...slot,
      label: `Slot ${index + 1}`
    }));
  };

  const removeTimeSlot = (index) => {
    const updatedSlots = timeSlots.filter((_, i) => i !== index);
    const renumberedSlots = updateSlotLabels(updatedSlots);
    setTimeSlots(renumberedSlots);
    setNumberOfSlots(numberOfSlots - 1);
  };

  const updateTimeSlot = (index, newTime) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index] = { ...updatedSlots[index], time: newTime };
    setTimeSlots(updatedSlots);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                <RNText style={styles.headerTitle}>Set Availability</RNText>
                <RNText style={styles.headerSubtitle}>
                  Manage your working hours and availability
                </RNText>
              </View>

              <View style={styles.headerIconContainer}>
                <Ionicons name="time-outline" size={24} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.timingsContainer}>
          {/* Availability Status Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="power" size={24} color="#6366F1" />
                </View>
                <View style={styles.cardTitleSection}>
                  <RNText style={styles.cardTitle}>Availability Status</RNText>
                  <RNText style={styles.cardSubtitle}>
                    {isAvailable ? "Accepting bookings" : "Not available"}
                  </RNText>
                </View>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: "#E2E8F0", true: "#A5B4FC" }}
                thumbColor={isAvailable ? "#6366F1" : "#94A3B8"}
                ios_backgroundColor="#E2E8F0"
                style={styles.switch}
              />
            </View>
          </View>

          {/* Date Selection Card */}
          <View style={styles.card}>
            <View style={styles.cardTitleContainer}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="calendar" size={24} color="#6366F1" />
              </View>
              <View style={styles.cardTitleSection}>
                <RNText style={styles.cardTitle}>Select Date</RNText>
                <RNText style={styles.cardSubtitle}>
                  Choose your available date
                </RNText>
              </View>
            </View>

            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setDateModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.pickerContent}>
                <View style={styles.pickerIconContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#6366F1" />
                </View>
                <RNText style={styles.pickerButtonText}>
                  {formatDate(selectedDate)}
                </RNText>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Number of Time Slots Card */}
          {isAvailable && (
            <View style={styles.card}>
              <View style={styles.cardTitleContainer}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="list" size={24} color="#6366F1" />
                </View>
                <View style={styles.cardTitleSection}>
                  <RNText style={styles.cardTitle}>Number of Time Slots</RNText>
                  <RNText style={styles.cardSubtitle}>
                    How many time slots do you want to offer?
                  </RNText>
                </View>
              </View>

              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setSlotNumberModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.pickerContent}>
                  <View style={styles.pickerIconContainer}>
                    <Ionicons name="list-outline" size={20} color="#6366F1" />
                  </View>
                  <RNText style={styles.pickerButtonText}>
                    {numberOfSlots} {numberOfSlots === 1 ? 'slot' : 'slots'}
                  </RNText>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Time Slots Card */}
          {isAvailable && numberOfSlots > 0 && (
            <View style={styles.card}>
              <View style={styles.cardTitleContainer}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="time" size={24} color="#6366F1" />
                </View>
                <View style={styles.cardTitleSection}>
                  <RNText style={styles.cardTitle}>Time Slots</RNText>
                  <RNText style={styles.cardSubtitle}>
                    Set the specific times for each slot
                  </RNText>
                </View>
                <TouchableOpacity
                  style={styles.addSlotButton}
                  onPress={addTimeSlot}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color="#6366F1" />
                </TouchableOpacity>
              </View>

              <View style={styles.timeSlotsContainer}>
                {timeSlots.map((slot, index) => (
                  <View key={slot.id} style={styles.timeSlotItem}>
                    <TouchableOpacity
                      style={styles.timeSlotButton}
                      onPress={() => {
                        setEditingSlotIndex(index);
                        setTimeSlotModalVisible(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.timeSlotContent}>
                        <View style={styles.timeSlotIconContainer}>
                          <Ionicons name="time-outline" size={18} color="#6366F1" />
                        </View>
                        <View style={styles.timeSlotTextContainer}>
                          <RNText style={styles.timeSlotLabel}>{slot.label}</RNText>
                          <RNText style={styles.timeSlotValue}>
                            {formatTime(slot.time)}
                          </RNText>
                        </View>
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.removeSlotButton}
                      onPress={() => removeTimeSlot(index)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                
                {timeSlots.length === 0 && (
                  <View style={styles.emptySlotsContainer}>
                    <Ionicons name="time-outline" size={32} color="#CBD5E1" />
                    <RNText style={styles.emptySlotsText}>No time slots added yet</RNText>
                    <RNText style={styles.emptySlotsSubtext}>Tap the + button to add your first time slot</RNText>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Summary Card */}
          {isAvailable && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <RNText style={styles.summaryTitle}>
                  Availability Summary
                </RNText>
              </View>
              <View style={styles.summaryContent}>
                <View style={styles.summaryRow}>
                  <RNText style={styles.summaryLabel}>Date:</RNText>
                  <RNText style={styles.summaryValue}>
                    {formatDate(selectedDate)}
                  </RNText>
                </View>
                <View style={styles.summaryRow}>
                  <RNText style={styles.summaryLabel}>Time Slots:</RNText>
                  <RNText style={styles.summaryValue}>
                    {timeSlots.length} {timeSlots.length === 1 ? 'slot' : 'slots'}
                  </RNText>
                </View>
                {timeSlots.length > 0 && (
                  <View style={styles.summaryRow}>
                    <RNText style={styles.summaryLabel}>Times:</RNText>
                    <View style={styles.timeSlotsSummary}>
                      {timeSlots.map((slot, index) => (
                        <View key={slot.id} style={styles.timeSlotSummary}>
                          <RNText style={styles.timeSlotSummaryText}>
                            {formatTime(slot.time)}
                          </RNText>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                <View style={styles.summaryRow}>
                  <RNText style={styles.summaryLabel}>Status:</RNText>
                  <View style={styles.statusBadge}>
                    <Ionicons name="checkmark" size={14} color="#10B981" />
                    <RNText style={styles.statusText}>Available</RNText>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading ? ["#94A3B8", "#94A3B8"] : ["#6366F1", "#8B5CF6"]}
              style={styles.saveButtonGradient}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <RNText style={styles.saveButtonText}>Saving...</RNText>
                </View>
              ) : (
                <View style={styles.saveButtonContent}>
                  <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                  <RNText style={styles.saveButtonText}>
                    Save Availability
                  </RNText>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomDatePicker
        isVisible={isDateModalVisible}
        onClose={() => setDateModalVisible(false)}
        onSelect={setSelectedDate}
        selectedDate={selectedDate}
      />

      <SlotNumberPicker
        isVisible={isSlotNumberModalVisible}
        onClose={() => setSlotNumberModalVisible(false)}
        onSelect={setNumberOfSlots}
        selectedNumber={numberOfSlots}
      />

      <CustomTimePicker
        isVisible={isTimeSlotModalVisible}
        onClose={() => {
          setTimeSlotModalVisible(false);
          setEditingSlotIndex(null);
        }}
        onSelect={(newTime) => {
          if (editingSlotIndex !== null) {
            updateTimeSlot(editingSlotIndex, newTime);
          }
        }}
        selectedTime={editingSlotIndex !== null ? timeSlots[editingSlotIndex]?.time : new Date()}
        title="Select Time Slot"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  
  // Header Styles
  headerContainer: {
    marginBottom: 24,
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
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Content Styles
  timingsContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleSection: {
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  
  // Picker Styles
  pickerButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  
  // Time Slots Styles
  timeSlotsContainer: {
    gap: 12,
  },
  timeSlotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeSlotButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeSlotContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSlotIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timeSlotTextContainer: {
    flex: 1,
  },
  timeSlotLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeSlotValue: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: 2,
  },
  removeSlotButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSlotButton: {
    width: 40,
    height: 35,
    right: 26,
    bottom: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySlotsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptySlotsText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySlotsSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Summary Card Styles
  summaryCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 12,
    letterSpacing: -0.2,
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '700',
    marginLeft: 4,
  },
  
  // Button Styles
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  saveButton: {
    borderRadius: 16,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  saveButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
    letterSpacing: -0.1,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modernModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modernModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modernCloseButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modernModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  modernModalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  
  // Quick Select Styles
  timePeriodFilters: {
    marginTop: 20,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickSelectContainer: {
    paddingHorizontal: 0,
  },
  quickSelectButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickSelectText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  
  // Time Grid Styles
  timeGrid: {
    maxHeight: 300,
  },
  timeGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeGridItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectedTimeGridItem: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  pastTimeGridItem: {
    opacity: 0.5,
    backgroundColor: '#F1F5F9',
  },
  timeGridText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  selectedTimeGridText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pastTimeGridText: {
    color: '#94A3B8',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Date Card Styles
  dateCardsContainer: {
    maxHeight: 300,
  },
  dateCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  selectedDateCard: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  todayDateCard: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0EA5E9',
  },
  dateCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedDateCardIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  todayDateCardIcon: {
    backgroundColor: '#FFFFFF',
  },
  dateCardDay: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateCardNumber: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: 2,
  },
  selectedDateCardDay: {
    color: '#FFFFFF',
  },
  selectedDateCardNumber: {
    color: '#FFFFFF',
  },
  todayDateCardDay: {
    color: '#0EA5E9',
  },
  todayDateCardNumber: {
    color: '#0EA5E9',
  },
  dateCardInfo: {
    flex: 1,
  },
  dateCardTitle: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  selectedDateCardTitle: {
    color: '#FFFFFF',
  },
  dateCardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  selectedDateCardSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dateSelectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  todayBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  todayBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Slot Number Picker Styles
  slotNumberGrid: {
    maxHeight: 300,
  },
  slotNumberContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotNumberItem: {
    width: '30%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectedSlotNumberItem: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  slotNumberText: {
    fontSize: 24,
    color: '#0F172A',
    fontWeight: '700',
  },
  selectedSlotNumberText: {
    color: '#FFFFFF',
  },
  
  // Time Slots Summary Styles
  timeSlotsSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotSummary: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeSlotSummaryText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
});

export default TimingsScreen; 