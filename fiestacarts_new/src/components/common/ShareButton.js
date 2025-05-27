import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '@rneui/themed';
import { colors } from '../../styles/theme';

export default function ShareButton({ onPress, size = 24, color = colors.primary }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={styles.container}
    >
      <Icon 
        name="share"
        size={size}
        color={color}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
}); 