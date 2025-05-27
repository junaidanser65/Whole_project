import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import { SearchBar, Button, Icon } from '@rneui/themed';
import { colors, spacing } from '../../styles/theme';
import { supabase } from '../../lib/supabase';
import VendorCard from './components/VendorCard';

export default function VendorListScreen({ navigation }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleFilter = () => {
    navigation.navigate('SearchFilters');
  };

  const handleVendorPress = (vendor) => {
    navigation.navigate('VendorDetails', { vendor });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <SearchBar
        placeholder="Search vendors..."
        onChangeText={handleSearch}
        value={searchQuery}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        platform="default"
      />
      <Button
        icon={<Icon name="filter-list" color={colors.primary} />}
        type="clear"
        onPress={handleFilter}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredVendors}
        renderItem={({ item }) => (
          <VendorCard
            vendor={item}
            onPress={() => handleVendorPress(item)}
          />
        )}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchVendors();
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="store" size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>No vendors found</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
    marginVertical: 0,
  },
  searchInputContainer: {
    backgroundColor: colors.surface,
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
    marginTop: spacing.md,
  },
}); 