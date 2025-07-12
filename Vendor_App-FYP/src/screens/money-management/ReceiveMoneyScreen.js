import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
  Text,
  TextInput,
  Alert,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

const ReceiveMoneyScreen = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [paymentLink, setPaymentLink] = useState('https://pay.fiestacarts.com/u/johndoe');
  const fadeAnim = new Animated.Value(0);
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateAmount = (value) => {
    if (value && (isNaN(value) || parseFloat(value) <= 0)) {
      setAmountError('Please enter a valid amount');
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleAmountChange = (value) => {
    setAmount(value);
    if (value) {
      validateAmount(value);
    } else {
      setAmountError('');
    }
  };

  const generatePaymentLink = () => {
    const baseUrl = 'https://pay.fiestacarts.com/u/johndoe';
    const params = new URLSearchParams();
    
    if (amount) params.append('amount', amount);
    if (note) params.append('note', note);
    
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  };

  const handleShare = async () => {
    if (amount && !validateAmount(amount)) {
      return;
    }

    try {
      const link = generatePaymentLink();
      const shareMessage = `Payment Request${amount ? ` for $${amount}` : ''}${note ? `\n"${note}"` : ''}\n\nPay securely: ${link}`;
      
      await Share.share({
        message: shareMessage,
        url: link,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share payment request. Please try again.');
    }
  };

  const handleCopyLink = async () => {
    try {
      const link = generatePaymentLink();
      await Clipboard.setString(link);
      Alert.alert('Success', 'Payment link copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', 'Unable to copy link. Please try again.');
    }
  };

  const PaymentMethod = ({ icon, title, subtitle, onPress, iconColor = "#6366F1" }) => (
    <TouchableOpacity style={styles.methodCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.methodIcon, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.methodInfo}>
        <Text style={styles.methodTitle}>{title}</Text>
        <Text style={styles.methodSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Receive Money</Text>
          <Text style={styles.headerSubtitle}>Request payment easily</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => {
            setAmount('');
            setNote('');
            setAmountError('');
          }}
        >
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* QR Code Section */}
        <Animated.View style={[styles.qrSection, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={["#6366F1", "#8B5CF6", "#A855F7"]}
            style={styles.qrGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.qrContainer}>
              <QRCode
                value={generatePaymentLink()}
                size={180}
                backgroundColor="white"
                color="#0F172A"
                logoBackgroundColor="transparent"
              />
            </View>
            <View style={styles.qrLabelContainer}>
              <Ionicons name="scan-outline" size={20} color="white" style={styles.qrIcon} />
              <Text style={styles.qrLabel}>Scan to Pay</Text>
            </View>
            <Text style={styles.qrSubtitle}>Share this QR code with customers</Text>
          </LinearGradient>
        </Animated.View>

        {/* Amount Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Amount</Text>
          <View style={[styles.inputContainer, amountError && styles.inputContainerError]}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="cash-outline" size={20} color="#6366F1" />
            </View>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="decimal-pad"
              placeholderTextColor="#94A3B8"
            />
          </View>
          {amountError ? <Text style={styles.errorText}>{amountError}</Text> : null}
          <Text style={styles.inputHelper}>Leave empty for flexible amount</Text>
        </View>

        {/* Note Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add a Note</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="document-text-outline" size={20} color="#6366F1" />
            </View>
            <TextInput
              style={[styles.textInput, styles.noteInput]}
              placeholder="What's this payment for?"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              maxLength={150}
              textAlignVertical="top"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={styles.characterCount}>
            <Text style={styles.characterCountText}>{note.length}/150</Text>
          </View>
        </View>

        {/* Payment Request Summary */}
        {(amount || note) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Request Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount:</Text>
                <Text style={styles.summaryValue}>{amount ? `$${amount}` : 'Flexible'}</Text>
              </View>
              {note && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Note:</Text>
                  <Text style={[styles.summaryValue, styles.summaryNote]} numberOfLines={2}>"{note}"</Text>
                </View>
              )}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Ionicons name="link-outline" size={16} color="#6366F1" />
                <Text style={styles.summaryLink} numberOfLines={1}>{generatePaymentLink()}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Share Methods Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share Payment Request</Text>
          
          <PaymentMethod
            icon="link-outline"
            title="Copy Payment Link"
            subtitle="Copy link to clipboard"
            onPress={handleCopyLink}
            iconColor="#6366F1"
          />
          
          <PaymentMethod
            icon="share-outline"
            title="Share Request"
            subtitle="Share via message, email, or social media"
            onPress={handleShare}
            iconColor="#10B981"
          />
          
          <PaymentMethod
            icon="mail-outline"
            title="Send via Email"
            subtitle="Send payment request by email"
            onPress={() => {
              const link = generatePaymentLink();
              const subject = `Payment Request${amount ? ` for $${amount}` : ''}`;
              const body = `Hi,\n\nI'm requesting a payment${amount ? ` for $${amount}` : ''}${note ? ` for: ${note}` : ''}.\n\nYou can pay securely using this link: ${link}\n\nThank you!`;
              // Could integrate with email service here
              Alert.alert('Email', 'Email integration would be implemented here');
            }}
            iconColor="#3B82F6"
          />
        </View>

        <View style={styles.spacing} />
      </ScrollView>
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
  },
  qrSection: {
    padding: 20,
  },
  qrGradient: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  qrIcon: {
    marginRight: 8,
  },
  qrLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  qrSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIconContainer: {
    marginRight: 12,
  },
  currencySymbol: {
    fontSize: 18,
    color: '#6366F1',
    fontWeight: '700',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    color: '#0F172A',
    fontWeight: '600',
    paddingVertical: 0,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
    paddingBottom: 8,
  },
  inputHelper: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    fontStyle: 'italic',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  characterCountText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    width: 60,
  },
  summaryValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    flex: 1,
  },
  summaryNote: {
    fontStyle: 'italic',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  summaryLink: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  methodIcon: {
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  shareButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  spacing: {
    height: 24,
  },
});

export default ReceiveMoneyScreen; 