import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../../styles/theme';

const AvailabilityCalendar = ({ availability = [], selectedDate, onDateSelect }) => {
  // Generate next 14 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
      full: date.toISOString().split('T')[0],
    };
  };

  // Check if a date has available slots
  const isDateAvailable = (dateString) => {
    // If no availability data, return false
    if (!availability || availability.length === 0) {
      return false;
    }

    // Find the availability record for this date
    const dateAvailability = availability.find(a => a.date === dateString);
    
    // Check if the date has available slots
    return dateAvailability?.is_available && 
           Array.isArray(dateAvailability?.available_slots) && 
           dateAvailability.available_slots.length > 0;
  };

  const dates = generateDates();

  const handleDatePress = (date) => {
    console.log('Date pressed:', date); // For debugging
    onDateSelect(date);
  };

  // Add debug logging
  console.log('Availability data:', availability);
  console.log('Generated dates:', dates.map(d => formatDate(d).full));

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {dates.map((date) => {
          const formattedDate = formatDate(date);
          const isAvailable = isDateAvailable(formattedDate.full);
          const isSelected = selectedDate === formattedDate.full;

          // Only render dates that are available
          if (!isAvailable) return null;

          return (
            <TouchableOpacity
              key={formattedDate.full}
              style={[
                styles.dateContainer,
                styles.availableDate,
                isSelected && styles.selectedDate,
              ]}
              onPress={() => handleDatePress(formattedDate.full)}
            >
              <Text style={[
                styles.dayText,
                isSelected && styles.selectedText,
              ]}>
                {formattedDate.day}
              </Text>
              <Text style={[
                styles.dateText,
                isSelected && styles.selectedText,
              ]}>
                {formattedDate.date}
              </Text>
              <Text style={[
                styles.monthText,
                isSelected && styles.selectedText,
              ]}>
                {formattedDate.month}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  dateContainer: {
    width: 70,
    height: 90,
    marginHorizontal: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    elevation: 2,
  },
  availableDate: {
    borderColor: colors.primary,
  },
  selectedDate: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    ...typography.caption,
    color: colors.text,
  },
  dateText: {
    ...typography.h2,
    color: colors.text,
    marginVertical: 2,
  },
  monthText: {
    ...typography.caption,
    color: colors.text,
  },
  selectedText: {
    color: colors.white,
  },
});

export default AvailabilityCalendar; 