import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Avatar, Icon, Button, ListItem } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

const PROFILE_SECTIONS = [
  {
    title: 'Account',
    items: [
      { id: 'edit-profile', title: 'Edit Profile', icon: 'person', screen: 'EditProfile' },
      { id: 'payment-methods', title: 'Payment Methods', icon: 'credit-card', screen: 'PaymentMethods' },
      { id: 'notifications', title: 'Notifications', icon: 'notifications', screen: 'Notifications' },
      { id: 'saved-vendors', title: 'Saved Vendors', icon: 'favorite', screen: 'SavedVendors' },
    ],
  },
  {
    title: 'Bookings',
    items: [
      { id: 'booking-history', title: 'Booking History', icon: 'history', screen: 'BookingHistory' },
      { id: 'upcoming-bookings', title: 'Upcoming Bookings', icon: 'event', screen: 'BookingHistory' },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'help', title: 'Help & Support', icon: 'help', screen: 'Support' },
      { id: 'privacy', title: 'Privacy Policy', icon: 'privacy-tip', screen: 'Privacy' },
      { id: 'terms', title: 'Terms of Service', icon: 'description', screen: 'Terms' },
      { id: 'about', title: 'About', icon: 'info', screen: 'About' },
    ],
  },
];

export default function UserProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getProfileCompletion = () => {
    const requiredFields = ['first_name', 'last_name', 'avatar_url'];
    const completedFields = requiredFields.filter(field => user[field]);
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Avatar
              size={80}
              rounded
              source={user?.avatar_url ? { uri: user.avatar_url } : undefined}
              icon={!user?.avatar_url ? { name: 'person', type: 'material' } : undefined}
              containerStyle={styles.avatar}
            >
              <Avatar.Accessory size={24} />
            </Avatar>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>
                {user?.first_name ? `${user.first_name} ${user.last_name}` : 'Complete Your Profile'}
              </Text>
              <Text style={styles.email}>{user?.email}</Text>
            </View>
          </TouchableOpacity>

          {/* Profile Completion */}
          <View style={styles.completionContainer}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionTitle}>Profile Completion</Text>
              <Text style={styles.completionPercentage}>{getProfileCompletion()}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${getProfileCompletion()}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      </View>

      {/* Profile Sections */}
      <View style={styles.sectionsContainer}>
        {PROFILE_SECTIONS.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <ListItem
                key={item.id}
                onPress={() => navigation.navigate(item.screen)}
                containerStyle={[
                  styles.listItem,
                  itemIndex === 0 && styles.firstListItem,
                  itemIndex === section.items.length - 1 && styles.lastListItem,
                ]}
              >
                <Icon name={item.icon} color={colors.primary} size={24} />
                <ListItem.Content>
                  <ListItem.Title style={styles.listItemTitle}>{item.title}</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron color={colors.textLight} />
              </ListItem>
            ))}
          </View>
        ))}
      </View>

      {/* Logout Button */}
      <Button
        title="Logout"
        onPress={handleLogout}
        loading={loading}
        buttonStyle={styles.logoutButton}
        titleStyle={styles.logoutButtonText}
        containerStyle={styles.logoutButtonContainer}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    padding: spacing.lg,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    borderWidth: 3,
    borderColor: colors.background,
  },
  profileInfo: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  name: {
    ...typography.h2,
    color: colors.background,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.body,
    color: colors.background,
    opacity: 0.8,
  },
  completionContainer: {
    marginTop: spacing.md,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  completionTitle: {
    ...typography.body,
    color: colors.background,
    opacity: 0.8,
  },
  completionPercentage: {
    ...typography.h3,
    color: colors.background,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.background,
    borderRadius: 3,
  },
  sectionsContainer: {
    padding: spacing.md,
    marginTop: -spacing.xl,
  },
  section: {
    backgroundColor: colors.background,
    borderRadius: 16,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textLight,
    padding: spacing.md,
  },
  listItem: {
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  firstListItem: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lastListItem: {
    borderBottomWidth: 0,
  },
  listItemTitle: {
    ...typography.body,
    color: colors.text,
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingVertical: spacing.md,
  },
  logoutButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: 'bold',
  },
  logoutButtonContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
}); 