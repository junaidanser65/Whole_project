import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ReviewCard from '../../components/vendor/ReviewCard';
import ReviewFilters from '../../components/vendor/ReviewFilters';

export default function ReviewsListScreen({ route, navigation }) {
  const { vendor } = route.params;
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [selectedSort, setSelectedSort] = useState('newest');
  const [selectedRating, setSelectedRating] = useState(null);
  const [ratingCounts, setRatingCounts] = useState({});

  useEffect(() => {
    fetchReviews();
  }, [selectedSort, selectedRating]);

  const fetchReviews = async () => {
    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          users:user_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('vendor_id', vendor.id);

      if (selectedRating) {
        query = query.eq('rating', selectedRating);
      }

      switch (selectedSort) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'highest':
          query = query.order('rating', { ascending: false });
          break;
        case 'lowest':
          query = query.order('rating', { ascending: true });
          break;
        case 'helpful':
          query = query.order('helpful_count', { ascending: false });
          break;
      }

      const { data: reviewsData, error } = await query;

      if (error) throw error;

      const formattedReviews = reviewsData.map(review => ({
        ...review,
        user_name: `${review.users.first_name} ${review.users.last_name}`,
        user_avatar: review.users.avatar_url,
      }));

      setReviews(formattedReviews);
      setUserReview(formattedReviews.find(r => r.user_id === user?.id));

      const counts = reviewsData.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, {});
      setRatingCounts(counts);

    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleHelpful = async (review) => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ helpful_count: review.helpful_count + 1 })
        .eq('id', review.id)
        .select()
        .single();

      if (error) throw error;

      setReviews(prev => 
        prev.map(r => r.id === review.id ? { ...r, helpful_count: data.helpful_count } : r)
      );
    } catch (error) {
      console.error('Error updating helpful count:', error);
    }
  };

  const handleAddReview = () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('AddReview', { vendor, onReviewAdded: fetchReviews });
  };

  const handleEditReview = (review) => {
    navigation.navigate('EditReview', { review, onReviewUpdated: fetchReviews });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.ratingOverview}>
          <Text style={styles.averageRating}>{vendor.rating.toFixed(1)}</Text>
          <View style={styles.starsContainer}>
            {[...Array(5)].map((_, index) => (
              <Icon
                key={index}
                name="star"
                size={24}
                color={index < Math.round(vendor.rating) ? colors.primary : colors.border}
              />
            ))}
          </View>
          <Text style={styles.totalReviews}>
            Based on {vendor.reviews_count} reviews
          </Text>
        </View>
        {!userReview && (
          <Button
            title="Write a Review"
            icon={<Icon name="rate-review" color={colors.background} />}
            onPress={handleAddReview}
            containerStyle={styles.addReviewButton}
          />
        )}
      </View>
      <ReviewFilters
        selectedSort={selectedSort}
        selectedRating={selectedRating}
        onSortChange={setSelectedSort}
        onRatingChange={setSelectedRating}
        ratingCounts={ratingCounts}
      />
    </>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        renderItem={({ item }) => (
          <ReviewCard
            review={item}
            onHelpfulPress={handleHelpful}
            onEditPress={handleEditReview}
            isOwnReview={item.user_id === user?.id}
          />
        )}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reviews yet</Text>
            <Text style={styles.emptySubtext}>Be the first to review!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ratingOverview: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  averageRating: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  totalReviews: {
    ...typography.caption,
    color: colors.textLight,
  },
  addReviewButton: {
    marginTop: spacing.md,
  },
  listContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.h2,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textLight,
  },
}); 