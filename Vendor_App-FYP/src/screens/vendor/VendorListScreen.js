import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Text, SearchBar, Icon, Rating } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Temporary mock data
const mockVendors = [
  {
    id: '1',
    name: 'Event Solutions Pro',
    category: 'Event Equipment',
    rating: 4.5,
    reviews: 128,
    image: 'https://picsum.photos/200',
    location: 'New York, NY',
  },
  {
    id: '2',
    name: 'Sound & Lighting Experts',
    category: 'Audio/Visual',
    rating: 4.8,
    reviews: 89,
    image: 'https://picsum.photos/201',
    location: 'Brooklyn, NY',
  },
  // Add more mock vendors here
];

const VendorCard = ({ vendor, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={{ uri: vendor.image }} style={styles.vendorImage} />
    <View style={styles.cardContent}>
      <Text style={styles.vendorName}>{vendor.name}</Text>
      <Text style={styles.category}>{vendor.category}</Text>
      <View style={styles.ratingContainer}>
        <Rating
          readonly
          startingValue={vendor.rating}
          imageSize={16}
          style={styles.rating}
        />
        <Text style={styles.reviews}>({vendor.reviews} reviews)</Text>
      </View>
      <View style={styles.locationContainer}>
        <Icon name="location-on" type="material" size={16} color="#636E72" />
        <Text style={styles.location}>{vendor.location}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const VendorListScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [filteredVendors, setFilteredVendors] = useState(mockVendors);

  const updateSearch = (text) => {
    setSearch(text);
    const filtered = mockVendors.filter(vendor =>
      vendor.name.toLowerCase().includes(text.toLowerCase()) ||
      vendor.category.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredVendors(filtered);
  };

  const handleVendorPress = (vendor) => {
    navigation.navigate('VendorDetails', { vendor });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text h4 style={styles.title}>Discover Vendors</Text>
        <SearchBar
          placeholder="Search vendors..."
          onChangeText={updateSearch}
          value={search}
          containerStyle={styles.searchContainer}
          inputContainerStyle={styles.searchInputContainer}
          lightTheme
          round
        />
      </View>

      <FlatList
        data={filteredVendors}
        renderItem={({ item }) => (
          <VendorCard
            vendor={item}
            onPress={() => handleVendorPress(item)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 15,
    color: '#2D3436',
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  searchInputContainer: {
    backgroundColor: '#F5F6FA',
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vendorImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 15,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rating: {
    marginRight: 5,
  },
  reviews: {
    fontSize: 14,
    color: '#636E72',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 5,
  },
});

export default VendorListScreen; 