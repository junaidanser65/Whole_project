import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Button, Slider, Chip, Divider } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';

const CATEGORIES = [
  'All', 'Catering', 'Venues', 'Photography', 'Music', 'Decoration',
  'Transportation', 'Flowers', 'Cake', 'Invitations', 'Dress & Attire'
];

const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'];

const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Most Reviews', value: 'reviews' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

export default function SearchFiltersScreen({ navigation, route }) {
  const { currentFilters = {} } = route.params || {};
  const [filters, setFilters] = useState({
    categories: currentFilters.categories || [],
    priceRanges: currentFilters.priceRanges || [],
    rating: currentFilters.rating || 0,
    sortBy: currentFilters.sortBy || 'recommended',
    ...currentFilters,
  });

  const handleCategoryToggle = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handlePriceRangeToggle = (range) => {
    setFilters(prev => ({
      ...prev,
      priceRanges: prev.priceRanges.includes(range)
        ? prev.priceRanges.filter(r => r !== range)
        : [...prev.priceRanges, range],
    }));
  };

  const handleSortOptionSelect = (option) => {
    setFilters(prev => ({
      ...prev,
      sortBy: option,
    }));
  };

  const handleApplyFilters = () => {
    navigation.navigate('VendorSearch', { filters });
  };

  const handleReset = () => {
    setFilters({
      categories: [],
      priceRanges: [],
      rating: 0,
      sortBy: 'recommended',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.chipContainer}>
            {CATEGORIES.map((category) => (
              <Chip
                key={category}
                title={category}
                type={filters.categories.includes(category) ? 'solid' : 'outline'}
                onPress={() => handleCategoryToggle(category)}
                containerStyle={styles.chip}
                buttonStyle={filters.categories.includes(category) ? styles.selectedChip : {}}
              />
            ))}
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.chipContainer}>
            {PRICE_RANGES.map((range) => (
              <Chip
                key={range}
                title={range}
                type={filters.priceRanges.includes(range) ? 'solid' : 'outline'}
                onPress={() => handlePriceRangeToggle(range)}
                containerStyle={styles.chip}
                buttonStyle={filters.priceRanges.includes(range) ? styles.selectedChip : {}}
              />
            ))}
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Minimum Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minimum Rating</Text>
          <Slider
            value={filters.rating}
            onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}
            minimumValue={0}
            maximumValue={5}
            step={0.5}
            thumbStyle={styles.sliderThumb}
            trackStyle={styles.sliderTrack}
            minimumTrackTintColor={colors.primary}
          />
          <Text style={styles.ratingText}>{filters.rating} Stars & Up</Text>
        </View>

        <Divider style={styles.divider} />

        {/* Sort By */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          {SORT_OPTIONS.map((option) => (
            <Button
              key={option.value}
              title={option.label}
              type={filters.sortBy === option.value ? 'solid' : 'clear'}
              onPress={() => handleSortOptionSelect(option.value)}
              buttonStyle={[
                styles.sortButton,
                filters.sortBy === option.value && styles.selectedSortButton,
              ]}
              titleStyle={[
                styles.sortButtonText,
                filters.sortBy === option.value && styles.selectedSortButtonText,
              ]}
            />
          ))}
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Button
          title="Reset"
          type="outline"
          onPress={handleReset}
          containerStyle={styles.resetButtonContainer}
        />
        <Button
          title="Apply Filters"
          onPress={handleApplyFilters}
          containerStyle={styles.applyButtonContainer}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  chip: {
    margin: spacing.xs,
  },
  selectedChip: {
    backgroundColor: colors.primary,
  },
  divider: {
    backgroundColor: colors.border,
  },
  sliderThumb: {
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
  },
  sliderTrack: {
    height: 4,
  },
  ratingText: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
    color: colors.textLight,
  },
  sortButton: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: 8,
  },
  selectedSortButton: {
    backgroundColor: colors.primary,
  },
  sortButtonText: {
    ...typography.body,
    color: colors.text,
  },
  selectedSortButtonText: {
    color: colors.background,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  resetButtonContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  applyButtonContainer: {
    flex: 2,
  },
}); 