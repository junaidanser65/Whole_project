import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, Animated, Switch } from 'react-native';
import { Text, Avatar, ListItem, Icon, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { locationService } from '../../services/locationService';
import { websocketService } from '../../services/websocketService';
import { apiClient, getTotalBookings, getVendorReviews } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

const menuItems = [
  {
    section: 'Account',
    items: [
      {
        title: 'Payment Methods',
        icon: 'payment',
        screen: 'PaymentMethods',
        rightIcon: 'credit-card',
      },
    ],
  },
  {
    section: 'Preferences',
    items: [
      {
        title: 'Notifications',
        icon: 'notifications',
        screen: 'Notifications',
        badge: '3', // Number of unread notifications
      },
      {
        title: 'Help & Support',
        icon: 'help',
        screen: 'Support',
      },
      {
        title: 'Privacy Policy',
        icon: 'privacy-tip',
        screen: 'Privacy',
      },
    ],
  },
];

const ProfileScreen = ({ navigation }) => {
  const { user, logout, loading } = useAuth();
  const [pressedItem, setPressedItem] = useState(null);
  const scaleAnim = new Animated.Value(1);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalReviews: 0
  });

  // Fetch profile data and stats
  const fetchProfile = async () => {
    try {
      if (user?.id) {
        console.log('Fetching profile for user ID:', user.id);
        const { profile } = await apiClient.getProfileById(user.id);
        console.log('Raw profile data received:', profile);
        console.log('Profile image URL:', profile?.profile_image);
        setProfileData(profile);

        // Fetch total bookings
        const bookingsResponse = await getTotalBookings();
        if (bookingsResponse.success) {
          setStats(prev => ({
            ...prev,
            totalBookings: bookingsResponse.total_bookings
          }));
        }

        // Fetch total reviews
        const reviewsResponse = await getVendorReviews();
        if (reviewsResponse.success) {
          setStats(prev => ({
            ...prev,
            totalReviews: reviewsResponse.reviews.length
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Use useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Profile screen focused, refreshing data...');
      fetchProfile();
    }, [user?.id])
  );

  // Initial profile fetch
  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  // Add debug logging for profile data changes
  useEffect(() => {
    console.log('Profile data updated:', profileData);
    console.log('Current profile image URL:', profileData?.profile_image);
  }, [profileData]);

  // Add debug logging
  useEffect(() => {
    console.log('User data in ProfileScreen:', user);
    console.log('Profile image URL:', user?.profile_image);
  }, [user]);

  // Initialize WebSocket connection
  useEffect(() => {
    websocketService.connect();
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Handle availability toggle
  const handleAvailabilityToggle = async (value) => {
    try {
      if (value) {
        // Start location tracking when becoming available
        const success = await locationService.startLocationUpdates(user.id);
        if (!success) {
          Alert.alert(
            'Location Permission Required',
            'Please enable location services to make yourself available.',
            [{ text: 'OK' }]
          );
          return;
        }
      } else {
        // Stop location tracking when becoming unavailable
        await locationService.stopLocationUpdates();
      }
      
      setIsAvailable(value);
    } catch (error) {
      console.error('Error toggling availability:', error);
      Alert.alert('Error', 'Failed to update availability status');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (!result.success) {
              Alert.alert("Error", "Failed to logout. Please try again.");
            } else {
              // Navigate to Welcome Screen
              navigation.reset({
                index: 0,
                routes: [{ name: "Welcome" }],
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', {
      onProfileUpdate: () => {
        // This will trigger a refresh when returning from EditProfile
        fetchProfile();
      }
    });
  };

  const handlePressIn = (index) => {
    setPressedItem(index);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setPressedItem(null);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#ff4500", "#cc3700"]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Avatar
                size={100}
                rounded
                source={
                  profileData?.profile_image
                    ? { uri: profileData.profile_image }
                    : undefined
                }
                icon={!profileData?.profile_image ? { name: 'store', type: 'material' } : undefined}
                containerStyle={styles.avatar}
                onPress={() => console.log('Avatar pressed, current image URL:', profileData?.profile_image)}
              >
                <Avatar.Accessory
                  size={25}
                  onPress={handleEditProfile}
                  containerStyle={styles.avatarAccessory}
                />
              </Avatar>
            </View>
            <Text h3 style={styles.name}>
              {profileData?.name || user?.name || "User"}
            </Text>
            <Text style={styles.email}>
              {profileData?.email || user?.email || "email@example.com"}
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalBookings}</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalReviews}</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
            </View>
            <View style={styles.availabilityContainer}>
              <Text style={styles.availabilityText}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </Text>
              <Switch
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isAvailable ? '#ff4500' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={handleAvailabilityToggle}
                value={isAvailable}
                style={styles.switch}
              />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.menuContainer}>
          {menuItems.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.section}</Text>
              {section.items.map((item, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.menuItemContainer,
                    {
                      transform: [
                        {
                          scale:
                            pressedItem === `${sectionIndex}-${index}`
                              ? scaleAnim
                              : 1,
                        },
                      ],
                    },
                  ]}
                >
                  <ListItem
                    onPress={() => navigation.navigate(item.screen)}
                    onPressIn={() => handlePressIn(`${sectionIndex}-${index}`)}
                    onPressOut={handlePressOut}
                    containerStyle={styles.menuItem}
                  >
                    <Icon
                      name={item.icon}
                      type="material"
                      color="#ff4500"
                      containerStyle={styles.menuIcon}
                    />
                    <ListItem.Content>
                      <ListItem.Title style={styles.menuTitle}>
                        {item.title}
                      </ListItem.Title>
                    </ListItem.Content>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    {item.rightIcon ? (
                      <Icon
                        name={item.rightIcon}
                        type="material"
                        color="#636E72"
                        size={20}
                      />
                    ) : (
                      <ListItem.Chevron color="#636E72" />
                    )}
                  </ListItem>
                </Animated.View>
              ))}
            </View>
          ))}
        </View>

        <Button
          title="Logout"
          type="clear"
          icon={
            <Icon
              name="logout"
              type="material"
              size={20}
              color="#ff4500"
              style={{ marginRight: 10 }}
            />
          }
          titleStyle={styles.logoutButtonText}
          containerStyle={styles.logoutButtonContainer}
          onPress={handleLogout}
          loading={loading}
          disabled={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerGradient: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 40,
  },
  avatarContainer: {
    marginBottom: 15,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
  },
  avatar: {
    borderWidth: 4,
    borderColor: "#FFF",
  },
  avatarAccessory: {
    backgroundColor: "#ff4500",
    borderColor: "#FFF",
    borderRadius: 12,
  },
  name: {
    color: "#FFF",
    marginBottom: 5,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  email: {
    color: "#FFF",
    fontSize: 16,
    marginBottom: 20,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 15,
  },
  statNumber: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statLabel: {
    color: "#FFF",
    fontSize: 12,
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 10,
  },
  menuContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 10,
    paddingLeft: 10,
  },
  menuItemContainer: {
    marginBottom: 8,
  },
  menuItem: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  menuIcon: {
    backgroundColor: "#ffe0cc",
    padding: 8,
    borderRadius: 10,
  },
  menuTitle: {
    color: "#2D3436",
    fontSize: 16,
    fontWeight: "500",
  },
  badge: {
    backgroundColor: "#ff4500",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 10,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  logoutButtonContainer: {
    marginTop: 10,
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  logoutButtonText: {
    color: "#ff4500",
    fontSize: 16,
    fontWeight: "600",
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F0F3F5',
    borderRadius: 10,
    marginTop: 20,
  },
  availabilityText: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '500',
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
});

export default ProfileScreen;