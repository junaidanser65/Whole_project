import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text, Card, Icon, Button } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import BackButton from '../../components/common/BackButton';

export default function SavedVendorsScreen({ navigation }) {
  const { user } = useAuth();
  const { favorites, removeFavorite } = useFavorites();
  const [loading, setLoading] = useState(true);

  // Set loading to false after component mounts
  useEffect(() => {
    setLoading(false);
  }, []);

  const handleRemoveVendor = (vendorId) => {
    Alert.alert(
      'Remove Vendor',
      'Are you sure you want to remove this vendor from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          onPress: () => {
            removeFavorite(vendorId);
            Alert.alert('Success', 'Vendor removed from saved list');
          },
          style: 'destructive' 
        },
      ]
    );
  };

  const renderVendorCard = ({ item: vendor }) => (
    <Card containerStyle={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('VendorDetails', { vendor })}
      >
        <Card.Image
          source={{ uri: vendor.image_url }}
          style={styles.vendorImage}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.vendorName}>{vendor.name}</Text>
            <TouchableOpacity
              onPress={() => handleRemoveVendor(vendor.id)}
            >
              <Icon name="favorite" color={colors.error} size={24} />
            </TouchableOpacity>
          </View>
          <Text style={styles.vendorCategory}>{vendor.category}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" color={colors.primary} size={16} />
            <Text style={styles.rating}>{vendor.rating}</Text>
            <Text style={styles.reviews}>({vendor.reviews_count} reviews)</Text>
            <Text style={styles.priceRange}>{vendor.price_range}</Text>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {vendor.description}
          </Text>
        </View>
      </TouchableOpacity>
    </Card>
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
        style={styles.container}
        data={favorites}
        renderItem={renderVendorCard}
        keyExtractor={vendor => vendor.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.centerContainer}>
            <Icon name="favorite-border" size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>No saved vendors yet</Text>
            <Button
              title="Browse Vendors"
              onPress={() => navigation.navigate('Dashboard')}
              type="outline"
              containerStyle={styles.browseButton}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.sm,
  },
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
  vendorImage: {
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  vendorName: {
    ...typography.h3,
    flex: 1,
    marginRight: spacing.sm,
  },
  vendorCategory: {
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
    marginRight: spacing.md,
  },
  priceRange: {
    ...typography.body,
    color: colors.primary,
  },
  description: {
    ...typography.body,
    color: colors.textLight,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textLight,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  browseButton: {
    width: '100%',
    maxWidth: 300,
  },
}); 