import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Text, Input, Icon } from '@rneui/themed';
import { useAuth } from '../../contexts/AuthContext';
import { getMessages, sendMessage, API_URL } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatDetailsScreen({ route, navigation }) {
  const { conversationId, userId, userName, userImage } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const flatListRef = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    if (currentConversationId) {
      fetchMessages();
      setupWebSocket();
    } else if (userId) {
      createNewConversation();
    }
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [currentConversationId]);

  const createNewConversation = async () => {
    try {
      if (!userId) {
        throw new Error('User ID is required to create a conversation');
      }

      setLoading(true);
      const token = await AsyncStorage.getItem("auth_token");
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // First try to get existing conversation
      const checkResponse = await axios({
        method: 'GET',
        url: `${API_URL}/vendor/chat/vendor/conversations`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (checkResponse.data.success) {
        // Check if conversation already exists
        const existingConversation = checkResponse.data.conversations.find(
          conv => conv.user_id === userId
        );

        if (existingConversation) {
          setCurrentConversationId(existingConversation.id);
          return;
        }
      }

      // If no existing conversation, create new one
      const response = await axios({
        method: 'POST',
        url: `${API_URL}/vendor/chat/conversations_vendor`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: {
          userId: parseInt(userId, 10) // Ensure userId is a number
        }
      });

      if (response.data.success) {
        setCurrentConversationId(response.data.conversation.id);
      } else {
        throw new Error(response.data.message || 'Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      let errorMessage = 'Failed to create conversation. ';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    if (!API_URL) {
      console.error('API_URL is not defined');
      return;
    }

    // Extract host from API_URL (e.g., "192.168.38.240:5000" from "http://192.168.38.240:5000/api")
    const host = API_URL.replace('http://', '').replace('/api', '');
    const wsUrl = `ws://${host}/ws`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket Connected');
      // Register as vendor
      ws.current.send(JSON.stringify({
        type: 'register',
        vendorId: user.id
      }));
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);

        if (data.type === 'new_message' && data.conversationId === currentConversationId) {
          setMessages(prev => {
            const messageExists = prev.some(msg => msg.id === data.message.id);
            if (messageExists) return prev;
            return [...prev, data.message];
          });
          scrollToBottom();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await getMessages(currentConversationId);
      if (response.success) {
        setMessages(response.messages);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to fetch messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await sendMessage(currentConversationId, newMessage.trim());
      if (response.success) {
        setNewMessage('');
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const renderMessage = ({ item }) => {
    const isVendor = item.sender_type === 'vendor';
    const messageTime = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });

    return (
      <View style={[
        styles.messageContainer,
        isVendor ? styles.vendorMessage : styles.userMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isVendor ? styles.vendorBubble : styles.userBubble
        ]}>
          <Text style={[
            styles.messageText,
            isVendor ? styles.vendorText : styles.userText
          ]}>
            {item.message}
          </Text>
          <Text style={[
            styles.messageTime,
            isVendor ? styles.vendorTime : styles.userTime
          ]}>
            {messageTime}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#fff"
          translucent={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff4500" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={true}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" type="material" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{userName}</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />

        <View style={styles.inputContainer}>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            containerStyle={styles.input}
            inputContainerStyle={styles.inputField}
            rightIcon={
              <TouchableOpacity
                onPress={handleSend}
                disabled={sending || !newMessage.trim()}
              >
                <Icon
                  name="send"
                  type="material"
                  color={sending || !newMessage.trim() ? '#666' : '#ff4500'}
                  size={24}
                />
              </TouchableOpacity>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerStatus: {
    fontSize: 12,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 8,
    maxWidth: '80%',
  },
  vendorMessage: {
    alignSelf: 'flex-end',
  },
  userMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 8,
    borderRadius: 16,
    maxWidth: '100%',
  },
  vendorBubble: {
    backgroundColor: '#ff4500',
    borderTopRightRadius: 4,
  },
  userBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    marginBottom: 4,
  },
  vendorText: {
    color: '#fff',
  },
  userText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  vendorTime: {
    color: '#fff',
    opacity: 0.8,
  },
  userTime: {
    color: '#666',
  },
  inputContainer: {
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    paddingHorizontal: 0,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 24,
    paddingHorizontal: 16,
  },
}); 