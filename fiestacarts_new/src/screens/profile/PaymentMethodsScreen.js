import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, TouchableOpacity, SafeAreaView, StatusBar, Platform, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data - will be replaced with real API data later
const MOCK_PAYMENT_METHODS = [
  {
    id: '1',
    type: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 24,
    isDefault: true,
    holderName: 'John Doe',
  },
  {
    id: '2',
    type: 'mastercard',
    last4: '8888',
    expMonth: 10,
    expYear: 25,
    isDefault: false,
    holderName: 'John Doe',
  },
];

const PaymentMethodCard = ({ method, onSetDefault, onDelete }) => {
  const getCardIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'visa':
        return 'card-outline';
      case 'mastercard':
        return 'card-outline';
      default:
        return 'card-outline';
    }
  };

  const getCardColor = (type) => {
    switch (type.toLowerCase()) {
      case 'visa':
        return ['#1A1F71', '#0F3460'];
      case 'mastercard':
        return ['#EB001B', '#FF5F00'];
      default:
        return ['#6B7280', '#374151'];
    }
  };

  return (
    <View style={styles.paymentCard}>
      <LinearGradient
        colors={getCardColor(method.type)}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTypeContainer}>
            <Ionicons name={getCardIcon(method.type)} size={32} color="#FFF" />
            <Text style={styles.cardType}>
              {method.type.charAt(0).toUpperCase() + method.type.slice(1)}
            </Text>
          </View>
          {method.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardNumber}>
          <Text style={styles.cardNumberText}>•••• •••• •••• {method.last4}</Text>
        </View>
        
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.cardLabel}>CARDHOLDER</Text>
            <Text style={styles.cardValue}>{method.holderName}</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>EXPIRES</Text>
            <Text style={styles.cardValue}>{method.expMonth}/{method.expYear}</Text>
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.cardActions}>
        {!method.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onSetDefault(method.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#8B5CF6" />
            <Text style={styles.actionButtonText}>Set Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(method.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AddCardModal = ({ visible, onClose, onSubmit }) => {
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  const handleSubmit = () => {
    if (!cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    onSubmit(cardData);
    setCardData({ number: '', expiry: '', cvc: '', name: '' });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Card</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="card-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="1234 5678 9012 3456"
                  value={cardData.number}
                  onChangeText={(value) => setCardData({ ...cardData, number: value })}
                  keyboardType="numeric"
                  maxLength={19}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="MM/YY"
                    value={cardData.expiry}
                    onChangeText={(value) => setCardData({ ...cardData, expiry: value })}
                    keyboardType="numeric"
                    maxLength={5}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>CVC</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="123"
                    value={cardData.cvc}
                    onChangeText={(value) => setCardData({ ...cardData, cvc: value })}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="John Doe"
                  value={cardData.name}
                  onChangeText={(value) => setCardData({ ...cardData, name: value })}
                  autoCapitalize="words"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>Add Card</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function PaymentMethodsScreen({ navigation }) {
  const [paymentMethods, setPaymentMethods] = useState(MOCK_PAYMENT_METHODS);
  const [showAddCard, setShowAddCard] = useState(false);

  const handleSetDefault = (id) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
    Alert.alert('Success', 'Default payment method updated');
  };

  const handleDelete = (id) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method?.isDefault && paymentMethods.length > 1) {
      Alert.alert('Error', 'Cannot delete default payment method. Please set another card as default first.');
      return;
    }
    
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(
              paymentMethods.filter((method) => method.id !== id)
            );
          },
        },
      ]
    );
  };

  const handleAddCard = (cardData) => {
    const newCard = {
      id: Date.now().toString(),
      type: cardData.number.startsWith('4') ? 'visa' : 'mastercard',
      last4: cardData.number.slice(-4),
      expMonth: parseInt(cardData.expiry.split('/')[0]),
      expYear: parseInt(cardData.expiry.split('/')[1]),
      isDefault: paymentMethods.length === 0,
      holderName: cardData.name,
    };
    setPaymentMethods([...paymentMethods, newCard]);
    Alert.alert('Success', 'Payment method added successfully');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      {/* Header */}
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
            
            <Text style={styles.headerTitle}>Payment Methods</Text>
            
            <TouchableOpacity 
              style={styles.addHeaderButton}
              onPress={() => setShowAddCard(true)}
            >
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {paymentMethods.length > 0 ? (
          <View style={styles.cardsContainer}>
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                onSetDefault={handleSetDefault}
                onDelete={handleDelete}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyStateTitle}>No payment methods</Text>
            <Text style={styles.emptyStateText}>
              Add a payment method to make booking easier
            </Text>
            <TouchableOpacity
              style={styles.addFirstCardButton}
              onPress={() => setShowAddCard(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                style={styles.addFirstCardGradient}
              >
                <Ionicons name="add" size={20} color="#FFF" />
                <Text style={styles.addFirstCardText}>Add Payment Method</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      {paymentMethods.length > 0 && (
        <View style={styles.floatingButton}>
          <TouchableOpacity
            style={styles.fabButton}
            onPress={() => setShowAddCard(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              style={styles.fabGradient}
            >
              <Ionicons name="add" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      <AddCardModal
        visible={showAddCard}
        onClose={() => setShowAddCard(false)}
        onSubmit={handleAddCard}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:20,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  backButton: {
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
  addHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  paymentCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    padding: 20,
    height: 200,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  defaultBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  cardNumber: {
    flex: 1,
    justifyContent: 'center',
  },
  cardNumberText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 6,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addFirstCardButton: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 200,
  },
  addFirstCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  addFirstCardText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 8,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  fabButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPadding: {
    height: 100,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
}); 