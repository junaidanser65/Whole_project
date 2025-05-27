import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
} from 'react-native';
import { Text, Button, Icon, Input } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

const ReceiveMoneyScreen = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [paymentLink, setPaymentLink] = useState('https://pay.fiestacarts.com/u/johndoe');
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleShare = async () => {
    try {
      const shareMessage = `Request for $${amount}${note ? ` - ${note}` : ''}\n${paymentLink}`;
      await Share.share({
        message: shareMessage,
        url: paymentLink,
      });
    } catch (error) {
      alert('Error sharing payment request');
    }
  };

  const handleCopyLink = () => {
    // TODO: Implement clipboard functionality
    alert('Payment link copied to clipboard!');
  };

  const PaymentMethod = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.methodCard} onPress={onPress}>
      <View style={styles.methodIcon}>
        <Icon name={icon} type="material" size={24} color="#ff4500" />
      </View>
      <View style={styles.methodInfo}>
        <Text style={styles.methodTitle}>{title}</Text>
        <Text style={styles.methodSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" type="material" size={24} color="#636E72" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Animated.View style={[styles.qrSection, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={["#cc3700", "#ff4500"]}
            style={styles.qrGradient}
          >
            <View style={styles.qrContainer}>
              <QRCode
                value={paymentLink}
                size={200}
                backgroundColor="white"
                color="#2D3436"
              />
            </View>
            <Text style={styles.qrLabel}>Scan to Pay</Text>
          </LinearGradient>
        </Animated.View>

        <View style={styles.amountSection}>
          <Text style={styles.sectionTitle}>Request Amount</Text>
          <Input
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            leftIcon={<Text style={styles.currencySymbol}>$</Text>}
            inputStyle={styles.amountInput}
            containerStyle={styles.amountContainer}
            inputContainerStyle={styles.amountInputContainer}
          />
        </View>

        <View style={styles.noteSection}>
          <Text style={styles.sectionTitle}>Add a Note</Text>
          <Input
            placeholder="What's this request for?"
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={100}
            inputStyle={styles.noteInput}
            containerStyle={styles.noteContainer}
            inputContainerStyle={styles.noteInputContainer}
          />
        </View>

        <View style={styles.methodsSection}>
          <Text style={styles.sectionTitle}>Share Payment Request</Text>
          <PaymentMethod
            icon="link"
            title="Payment Link"
            subtitle="Share or copy payment link"
            onPress={handleCopyLink}
          />
          <PaymentMethod
            icon="share"
            title="Share Request"
            subtitle="Share via message or email"
            onPress={handleShare}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Share Payment Request"
          onPress={handleShare}
          buttonStyle={styles.shareButton}
          containerStyle={styles.buttonContainer}
          icon={
            <Icon
              name="share"
              type="material"
              size={20}
              color="#FFFFFF"
              style={styles.shareIcon}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
  qrSection: {
    padding: 20,
  },
  qrGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  qrContainer: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  qrLabel: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  amountSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 15,
  },
  amountContainer: {
    paddingHorizontal: 0,
  },
  amountInputContainer: {
    borderWidth: 1,
    borderColor: "#DFE6E9",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 60,
  },
  amountInput: {
    fontSize: 24,
    color: "#2D3436",
  },
  currencySymbol: {
    fontSize: 24,
    color: "#2D3436",
    marginRight: 10,
  },
  noteSection: {
    padding: 20,
  },
  noteContainer: {
    paddingHorizontal: 0,
  },
  noteInputContainer: {
    borderWidth: 1,
    borderColor: "#DFE6E9",
    borderRadius: 12,
    paddingHorizontal: 15,
    minHeight: 100,
  },
  noteInput: {
    fontSize: 16,
    color: "#2D3436",
    textAlignVertical: "top",
  },
  methodsSection: {
    padding: 20,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    marginBottom: 10,
  },
  methodIcon: {
    backgroundColor: "#ffe0cc",
    padding: 10,
    borderRadius: 10,
    marginRight: 15,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 4,
  },
  methodSubtitle: {
    fontSize: 14,
    color: "#636E72",
  },
  footer: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F5F6FA",
  },
  buttonContainer: {
    width: "100%",
  },
  shareButton: {
    backgroundColor: "#ff4500",
    borderRadius: 12,
    paddingVertical: 15,
  },
  shareIcon: {
    marginRight: 10,
  },
});

export default ReceiveMoneyScreen; 