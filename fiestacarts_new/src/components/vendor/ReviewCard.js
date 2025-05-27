import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, Icon, Image } from '@rneui/themed';
import PropTypes from 'prop-types';
import { colors, spacing, typography } from '../../styles/theme';

export default function ReviewCard({ review, onPress, onHelpfulPress, onEditPress, isOwnReview }) {
  return (
    <Card containerStyle={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {review.user_avatar ? (
            <Image
              source={{ uri: review.user_avatar }}
              style={styles.avatar}
            />
          ) : (
            <Icon name="person" size={24} color={colors.textLight} />
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{review.user_name}</Text>
            <Text style={styles.date}>
              {new Date(review.created_at).toLocaleDateString()}
            </Text>
          </View>
          {isOwnReview && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEditPress?.(review)}
            >
              <Icon name="edit" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, index) => (
            <Icon
              key={index}
              name="star"
              size={16}
              color={index < review.rating ? colors.primary : colors.border}
            />
          ))}
        </View>
      </View>
      
      <Text style={styles.comment}>{review.comment}</Text>
      
      {review.images?.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesContainer}
        >
          {review.images.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onPress?.(review, index)}
            >
              <Image
                source={{ uri: image }}
                style={styles.reviewImage}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.helpfulButton}
          onPress={() => onHelpfulPress?.(review)}
        >
          <Icon
            name="thumb-up"
            size={16}
            color={colors.textLight}
            style={styles.helpfulIcon}
          />
          <Text style={styles.helpfulText}>
            Helpful ({review.helpful_count})
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

ReviewCard.propTypes = {
  review: PropTypes.shape({
    id: PropTypes.string.isRequired,
    user_name: PropTypes.string.isRequired,
    user_avatar: PropTypes.string,
    rating: PropTypes.number.isRequired,
    comment: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
    helpful_count: PropTypes.number,
    created_at: PropTypes.string.isRequired,
  }).isRequired,
  onPress: PropTypes.func,
  onHelpfulPress: PropTypes.func,
  onEditPress: PropTypes.func,
  isOwnReview: PropTypes.bool,
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    margin: spacing.sm,
    borderRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...typography.subtitle,
  },
  date: {
    ...typography.caption,
    color: colors.textLight,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  comment: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  imagesContainer: {
    marginBottom: spacing.md,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  helpfulIcon: {
    marginRight: spacing.xs,
  },
  helpfulText: {
    ...typography.caption,
    color: colors.textLight,
  },
  editButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
}); 