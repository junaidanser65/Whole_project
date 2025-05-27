import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { colors, spacing, typography } from '../../styles/theme';

const TimeSlotPicker = ({ availableSlots = [], selectedSlot, onSelectSlot }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {availableSlots.map((slot) => (
          <TouchableOpacity
            key={slot}
            style={[
              styles.slot,
              selectedSlot === slot && styles.selectedSlot,
            ]}
            onPress={() => onSelectSlot(slot)}
          >
            <Text
              style={[
                styles.slotText,
                selectedSlot === slot && styles.selectedSlotText,
              ]}
            >
              {slot}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  slot: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  selectedSlot: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotText: {
    ...typography.body,
    color: colors.text,
  },
  selectedSlotText: {
    color: colors.white,
  },
});

export default TimeSlotPicker; 