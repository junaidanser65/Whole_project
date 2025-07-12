import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function BookingSuccess({ route, navigation }) {
  const { booking } = route.params;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate entrance
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      <LinearGradient
        colors={["#6366F1", "#8B5CF6", "#A855F7"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Booking Success!</Text>
            <Text style={styles.headerSubtitle}>Your reservation is confirmed</Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.container,
          { opacity: fadeAnim }
        ]}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.successHeader,
              {
                transform: [
                  { scale: scaleAnim },
                  {
                    translateY: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.successIconContainer}>
              <LinearGradient
                colors={["#10B981", "#059669"]}
                style={styles.successIconGradient}
              >
                <Ionicons name="checkmark" size={48} color="#FFF" />
              </LinearGradient>
            </View>
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successMessage}>
              Your booking has been successfully created and is now pending vendor confirmation
            </Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.bookingCard,
              {
                transform: [
                  { scale: scaleAnim },
                  {
                    translateY: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.sectionTitle}>Booking Details</Text>
            
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar-outline" size={20} color="#6366F1" />
              </View>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailText}>{formatDate(booking.selectedDate)}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="time-outline" size={20} color="#6366F1" />
              </View>
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailText}>{formatTime(booking.selectedTime)}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="people-outline" size={20} color="#6366F1" />
              </View>
              <Text style={styles.detailLabel}>Guests:</Text>
              <Text style={styles.detailText}>{booking.guests}</Text>
            </View>

            {booking.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Special Requests:</Text>
                <Text style={styles.notesText}>{booking.notes}</Text>
              </View>
            )}

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>
                ${booking.totalPrice.toLocaleString()}
              </Text>
            </View>
          </Animated.View>

          <Animated.View 
            style={[
              styles.buttonContainer,
              {
                transform: [
                  { scale: scaleAnim },
                  {
                    translateY: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'MainApp',
                      state: {
                        routes: [{ name: 'Bookings' }]
                      }
                    }
                  ],
                });
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                style={styles.primaryButtonGradient}
              >
                <Ionicons name="cart" size={20} color="#FFF" />
                <Text style={styles.primaryButtonText}>View My Bookings</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Dashboard')}
              activeOpacity={0.8}
            >
              <Ionicons name="home" size={20} color="#6366F1" />
              <Text style={styles.secondaryButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  successIconContainer: {
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginRight: 8,
    minWidth: 60,
  },
  detailText: {
    fontSize: 16,
    color: '#0F172A',
    flex: 1,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366F1',
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#6366F1',
    backgroundColor: '#FFF',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 8,
  },
}); 