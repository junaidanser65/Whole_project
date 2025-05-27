import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text, Icon, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMenuById } from '../../services/menuService';

const MenuItemDetailsScreen = ({ route, navigation }) => {
  const { itemId } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        const response = await getMenuById(itemId);
        console.log('Menu item details:', response);
        
        if (response.success && response.menu_item) {
          setItem(response.menu_item);
        } else {
          setError('Failed to load menu item');
        }
      } catch (err) {
        console.error('Error fetching menu item:', err);
        setError(err.message || 'Failed to load menu item');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [itemId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text style={styles.loadingText}>Loading menu item...</Text>
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="error-outline" type="material" size={60} color="#FF4500" />
        <Text style={styles.errorText}>{error || 'Menu item not found'}</Text>
        <Button 
          title="Go Back" 
          onPress={() => navigation.goBack()} 
          buttonStyle={styles.errorButton}
        />
      </SafeAreaView>
    );
  }

  const InfoSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Image 
          source={{ uri: item.image || 'https://via.placeholder.com/400' }} 
          style={styles.image}
          onError={(e) => console.log('Image failed to load:', e.nativeEvent.error)}
        />
        <View style={styles.content}>
          <Text style={styles.category}>{item.category?.toUpperCase()}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.price}>${parseFloat(item.price).toFixed(2)}</Text>
          
          <View style={styles.availabilitySection}>
            <Text style={[styles.availabilityText, item.is_available ? styles.availableText : styles.unavailableText]}>
              {item.is_available ? 'Available' : 'Currently Unavailable'}
            </Text>
          </View>

          <InfoSection title="Ingredients">
            <View style={styles.tagContainer}>
              {item.ingredients?.map((ingredient, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </InfoSection>

          <InfoSection title="Allergens">
            <View style={styles.tagContainer}>
              {item.allergens?.map((allergen, index) => (
                <View key={index} style={[styles.tag, styles.allergenTag]}>
                  <Text style={[styles.tagText, styles.allergenText]}>{allergen}</Text>
                </View>
              ))}
            </View>
          </InfoSection>

          <InfoSection title="Nutritional Information">
            <View style={styles.nutritionGrid}>
              {Object.entries(item.nutritionalInfo || {}).map(([key, value]) => (
                <View key={key} style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{value}</Text>
                  <Text style={styles.nutritionLabel}>{key}</Text>
                </View>
              ))}
            </View>
          </InfoSection>
          
          <View style={styles.spacing} />
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Edit Item"
          onPress={() => navigation.navigate('EditMenuItem', { itemId })}
          buttonStyle={styles.editButton}
          icon={
            <Icon
              name="edit"
              type="material"
              size={20}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#636E72',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 30,
  },
  scrollView: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 24,
    paddingBottom: 32,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#636E72',
    marginBottom: 16,
    lineHeight: 24,
  },
  price: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ff4500',
    marginBottom: 24,
  },
  category: {
    fontSize: 14,
    color: '#ff4500',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 1,
  },
  availabilitySection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: 16,
    fontWeight: '600',
  },
  availableText: {
    color: '#2ecc71',
  },
  unavailableText: {
    color: '#e74c3c',
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  tag: {
    backgroundColor: '#F5F6FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 6,
  },
  tagText: {
    color: '#636E72',
    fontSize: 14,
    fontWeight: '500',
  },
  allergenTag: {
    backgroundColor: '#FFE9E9',
  },
  allergenText: {
    color: '#FF6B6B',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -12,
  },
  nutritionItem: {
    width: '50%',
    padding: 12,
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 6,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#636E72',
    textTransform: 'capitalize',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F6FA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  editButton: {
    backgroundColor: '#ff4500',
    borderRadius: 12,
    paddingVertical: 14,
  },
  spacing: {
    height: 24,
  },
});

export default MenuItemDetailsScreen;