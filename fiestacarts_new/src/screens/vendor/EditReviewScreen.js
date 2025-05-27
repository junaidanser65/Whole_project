import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Icon, Input } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function EditReviewScreen({ route, navigation }) {
  const { review, onReviewUpdated } = route.params;
  const { user } = useAuth();
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a review');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          rating,
          comment: comment.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', review.id)
        .eq('user_id', user.id);

      if (error) throw error;

      Alert.alert('Success', 'Your review has been updated');
      onReviewUpdated?.();
      navigation.goBack();
    } catch (error) {
      console.error('Error updating review:', error);
      Alert.alert('Error', 'Failed to update review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', review.id)
                .eq('user_id', user.id);

              if (error) throw error;

              Alert.alert('Success', 'Your review has been deleted');
              onReviewUpdated?.();
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting review:', error);
              Alert.alert('Error', 'Failed to delete review. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Edit your review</Text>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setRating(index + 1)}
              style={styles.starButton}
            >
              <Icon
                name="star"
                size={40}
                color={index < rating ? colors.primary : colors.border}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Input
          placeholder="Write your review here..."
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.textInput}
          maxLength={500}
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Update Review"
            onPress={handleUpdate}
            loading={loading}
            disabled={loading}
            containerStyle={styles.updateButton}
          />
          <Button
            title="Delete Review"
            onPress={handleDelete}
            type="outline"
            buttonStyle={styles.deleteButton}
            titleStyle={styles.deleteButtonText}
            disabled={loading}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  starButton: {
    padding: spacing.xs,
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    minHeight: 120,
  },
  buttonContainer: {
    marginTop: spacing.xl,
  },
  updateButton: {
    marginBottom: spacing.md,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  deleteButtonText: {
    color: colors.error,
  },
}); 