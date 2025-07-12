import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data for payment methods
const mockPaymentMethods = [
  {
    id: '1',
    type: 'credit',
    last4: '4242',
    expiryMonth: '12',
    expiryYear: '24',
    brand: 'Visa',
    isDefault: true,
    cardholderName: 'John Doe',
  },
  {
    id: '2',
    type: 'credit',
    last4: '1234',
    expiryMonth: '08',
    expiryYear: '25',
    brand: 'Mastercard',
    isDefault: false,
    cardholderName: 'John Doe',
  },
  {
    id: '3',
    type: 'paypal',
    email: 'john.doe@example.com',
    isDefault: false,
  },
];

const PaymentMethodCard = ({ method, onSetDefault, onDelete }) => {
  const getCardIcon = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return { name: 'card', color: '#1A1F71' };
      case 'mastercard':
        return { name: 'card', color: '#EB001B' };
      case 'amex':
        return { name: 'card', color: '#006FCF' };
      default:
        return { name: 'card-outline', color: '#6366F1' };
    }
  };

  const getPayPalIcon = () => ({
    name: 'logo-paypal',
    color: '#0070BA'
  });

  const isCard = method.type === 'credit';
  const iconConfig = isCard ? getCardIcon(method.brand) : getPayPalIcon();

  return (
    <View style={styles.paymentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View style={[styles.cardIcon, { backgroundColor: `${iconConfig.color}15` }]}>
            <Ionicons name={iconConfig.name} size={24} color={iconConfig.color} />
          </View>
          <View style={styles.cardInfo}>
            {isCard ? (
              <>
                <Text style={styles.cardBrand}>{method.brand}</Text>
                <Text style={styles.cardNumber}>•••• •••• •••• {method.last4}</Text>
                <Text style={styles.cardExpiry}>Expires {method.expiryMonth}/{method.expiryYear}</Text>
              </>
            ) : (
              <>
                <Text style={styles.cardBrand}>PayPal</Text>
                <Text style={styles.cardNumber}>{method.email}</Text>
                <Text style={styles.cardExpiry}>Digital wallet</Text>
              </>
            )}
          </View>
        </View>
        
        {method.isDefault && (
          <View style={styles.defaultBadge}>
            <Ionicons name="checkmark-circle" size={16} color="white" />
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        {!method.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onSetDefault(method.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#6366F1" />
            <Text style={styles.actionButtonText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteActionButton]}
          onPress={() => onDelete(method.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text style={[styles.actionButtonText, styles.deleteActionText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PaymentMethodsScreen = ({ navigation }) => {
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);

  const handleSetDefault = (id) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const handleDelete = (id) => {
    const methodToDelete = paymentMethods.find(method => method.id === id);
    
    Alert.alert(
      'Delete Payment Method',
      `Are you sure you want to delete this ${methodToDelete?.type === 'credit' ? 'card' : 'payment method'}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            setPaymentMethods(methods =>
              methods.filter(method => method.id !== id)
            );
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'Choose a payment method to add',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Credit/Debit Card',
          onPress: () => {
            // Navigate to add card screen
            console.log('Add card');
          },
        },
        {
          text: 'PayPal',
          onPress: () => {
            // Navigate to PayPal setup
            console.log('Add PayPal');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <Text style={styles.headerSubtitle}>{paymentMethods.length} method{paymentMethods.length !== 1 ? 's' : ''} added</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleAddPaymentMethod}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment Methods Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Payment Methods</Text>
          
          {paymentMethods.length > 0 ? (
            paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                onSetDefault={handleSetDefault}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No Payment Methods</Text>
              <Text style={styles.emptyStateText}>
                Add a payment method to make transactions easier and faster.
              </Text>
            </View>
          )}
        </View>

        {/* Security Information */}
        <View style={styles.section}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={styles.securityTitle}>Secure & Protected</Text>
          </View>
          <Text style={styles.securityDescription}>
            Your payment information is encrypted and securely stored. We never share your 
            financial details with vendors or third parties.
          </Text>
          
          <View style={styles.securityFeatures}>
            <View style={styles.securityFeature}>
              <Ionicons name="lock-closed" size={16} color="#6366F1" />
              <Text style={styles.securityFeatureText}>256-bit SSL encryption</Text>
            </View>
            <View style={styles.securityFeature}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.securityFeatureText}>PCI DSS compliant</Text>
            </View>
            <View style={styles.securityFeature}>
              <Ionicons name="eye-off" size={16} color="#8B5CF6" />
              <Text style={styles.securityFeatureText}>No data sharing</Text>
            </View>
          </View>
        </View>

        <View style={styles.spacing} />
      </ScrollView>

      {/* Add Payment Method Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPaymentMethod}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 20,
  },
  paymentCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  defaultBadge: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  defaultText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  deleteActionButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 6,
  },
  deleteActionText: {
    color: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
  },
  securityDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  securityFeatures: {
    gap: 8,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityFeatureText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  spacing: {
    height: 24,
  },
});

export default PaymentMethodsScreen; 