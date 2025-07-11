import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Card, Icon } from '@rneui/themed';
import PropTypes from 'prop-types';
import { colors, spacing, typography } from '../../../styles/theme';

const VendorCard = ({ vendor, onPress, featured = false, style }) => {
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'catering':
        return 'restaurant';
      case 'venues':
        return 'location-on';
      case 'photography':
        return 'camera-alt';
      case 'music':
        return 'music-note';
      case 'decoration':
        return 'celebration';
      default:
        return 'store';
    }
  };

  return (
    <Card containerStyle={[styles.card, featured && styles.featuredCard, style]}>
      <TouchableOpacity onPress={onPress}>
        {vendor.profile_image && vendor.profile_image.trim() !== '' ? (
          <Image
            source={{ uri: vendor.profile_image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }]}> 
            <Icon
              name="store"
              type="material"
              size={64}
              color={colors.primary}
            />
          </View>
        )}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {vendor.name}
            </Text>
            {vendor.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{vendor.badge}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.businessName} numberOfLines={1}>
            {vendor.business_name}
          </Text>

          <View style={styles.details}>
            <View style={styles.ratingContainer}>
              <Icon name="star" color={colors.primary} size={16} />
              <Text style={styles.rating}>{vendor.rating}</Text>
              <Text style={styles.reviews}>({vendor.reviews_count} reviews)</Text>
            </View>
          </View>

          {vendor.address && (
            <View style={styles.addressContainer}>
              <Icon name="location-on" size={16} color={colors.textLight} />
              <Text style={styles.address} numberOfLines={1}>
                {vendor.address}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );
};

VendorCard.propTypes = {
  vendor: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    business_name: PropTypes.string,
    profile_image: PropTypes.string,
    rating: PropTypes.number,
    reviews_count: PropTypes.number,
    address: PropTypes.string,
    badge: PropTypes.string,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
  featured: PropTypes.bool,
  style: PropTypes.object,
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    margin: 0,
    marginBottom: spacing.md,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredCard: {
    width: 280,
    marginRight: spacing.md,
  },
  image: {
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
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
  },
  businessName: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    ...typography.caption,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
  },
});

export default VendorCard; 