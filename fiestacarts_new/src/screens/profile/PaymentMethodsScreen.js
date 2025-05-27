import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { Button, Icon, Card, Input, Overlay } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';

// Mock data - will be replaced with real API data later
const MOCK_PAYMENT_METHODS = [
  {
    id: '1',
    type: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 24,
    isDefault: true,
  },
  {
    id: '2',
    type: 'mastercard',
    last4: '8888',
    expMonth: 10,
    expYear: 25,
    isDefault: false,
  },
];

const PaymentMethodCard = ({ method, onSetDefault, onDelete }) => {
  const getCardIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'visa':
        return 'credit-card';
      case 'mastercard':
        return 'payment';
      default:
        return 'credit-card';
    }
  };

  return (
    <Card containerStyle={[styles.card, method.isDefault && styles.defaultCard]}>
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Icon
            name={getCardIcon(method.type)}
            size={24}
            color={colors.primary}
            style={styles.cardIcon}
          />
          <View>
            <Text style={styles.cardType}>
              {method.type.charAt(0).toUpperCase() + method.type.slice(1)}
            </Text>
            <Text style={styles.cardNumber}>•••• {method.last4}</Text>
            <Text style={styles.cardExpiry}>
              Expires {method.expMonth}/{method.expYear}
            </Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          {!method.isDefault && (
            <Button
              title="Set Default"
              type="clear"
              onPress={() => onSetDefault(method.id)}
              titleStyle={styles.actionButtonText}
            />
          )}
          <Button
            icon={<Icon name="delete" color={colors.error} />}
            type="clear"
            onPress={() => onDelete(method.id)}
          />
        </View>
      </View>
      {method.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultText}>Default</Text>
        </View>
      )}
    </Card>
  );
};

const AddCardOverlay = ({ visible, onClose, onSubmit }) => {
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  const handleSubmit = () => {
    // TODO: Implement card validation and addition
    onSubmit(cardData);
    onClose();
  };

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onClose}
      overlayStyle={styles.overlay}
    >
      <Text style={styles.overlayTitle}>Add New Card</Text>
      <Input
        placeholder="Card Number"
        value={cardData.number}
        onChangeText={(value) => setCardData({ ...cardData, number: value })}
        keyboardType="numeric"
        leftIcon={<Icon name="credit-card" size={24} color={colors.textLight} />}
      />
      <View style={styles.cardRow}>
        <Input
          placeholder="MM/YY"
          value={cardData.expiry}
          onChangeText={(value) => setCardData({ ...cardData, expiry: value })}
          containerStyle={styles.expiryInput}
        />
        <Input
          placeholder="CVC"
          value={cardData.cvc}
          onChangeText={(value) => setCardData({ ...cardData, cvc: value })}
          containerStyle={styles.cvcInput}
          secureTextEntry
        />
      </View>
      <Input
        placeholder="Cardholder Name"
        value={cardData.name}
        onChangeText={(value) => setCardData({ ...cardData, name: value })}
        leftIcon={<Icon name="person" size={24} color={colors.textLight} />}
      />
      <Button
        title="Add Card"
        onPress={handleSubmit}
        buttonStyle={styles.submitButton}
      />
    </Overlay>
  );
};

export default function PaymentMethodsScreen() {
  const [paymentMethods, setPaymentMethods] = useState(MOCK_PAYMENT_METHODS);
  const [showAddCard, setShowAddCard] = useState(false);

  const handleSetDefault = (id) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
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
    // TODO: Implement actual card addition logic
    console.log('Adding new card:', cardData);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {paymentMethods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            onSetDefault={handleSetDefault}
            onDelete={handleDelete}
          />
        ))}
      </ScrollView>

      <Button
        title="Add New Card"
        onPress={() => setShowAddCard(true)}
        icon={<Icon name="add" color={colors.background} />}
        buttonStyle={styles.addButton}
        containerStyle={styles.addButtonContainer}
      />

      <AddCardOverlay
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
    backgroundColor: colors.background,
  },
  card: {
    borderRadius: 8,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.md,
  },
  defaultCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: spacing.md,
  },
  cardType: {
    ...typography.body,
    fontWeight: 'bold',
  },
  cardNumber: {
    ...typography.body,
    color: colors.textLight,
  },
  cardExpiry: {
    ...typography.caption,
    color: colors.textLight,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.primary,
    ...typography.body,
  },
  defaultBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  defaultText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: 'bold',
  },
  addButtonContainer: {
    padding: spacing.lg,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  overlay: {
    width: '90%',
    padding: spacing.lg,
    borderRadius: 8,
  },
  overlayTitle: {
    ...typography.h2,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  cardRow: {
    flexDirection: 'row',
  },
  expiryInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  cvcInput: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: spacing.md,
  },
}); 