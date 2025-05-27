import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  Animated,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from 'react-native-elements';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Grow Your Business',
    subtitle: 'Join our platform and reach more customers',
    images: [
      require('../../../assets/biryani.jpg'),
      require('../../../assets/tandoori.jpg'),
      require('../../../assets/fries.jpg'),
    ],
  },
  {
    id: '2',
    title: 'Manage Orders',
    subtitle: 'Easy order management and tracking',
    image: require('../../../assets/cochi.jpg'),
  },
  {
    id: '3',
    title: 'Boost Your Revenue',
    subtitle: 'with our growing customer base',
    avatars: Array(6).fill([
      require('../../../assets/biryani.jpg'),
      require('../../../assets/tandoori.jpg'),
      require('../../../assets/fries.jpg'),
      require('../../../assets/cochi.jpg'),
    ]),
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderDots = () => {
    return (
      <View style={styles.dotContainer}>
        {onboardingData.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index.toString()}
              style={[
                styles.dot,
                { width: dotWidth, opacity },
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.slideContent}>
          <View style={styles.contentWrapper}>
            {index === 0 && (
              <View style={styles.foodArchContainer}>
                {item.images.map((image, idx) => (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.foodCard,
                      {
                        transform: [
                          { translateX: Math.cos((idx * Math.PI) / 3) * (width * 0.2) },
                          { translateY: Math.sin((idx * Math.PI) / 3) * (width * 0.2) },
                          { rotate: `${idx * 30 - 30}deg` },
                        ],
                      },
                    ]}
                  >
                    <Image source={image} style={styles.foodImage} />
                    <View style={styles.cardOverlay}>
                      <Icon name="trending-up" type="material" color="#FFFFFF" size={24} />
                    </View>
                  </Animated.View>
                ))}
              </View>
            )}
            
            {index === 1 && (
              <View style={styles.restaurantContainer}>
                <View style={styles.restaurantCard}>
                  <Image source={item.image} style={styles.restaurantImage} />
                  <View style={styles.orderManagementOverlay}>
                    <Icon name="assignment" type="material" color="#FFFFFF" size={40} />
                    <Text style={styles.orderManagementText}>Smart Order Management</Text>
                  </View>
                </View>
              </View>
            )}

            {index === 2 && (
              <View style={styles.communityContainer}>
                <View style={styles.revenueCircle}>
                  <Icon name="attach-money" type="material" color="#FFFFFF" size={40} />
                  <Text style={styles.revenueText}>Increased Revenue</Text>
                </View>
                {item.avatars.map((avatarSet, idx) => {
                  const randomImage = avatarSet[Math.floor(Math.random() * avatarSet.length)];
                  return (
                    <Animated.View
                      key={idx}
                      style={[
                        styles.avatarCircle,
                        {
                          transform: [
                            { translateX: Math.cos((idx * Math.PI * 2) / 6) * (width * 0.25) },
                            { translateY: Math.sin((idx * Math.PI * 2) / 6) * (width * 0.25) },
                          ],
                        },
                      ]}
                    >
                      <Image source={randomImage} style={styles.avatarImage} />
                    </Animated.View>
                  );
                })}
              </View>
            )}

            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#ff4500", "#cc3700"]} style={styles.gradient}>
        <FlatList
          ref={slideRef}
          data={onboardingData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
        />

        {renderDots()}

        <View style={styles.buttonContainer}>
          {currentIndex === onboardingData.length - 1 ? (
            <>
              <Button
                title="Get Started"
                buttonStyle={styles.primaryButton}
                titleStyle={styles.primaryButtonText}
                containerStyle={styles.buttonWrapper}
                onPress={() => navigation.navigate("Signup")}
              />
              <Button
                title="I already have an account"
                type="clear"
                titleStyle={styles.secondaryButtonText}
                containerStyle={styles.buttonWrapper}
                onPress={() => navigation.navigate("Login")}
              />
            </>
          ) : (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => {
                slideRef.current.scrollToIndex({
                  index: currentIndex + 1,
                  animated: true,
                });
              }}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  gradient: {
    flex: 1,
  },
  slide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  foodArchContainer: {
    height: width * 0.8,
    width: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  foodCard: {
    position: 'absolute',
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  restaurantContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  restaurantCard: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  communityContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
    zIndex: 1,
  },
  avatarCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    zIndex: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 20,
    position: 'relative',
    zIndex: 11,
  },
  buttonWrapper: {
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: '#ff4500',
    borderRadius: 25,
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#ff4500',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignSelf: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  orderManagementOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  orderManagementText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  revenueCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  revenueText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default OnboardingScreen;