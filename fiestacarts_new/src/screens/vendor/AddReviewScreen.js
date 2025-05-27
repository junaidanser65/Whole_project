import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Icon, Input } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function AddReviewScreen({ route, navigation }) {
  const { vendor, onReviewAdded } = route.params;
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
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
        .insert({
          user_id: user.id,
          vendor_id: vendor.id,
          rating,
          comment: comment.trim(),
        });

      if (error) throw error;

      Alert.alert('Success', 'Your review has been submitted');
      onReviewAdded?.();
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Rate your experience</Text>
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

        <Button
          title="Submit Review"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          containerStyle={styles.submitButton}
        />
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
  submitButton: {
    marginTop: spacing.xl,
  },
}); 