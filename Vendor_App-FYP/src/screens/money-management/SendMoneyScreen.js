import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, Input, Button, Icon, Avatar } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const QUICK_AMOUNTS = [50, 100, 200, 500];

// Mock recent contacts data
const RECENT_CONTACTS = [
  { id: '1', name: 'John Smith', email: 'john.s@email.com', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: '2', name: 'Sarah Wilson', email: 'sarah.w@email.com', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: '3', name: 'Mike Johnson', email: 'mike.j@email.com', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
];

const SendMoneyScreen = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSendMoney = async () => {
    if (!amount || !selectedContact) {
      alert('Please enter an amount and select a recipient');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual money sending logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigation.goBack();
    } catch (error) {
      alert('Failed to send money. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ContactCard = ({ contact }) => (
    <TouchableOpacity
      style={[
        styles.contactCard,
        selectedContact?.id === contact.id && styles.contactCardSelected
      ]}
      onPress={() => {
        setSelectedContact(contact);
        setRecipient(contact.email);
      }}
    >
      <Avatar
        rounded
        size={40}
        source={{ uri: contact.avatar }}
        containerStyle={styles.contactAvatar}
      />
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactEmail}>{contact.email}</Text>
      </View>
      <Icon
        name={selectedContact?.id === contact.id ? 'radio-button-checked' : 'radio-button-unchecked'}
        type="material"
        size={24}
        color={selectedContact?.id === contact.id ? '#FF6B6B' : '#636E72'}
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
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>$1,234.56</Text>
            </LinearGradient>
          </Animated.View>

          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>Amount to Send</Text>
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

          <View style={styles.recipientSection}>
            <Text style={styles.sectionTitle}>Recent Contacts</Text>
            {RECENT_CONTACTS.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}

            <TouchableOpacity style={styles.newRecipientButton}>
              <Icon name="person-add" type="material" size={24} color="#FF6B6B" />
              <Text style={styles.newRecipientText}>New Recipient</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.noteSection}>
            <Text style={styles.sectionTitle}>Add a Note</Text>
            <Input
              placeholder="What's this for?"
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={100}
              inputStyle={styles.noteInput}
              containerStyle={styles.noteContainer}
              inputContainerStyle={styles.noteInputContainer}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={loading ? 'Sending...' : 'Send Money'}
            onPress={handleSendMoney}
            loading={loading}
            disabled={loading || !amount || !selectedContact}
            buttonStyle={styles.sendButton}
            containerStyle={styles.buttonContainer}
            icon={
              !loading && (
                <Icon
                  name="send"
                  type="material"
                  size={20}
                  color="#FFFFFF"
                  style={styles.sendIcon}
                />
              )
            }
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
  recipientSection: {
    padding: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    marginBottom: 10,
  },
  contactCardSelected: {
    backgroundColor: '#FFE9E9',
  },
  contactAvatar: {
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 14,
    color: '#636E72',
  },
  newRecipientButton: {
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
  newRecipientText: {
    marginLeft: 10,
    color: '#FF6B6B',
    fontSize: 16,
  },
  noteSection: {
    padding: 20,
  },
  noteContainer: {
    paddingHorizontal: 0,
  },
  noteInputContainer: {
    borderWidth: 1,
    borderColor: '#DFE6E9',
    borderRadius: 12,
    paddingHorizontal: 15,
    minHeight: 100,
  },
  noteInput: {
    fontSize: 16,
    color: '#2D3436',
    textAlignVertical: 'top',
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
  sendButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 15,
  },
  sendIcon: {
    marginRight: 10,
  },
});

export default SendMoneyScreen; 