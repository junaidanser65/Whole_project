import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { Card, Text, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';

const VendorCard = ({ vendor, onPress }) => {
  console.log('VendorCard rendering for:', vendor.name, 'with ID:', vendor.id);
  
  // Function to get the correct image source
  const getImageSource = (imageUrl) => {
    if (typeof imageUrl === 'string') {
      return { uri: imageUrl };
    }
    return imageUrl;
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <Card containerStyle={styles.card}>
        <Image
          source={{ uri: vendor.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{vendor.name}</Text>
            <Text style={styles.priceRange}>{vendor.price_range}</Text>
          </View>
          <Text style={styles.category}>{vendor.category}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" color={colors.primary} size={16} />
            <Text style={styles.rating}>{vendor.rating}</Text>
            <Text style={styles.reviews}>({vendor.reviews_count} reviews)</Text>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {vendor.description}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    margin: spacing.sm,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    height: 150,
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h3,
    flex: 1,
    marginRight: spacing.sm,
  },
  priceRange: {
    ...typography.body,
    color: colors.primary,
  },
  category: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rating: {
    ...typography.body,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  reviews: {
    ...typography.caption,
    color: colors.textLight,
  },
  description: {
    ...typography.body,
    color: colors.textLight,
  },
});

export default VendorCard; 