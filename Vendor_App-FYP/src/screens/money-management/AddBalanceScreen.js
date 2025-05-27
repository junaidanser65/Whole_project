import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, Input, Button, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const QUICK_AMOUNTS = [50, 100, 200, 500];

const AddBalanceScreen = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleAddBalance = async () => {
    if (!amount || !selectedMethod) {
      alert('Please enter an amount and select a payment method');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual balance addition logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigation.goBack();
    } catch (error) {
      alert('Failed to add balance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PaymentMethodCard = ({ method, icon, last4 }) => (
    <TouchableOpacity
      style={[
        styles.methodCard,
        selectedMethod === method && styles.methodCardSelected
      ]}
      onPress={() => setSelectedMethod(method)}
    >
      <Icon
        name={icon}
        type="material"
        size={24}
        color={selectedMethod === method ? '#FF6B6B' : '#636E72'}
      />
      <View style={styles.methodInfo}>
        <Text style={styles.methodTitle}>{method}</Text>
        {last4 && <Text style={styles.methodDetails}>•••• {last4}</Text>}
      </View>
      <Icon
        name={selectedMethod === method ? 'radio-button-checked' : 'radio-button-unchecked'}
        type="material"
        size={24}
        color={selectedMethod === method ? '#FF6B6B' : '#636E72'}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.content}>
          <Animated.View style={[styles.balanceSection, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={['#FF9A8B', '#FF6A88', '#FF99AC']}
              style={styles.balanceGradient}
            >
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceAmount}>$1,234.56</Text>
            </LinearGradient>
          </Animated.View>

          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>Enter Amount</Text>
            <Input
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              leftIcon={
                <Text style={styles.currencySymbol}>$</Text>
              }
              inputStyle={styles.amountInput}
              containerStyle={styles.amountContainer}
              inputContainerStyle={styles.amountInputContainer}
            />

            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={styles.quickAmountButton}
                  onPress={() => setAmount(quickAmount.toString())}
                >
                  <Text style={styles.quickAmountText}>${quickAmount}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.methodsSection}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <PaymentMethodCard
              method="Credit Card"
              icon="credit-card"
              last4="4242"
            />
            <PaymentMethodCard
              method="Bank Account"
              icon="account-balance"
              last4="1234"
            />
            <TouchableOpacity style={styles.addMethodButton}>
              <Icon name="add" type="material" size={24} color="#FF6B6B" />
              <Text style={styles.addMethodText}>Add New Payment Method</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={loading ? 'Processing...' : 'Add Balance'}
            onPress={handleAddBalance}
            loading={loading}
            disabled={loading || !amount || !selectedMethod}
            buttonStyle={styles.addButton}
            containerStyle={styles.buttonContainer}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  balanceSection: {
    padding: 20,
  },
  balanceGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#FFF',
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  amountSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 15,
  },
  amountContainer: {
    paddingHorizontal: 0,
  },
  amountInputContainer: {
    borderWidth: 1,
    borderColor: '#DFE6E9',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 60,
  },
  amountInput: {
    fontSize: 24,
    color: '#2D3436',
  },
  currencySymbol: {
    fontSize: 24,
    color: '#2D3436',
    marginRight: 10,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    marginHorizontal: -5,
  },
  quickAmountButton: {
    backgroundColor: '#F5F6FA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    margin: 5,
  },
  quickAmountText: {
    color: '#2D3436',
    fontSize: 16,
  },
  methodsSection: {
    padding: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    marginBottom: 10,
  },
  methodCardSelected: {
    backgroundColor: '#FFE9E9',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 15,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  methodDetails: {
    fontSize: 14,
    color: '#636E72',
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderStyle: 'dashed',
    marginTop: 10,
  },
  addMethodText: {
    marginLeft: 10,
    color: '#FF6B6B',
    fontSize: 16,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F6FA',
  },
  buttonContainer: {
    width: '100%',
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 15,
  },
});

export default AddBalanceScreen; 