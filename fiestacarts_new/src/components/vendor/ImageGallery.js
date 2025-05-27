import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Image, Dimensions, ActivityIndicator } from 'react-native';
import { colors, spacing } from '../../styles/theme';
import { Icon } from '@rneui/themed';

const { width } = Dimensions.get('window');

const ImageGallery = ({ images = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [loadingImages, setLoadingImages] = useState({});

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
    setLoadingImages(prev => ({ ...prev, [index]: false }));
  };

  const handleImageLoadStart = (index) => {
    setLoadingImages(prev => ({ ...prev, [index]: true }));
  };

  const handleImageLoadEnd = (index) => {
    setLoadingImages(prev => ({ ...prev, [index]: false }));
  };

  if (!images || images.length === 0) {
    return (
      <View style={styles.fallbackContainer}>
        <Icon name="image" size={48} color={colors.textLight} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(
            event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
          );
          setActiveIndex(newIndex);
        }}
      >
        {images.map((image, index) => (
          <View key={`gallery-image-${index}`} style={styles.imageContainer}>
            {!imageErrors[index] ? (
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={() => handleImageError(index)}
                  onLoadStart={() => handleImageLoadStart(index)}
                  onLoadEnd={() => handleImageLoadEnd(index)}
                />
                {loadingImages[index] && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.fallbackContainer}>
                <Icon name="image" size={48} color={colors.textLight} />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      
      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    width: '100%',
  },
  imageContainer: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
  },
});

export default ImageGallery; 