import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '@rneui/themed';
import { colors, spacing } from '../../styles/theme';
import { useNavigation } from '@react-navigation/native';

export default function BackButton({ color = colors.primary }) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => navigation.goBack()}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icon
        name="arrow-back"
        size={24}
        color={color}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 