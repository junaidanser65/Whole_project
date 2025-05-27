import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, Card, Button, Icon, Divider } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  },
  {
    id: '2',
    type: 'credit',
    last4: '1234',
    expiryMonth: '08',
    expiryYear: '25',
    brand: 'Mastercard',
    isDefault: false,
  },
];

const PaymentMethodCard = ({ method, onSetDefault, onDelete }) => {
  const getCardIcon = (brand) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'cc-visa';
      case 'mastercard':
        return 'cc-mastercard';
      case 'amex':
        return 'cc-amex';
      default:
        return 'credit-card';
    }
  };

  return (
    <Card containerStyle={styles.paymentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Icon
            name={getCardIcon(method.brand)}
            type="font-awesome"
            size={24}
            color="#2D3436"
          />
          <Text style={styles.cardNumber}>
            •••• {method.last4}
          </Text>
        </View>
        {method.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      <Divider style={styles.divider} />
      <View style={styles.cardDetails}>
        <Text style={styles.expiryText}>
          Expires {method.expiryMonth}/{method.expiryYear}
        </Text>
        <View style={styles.cardActions}>
          {!method.isDefault && (
            <Button
              title="Set as Default"
              type="clear"
              titleStyle={styles.actionButtonText}
              onPress={() => onSetDefault(method.id)}
            />
          )}
          <Button
            title="Delete"
            type="clear"
            titleStyle={[styles.actionButtonText, styles.deleteButton]}
            onPress={() => onDelete(method.id)}
          />
        </View>
      </View>
    </Card>
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
    // Navigate to add payment method screen
    // navigation.navigate('AddPaymentMethod');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content}>

        {paymentMethods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            onSetDefault={handleSetDefault}
            onDelete={handleDelete}
          />
        ))}

        <Button
          title="Add Payment Method"
          icon={
            <Icon
              name="add"
              type="material"
              size={24}
              color="#FFFFFF"
              style={styles.addIcon}
            />
          }
          buttonStyle={styles.addButton}
          containerStyle={styles.addButtonContainer}
          onPress={handleAddPaymentMethod}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6FA',
    paddingVertical: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  paymentCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardNumber: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  defaultBadge: {
    backgroundColor: '#ff4500',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  defaultText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 10,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryText: {
    color: '#636E72',
    fontSize: 14,
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButtonText: {
    color: '#ff4500',
    fontSize: 14,
  },
  deleteButton: {
    color: '#e74c3c',
  },
  addButtonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: '#ff4500',
    borderRadius: 12,
    paddingVertical: 15,
  },
  addIcon: {
    marginRight: 10,
  },
});

export default PaymentMethodsScreen; 