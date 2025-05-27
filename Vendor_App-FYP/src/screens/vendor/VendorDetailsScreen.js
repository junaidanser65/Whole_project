import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Text, Button, Icon, Rating, Divider } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock services data
const mockServices = [
  {
    id: '1',
    name: 'Basic Package',
    description: 'Essential equipment for small events',
    price: 299,
    duration: '4 hours',
  },
  {
    id: '2',
    name: 'Premium Package',
    description: 'Complete setup for medium events',
    price: 599,
    duration: '6 hours',
  },
  {
    id: '3',
    name: 'Professional Package',
    description: 'Full-service solution for large events',
    price: 999,
    duration: '8 hours',
  },
];

const ServiceCard = ({ service, onPress }) => (
  <TouchableOpacity style={styles.serviceCard} onPress={onPress}>
    <View style={styles.serviceHeader}>
      <Text style={styles.serviceName}>{service.name}</Text>
      <Text style={styles.servicePrice}>${service.price}</Text>
    </View>
    <Text style={styles.serviceDuration}>Duration: {service.duration}</Text>
    <Text style={styles.serviceDescription}>{service.description}</Text>
  </TouchableOpacity>
);

const VendorDetailsScreen = ({ route, navigation }) => {
  const { vendor } = route.params;
  const [selectedService, setSelectedService] = useState(null);

  const handleBooking = (service) => {
    setSelectedService(service);
    // TODO: Navigate to booking screen
    console.log('Book service:', service);
  };

  const handleContactVendor = () => {
    navigation.navigate('ContactVendor', { vendor });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: vendor.image }} style={styles.vendorImage} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text h4 style={styles.vendorName}>{vendor.name}</Text>
            <View style={styles.ratingContainer}>
              <Rating
                readonly
                startingValue={vendor.rating}
                imageSize={20}
                style={styles.rating}
              />
              <Text style={styles.reviews}>({vendor.reviews} reviews)</Text>
            </View>
          </View>

          <View style={styles.locationContainer}>
            <Icon name="location-on" type="material" size={20} color="#636E72" />
            <Text style={styles.location}>{vendor.location}</Text>
          </View>

          <Divider style={styles.divider} />

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>
            {vendor.name} is a professional vendor specializing in {vendor.category.toLowerCase()} 
            services. We provide high-quality equipment and services for events of all sizes.
          </Text>

          <Divider style={styles.divider} />

          <Text style={styles.sectionTitle}>Services</Text>
          {mockServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onPress={() => handleBooking(service)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Contact Vendor"
          icon={
            <Icon
              name="message"
              type="material"
              size={20}
              color="#fff"
              style={{ marginRight: 10 }}
            />
          }
          buttonStyle={styles.contactButton}
          containerStyle={styles.buttonContainer}
          onPress={handleContactVendor}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  vendorImage: {
    width: width,
    height: 250,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 15,
  },
  vendorName: {
    color: '#2D3436',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 20,
  },
  location: {
    fontSize: 16,
    color: '#636E72',
    marginLeft: 5,
  },
  divider: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#636E72',
    lineHeight: 24,
  },
  serviceCard: {
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  serviceDuration: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#636E72',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F5F6FA',
  },
  buttonContainer: {
    width: '100%',
  },
  contactButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 15,
  },
});

export default VendorDetailsScreen; 