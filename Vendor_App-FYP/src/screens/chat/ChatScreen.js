import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Text, Input, Icon, Avatar } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const ChatScreen = ({ route, navigation }) => {
  const { customerId, customerName, customerAvatar } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hi, I have a question about the menu options.',
      sender: 'customer',
      timestamp: '10:30 AM',
    },
    {
      id: '2',
      text: 'Of course! I\'d be happy to help. What would you like to know?',
      sender: 'business',
      timestamp: '10:32 AM',
    },
  ]);
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          text: message,
          sender: 'business',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setMessage('');
    }
  };

  const MessageBubble = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "business"
          ? styles.businessMessage
          : styles.customerMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === "business"
            ? styles.businessMsgT
            : styles.customerMsgT,
        ]}
      >
        {item.text}
      </Text>
      <Text
        style={[
          styles.timestamp,
          item.sender === "business"
            ? styles.businessMsgT
            : styles.customerMsgT,
        ]}
      >
        {item.timestamp}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={styles.header}>
        <LinearGradient
          colors={["#cc3700", "#ff4500"]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" type="material" color="#FFF" size={24} />
            </TouchableOpacity>
            <View style={styles.customerInfo}>
              <Avatar
                rounded
                size={40}
                source={customerAvatar ? { uri: customerAvatar } : null}
                title={customerName[0]}
                containerStyle={styles.avatar}
              />
              <View>
                <Text style={styles.customerName}>{customerName}</Text>
                <Text style={styles.customerStatus}>Online</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble item={item} />}
        contentContainerStyle={styles.messagesList}
        inverted={false}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <Input
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          containerStyle={styles.input}
          inputContainerStyle={styles.inputField}
          rightIcon={
            <TouchableOpacity onPress={sendMessage}>
              <Icon name="send" type="material" color="#ff4500" size={24} />
            </TouchableOpacity>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 12,
  },
  headerGradient: {
    padding: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    backgroundColor: "#ff4500",
    marginRight: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
  customerStatus: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.8,
  },
  messagesList: {
    padding: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  businessMessage: {
    backgroundColor: "#ff4500",
    alignSelf: "flex-end",
    borderTopRightRadius: 4,
  },
  customerMessage: {
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
    borderTopLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    // color: "#2D3436",
    marginBottom: 4,
  },
  businessMsgT: {
    color: "#fff",
  },
  customerMsgT: {
    color: "#2D3436",
  },
  timestamp: {
    fontSize: 12,
    color: "#636E72",
    alignSelf: "flex-end",
  },
  inputContainer: {
    padding: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F5F6FA",
  },
  input: {
    paddingHorizontal: 0,
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#F5F6FA",
    borderRadius: 24,
    paddingHorizontal: 16,
  },
});

export default ChatScreen; 