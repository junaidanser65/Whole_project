import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Alert, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/apiService';

const PROFILE_SECTIONS = [
  {
    title: 'Account',
    items: [
      { id: 'payment-methods', title: 'Payment Methods', icon: 'card-outline', screen: 'PaymentMethods' },
      { id: 'notifications', title: 'Notifications', icon: 'notifications-outline', screen: 'Notifications' },
      { id: 'saved-vendors', title: 'Saved Vendors', icon: 'heart-outline', screen: 'SavedVendors' },
    ],
  },
  {
    title: 'Bookings',
    items: [
      { id: 'booking-history', title: 'Booking History', icon: 'time-outline', screen: 'BookingHistory' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { id: 'settings', title: 'Settings', icon: 'settings-outline', screen: 'Settings' },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'help', title: 'Help & Support', icon: 'help-circle-outline', screen: 'Support' },
      { id: 'privacy', title: 'Privacy Policy', icon: 'shield-outline', screen: 'Privacy' },
      { id: 'terms', title: 'Terms of Service', icon: 'document-text-outline', screen: 'Terms' },
      { id: 'about', title: 'About', icon: 'information-circle-outline', screen: 'About' },
    ],
  },
];

export default function UserProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [profileData, setProfileData] = React.useState(null);

  const fetchProfile = async () => {
    try {
      if (user?.id) {
        const response = await api.get(`/user/profile/${user.id}`);
        if (response.success && response.profile) {
          setProfileData(response.profile);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Fetch profile when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [user?.id])
  );

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getProfileCompletion = () => {
    const requiredFields = [
      { field: 'name', weight: 2 },
      { field: 'phone_number', weight: 1 },
      { field: 'address', weight: 1 },
      { field: 'avatar_url', weight: 1 }
    ];

    const totalWeight = requiredFields.reduce((sum, field) => sum + field.weight, 0);
    const completedWeight = requiredFields.reduce((sum, field) => {
      const value = (profileData || user)?.[field.field];
      return sum + (value ? field.weight : 0);
    }, 0);

    return Math.round((completedWeight / totalWeight) * 100);
  };

  const getProfileStatus = () => {
    const completion = getProfileCompletion();
    if (completion === 0) return 'Complete Your Profile';
    if (completion < 50) return 'Profile Incomplete';
    if (completion < 100) return 'Almost Complete';
    return 'Profile Complete';
  };

  const getUserInitials = () => {
    const name = profileData?.name || user?.name || 'Guest';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Profile Info */}
        <LinearGradient
          colors={["#6366F1", "#8B5CF6", "#A855F7"]}
          style={styles.header}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Profile</Text>
            </View>
            
            {/* Profile Avatar and Info */}
            <View style={styles.profileSection}>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={() => navigation.navigate('EditProfile')}
              >
                {(profileData?.avatar_url || user?.avatar_url) ? (
                  <Image
                    source={{ uri: profileData?.avatar_url || user?.avatar_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{getUserInitials()}</Text>
                  </View>
                )}
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={16} color="#8B5CF6" />
                </View>
              </TouchableOpacity>
              
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>
                  {profileData?.name || user?.name || 'Guest User'}
                </Text>
                <Text style={styles.userEmail}>
                  {profileData?.email || user?.email || 'No email'}
                </Text>
                <Text style={styles.userPhone}>
                  {profileData?.phone_number || user?.phone_number || 'No phone'}
                </Text>
              </View>
            </View>
            
            {/* Profile Completion Card */}
            <View style={styles.completionCard}>
              <View style={styles.completionHeader}>
                <Text style={styles.completionTitle}>Profile Completion</Text>
                <Text style={styles.completionPercentage}>{getProfileCompletion()}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${getProfileCompletion()}%` }]} 
                />
              </View>
              <Text style={styles.completionStatus}>{getProfileStatus()}</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Profile Sections */}
        <View style={styles.contentContainer}>
          {PROFILE_SECTIONS.map((section, index) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionCard}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.menuItem,
                      itemIndex === section.items.length - 1 && styles.lastMenuItem
                    ]}
                    onPress={() => navigation.navigate(item.screen)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuItemIcon}>
                        <Ionicons name={item.icon} size={22} color="#8B5CF6" />
                      </View>
                      <Text style={styles.menuItemTitle}>{item.title}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
          
          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    marginTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    marginBottom: 24,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#E0E7FF',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#C7D2FE',
  },
  completionCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    backdropFilter: 'blur(10px)',
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  completionPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  completionStatus: {
    fontSize: 14,
    color: '#E0E7FF',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    marginTop: 8,
    backgroundColor: '#F8FAFC',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  logoutSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 100,
  },
}); 