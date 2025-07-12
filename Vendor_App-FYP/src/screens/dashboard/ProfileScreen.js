import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, Animated, Switch, TouchableOpacity } from 'react-native';
import { Text, Avatar, ListItem, Icon, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { locationService } from '../../services/locationService';
import { websocketService } from '../../services/websocketService';
import { apiClient, getTotalBookings, getVendorReviews } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
  const { user, logout, loading, updateUser } = useAuth();
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

  // Sync availability state with user context
  useEffect(() => {
    if (user?.isAvailable !== undefined) {
      setIsAvailable(user.isAvailable);
    }
  }, [user?.isAvailable]);

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
      
      // Update local state
      setIsAvailable(value);
      
      // Persist availability state in user context and backend
      if (updateUser) {
        const updatedUser = {
          ...user,
          isAvailable: value
        };
        await updateUser(updatedUser);
        
        // Also update in backend if there's an update profile endpoint
        try {
          await apiClient.updateProfile({ isAvailable: value });
        } catch (apiError) {
          console.warn('Failed to update availability in backend:', apiError);
          // Don't throw error here as local state is already updated
        }
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      Alert.alert('Error', 'Failed to update availability status');
      // Revert local state on error
      setIsAvailable(!value);
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

  const getIconBackground = (iconName) => {
    switch (iconName) {
      case 'payment':
        return '#EEF2FF';
      case 'notifications':
        return '#E0F2FE';
      case 'help':
        return '#FDE68A';
      case 'privacy-tip':
        return '#E0F2FE';
      default:
        return '#EEF2FF';
    }
  };

  const getIconColor = (iconName) => {
    switch (iconName) {
      case 'payment':
        return '#6366F1';
      case 'notifications':
        return '#3B82F6';
      case 'help':
        return '#D97706';
      case 'privacy-tip':
        return '#3B82F6';
      default:
        return '#6366F1';
    }
  };

  const getIoniconName = (iconName) => {
    switch (iconName) {
      case 'payment':
        return 'card';
      case 'notifications':
        return 'notifications';
      case 'help':
        return 'help-circle';
      case 'privacy-tip':
        return 'shield-checkmark';
      default:
        return 'person';
    }
  };

  const getMenuSubtitle = (title) => {
    switch (title) {
      case 'Payment Methods':
        return 'Manage your payment methods and billing details';
      case 'Notifications':
        return 'Customize your notification preferences';
      case 'Help & Support':
        return 'Get help and support from our team';
      case 'Privacy Policy':
        return 'Review our privacy policy and terms of service';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={["#6366F1", "#8B5CF6", "#A855F7"]}
          style={styles.headerGradient}
        >
          {/* Back Button */}
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.headerRight} />
          </View>

          {/* Profile Header Content */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <Avatar
                  size={120}
                  rounded
                  source={
                    profileData?.profile_image
                      ? { uri: profileData.profile_image }
                      : undefined
                  }
                  icon={!profileData?.profile_image ? { name: 'store', type: 'material' } : undefined}
                  containerStyle={styles.avatar}
                >
                  <Avatar.Accessory
                    size={28}
                    onPress={handleEditProfile}
                    containerStyle={styles.avatarAccessory}
                  />
                </Avatar>
              </View>
              
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {profileData?.name || user?.name || "User"}
                </Text>
                <Text style={styles.userEmail}>
                  {profileData?.email || user?.email || "email@example.com"}
                </Text>
              </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsSection}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.totalBookings}</Text>
                <Text style={styles.statLabel}>ORDERS</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.totalReviews}</Text>
                <Text style={styles.statLabel}>REVIEWS</Text>
              </View>
            </View>

            {/* Availability Toggle */}
            <View style={styles.availabilityCard}>
              <View style={styles.availabilityContent}>
                <View>
                  <Text style={styles.availabilityTitle}>Availability Status</Text>
                  <Text style={styles.availabilitySubtitle}>
                    {isAvailable ? 'You are currently available for orders' : 'You are currently unavailable'}
                  </Text>
                </View>
                <Switch
                  trackColor={{ false: 'rgba(255, 255, 255, 0.3)', true: 'rgba(255, 255, 255, 0.4)' }}
                  thumbColor={isAvailable ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)'}
                  ios_backgroundColor="rgba(255, 255, 255, 0.3)"
                  onValueChange={handleAvailabilityToggle}
                  value={isAvailable}
                  style={styles.switch}
                />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Content Sections */}
        <View style={styles.contentContainer}>
          {menuItems.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.section}</Text>
                <Text style={styles.sectionSubtitle}>
                  {section.section === 'Account' ? 'Manage your account settings' : 'App preferences and support'}
                </Text>
              </View>
              
              <View style={styles.menuGrid}>
                {section.items.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.modernMenuItem}
                    onPress={() => navigation.navigate(item.screen)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemContent}>
                      <View style={[styles.menuIconContainer, { backgroundColor: getIconBackground(item.icon) }]}>
                        <Ionicons 
                          name={getIoniconName(item.icon)} 
                          size={24} 
                          color={getIconColor(item.icon)} 
                        />
                      </View>
                      
                      <View style={styles.menuTextContainer}>
                        <Text style={styles.menuItemTitle}>{item.title}</Text>
                        <Text style={styles.menuItemSubtitle}>
                          {getMenuSubtitle(item.title)}
                        </Text>
                      </View>

                      <View style={styles.menuItemRight}>
                        {item.badge && (
                          <View style={styles.modernBadge}>
                            <Text style={styles.badgeText}>{item.badge}</Text>
                          </View>
                        )}
                        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Logout Section */}
          <View style={styles.logoutSection}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              <Text style={styles.logoutButtonText}>Logout</Text>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  profileHeader: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 15,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  avatar: {
    borderWidth: 4,
    borderColor: "#FFF",
  },
  avatarAccessory: {
    backgroundColor: "#6366F1",
    borderColor: "#FFF",
    borderWidth: 2,
    borderRadius: 14,
    elevation: 4,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
  },
  statCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  availabilityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 20,
  },
  availabilityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  availabilitySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  
  // Content Section
  contentContainer: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },
  
     // Menu Grid
   menuGrid: {
     // Simple vertical stack for full-width items
   },
     modernMenuItem: {
     width: '100%', // Full width for better readability
     backgroundColor: "#FFFFFF",
     borderRadius: 16,
     elevation: 2,
     shadowColor: "#64748B",
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.04,
     shadowRadius: 16,
     marginBottom: 12,
     overflow: 'hidden',
   },
   menuItemContent: {
     flexDirection: 'row',
     alignItems: 'center',
     paddingVertical: 20,
     paddingHorizontal: 20,
   },
   menuIconContainer: {
     width: 56,
     height: 56,
     borderRadius: 16,
     justifyContent: 'center',
     alignItems: 'center',
     marginRight: 16,
   },
   menuTextContainer: {
     flex: 1,
   },
   menuItemTitle: {
     fontSize: 16,
     fontWeight: "700",
     color: "#0F172A",
     letterSpacing: -0.2,
     marginBottom: 4,
   },
   menuItemSubtitle: {
     fontSize: 14,
     color: "#64748B",
     marginTop: 2,
     lineHeight: 20,
   },
   menuItemRight: {
     flexDirection: 'row',
     alignItems: 'center',
   },
  modernBadge: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 12,
    elevation: 2,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  
     // Logout Section
   logoutSection: {
     marginTop: 20,
     marginBottom: 40,
   },
   logoutButton: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'space-between',
     backgroundColor: "#FFFFFF",
     borderRadius: 16,
     elevation: 2,
     shadowColor: "#64748B",
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.04,
     shadowRadius: 16,
     paddingVertical: 20,
     paddingHorizontal: 20,
   },
   logoutButtonText: {
     color: "#EF4444",
     fontSize: 16,
     fontWeight: "700",
     letterSpacing: -0.2,
     flex: 1,
     marginLeft: 16,
   },
});

export default ProfileScreen;