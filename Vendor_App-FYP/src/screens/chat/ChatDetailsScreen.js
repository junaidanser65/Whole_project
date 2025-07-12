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
  Text,
  TextInput,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentConversationId) {
      fetchMessages();
      setupWebSocket();
    } else if (userId) {
      createNewConversation();
    }
    
    // Animate entrance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
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
        errorMessage += error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage += 'No response from server. Please check your connection.';
      } else {
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

    // Extract host from API_URL
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

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
  };

  const renderMessage = ({ item, index }) => {
    const isVendor = item.sender_type === 'vendor';
    const messageTime = formatMessageTime(item.created_at);
    const isLastMessage = index === messages.length - 1;

    return (
      <Animated.View 
        style={[
          styles.messageContainer,
          isVendor ? styles.vendorMessage : styles.userMessage,
          isLastMessage && styles.lastMessage,
          {
            opacity: fadeAnim,
            transform: [{ 
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }
        ]}
      >
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
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
        
        {/* Header */}
        <LinearGradient
          colors={["#6366F1", "#8B5CF6", "#A855F7"]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{userName || 'Chat'}</Text>
              <Text style={styles.headerSubtitle}>Loading messages...</Text>
            </View>
            
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      {/* Header */}
      <LinearGradient
        colors={["#6366F1", "#8B5CF6", "#A855F7"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.userInfo}>
              {userImage ? (
                <Image source={{ uri: userImage }} style={styles.headerAvatar} />
              ) : (
                <LinearGradient
                  colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
                  style={styles.headerAvatarPlaceholder}
                >
                  <Text style={styles.headerAvatarText}>
                    {userName?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </LinearGradient>
              )}
              <View style={styles.userDetails}>
                <Text style={styles.headerTitle}>{userName || 'Customer'}</Text>
                <Text style={styles.headerSubtitle}>
                  {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Start the conversation</Text>
            <Text style={styles.emptySubtitle}>
              Send a message to {userName || 'customer'} to get started
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
          />
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor="#94A3B8"
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
                maxLength={1000}
              />
            </View>
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newMessage.trim() || sending) && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={sending || !newMessage.trim()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  sending || !newMessage.trim() 
                    ? ['#94A3B8', '#94A3B8'] 
                    : ['#6366F1', '#8B5CF6']
                }
                style={styles.sendButtonGradient}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons name="send" size={20} color="#FFF" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerAvatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  userDetails: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  headerRight: {
    width: 36,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  messagesList: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  vendorMessage: {
    alignSelf: 'flex-end',
  },
  userMessage: {
    alignSelf: 'flex-start',
  },
  lastMessage: {
    marginBottom: 20,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  vendorBubble: {
    backgroundColor: '#6366F1',
    borderTopRightRadius: 8,
  },
  userBubble: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  vendorText: {
    color: '#FFF',
  },
  userText: {
    color: '#0F172A',
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end',
    fontWeight: '500',
  },
  vendorTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userTime: {
    color: '#64748B',
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 16,
    color: '#0F172A',
    paddingVertical: 8,
    maxHeight: 80,
    minHeight: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 