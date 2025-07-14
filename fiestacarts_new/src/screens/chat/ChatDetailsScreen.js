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
import { getMessages, sendMessage } from '../../api/apiService';
import { formatDistanceToNow } from 'date-fns';
import { API_URL } from '../../api/config';

export default function ChatDetailsScreen({ route, navigation }) {
  const { conversationId, vendorName, vendorImage } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const ws = useRef(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      setupWebSocket();
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
  }, [conversationId]);

  const setupWebSocket = () => {
    if (!API_URL) {
      console.error('API_URL is not defined');
      return;
    }

    try {
      const wsUrl = `ws://${API_URL.replace("http://", "").replace(
        "/api",
        ""
      )}/ws`;
      // const wsUrl = `wss://${API_URL.replace("https://", "").replace(
      //   "/api",
      //   ""
      // )}/ws`;
      console.log('Connecting to WebSocket:', wsUrl);
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket Connected');
        // Register as user
        ws.current.send(JSON.stringify({
          type: 'register',
          userId: user.id
        }));
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);

          if (data.type === 'new_message' && data.conversationId === conversationId) {
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
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await getMessages(conversationId);
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
      const response = await sendMessage(conversationId, newMessage.trim());
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.sender_type === 'user';
    const showAvatar = !isUser && (!messages[index + 1] || messages[index + 1].sender_type === 'user');
    const isLastMessage = index === messages.length - 1;

    return (
      <Animated.View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.vendorMessage,
          isLastMessage && styles.lastMessage,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0]
              })
            }]
          }
        ]}
      >
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.vendorBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.vendorText
          ]}>
            {item.message}
          </Text>
          <Text style={[
            styles.messageTime,
            isUser ? styles.userTime : styles.vendorTime
          ]}>
            {formatMessageTime(item.created_at)}
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
              <View style={styles.userInfo}>
                {vendorImage ? (
                  <Image source={{ uri: vendorImage }} style={styles.headerAvatar} />
                ) : (
                  <LinearGradient
                    colors={["#8B5CF6", "#A855F7"]}
                    style={styles.headerAvatarPlaceholder}
                  >
                    <Text style={styles.headerAvatarText}>
                      {vendorName?.charAt(0).toUpperCase() || 'V'}
                    </Text>
                  </LinearGradient>
                )}
                <View style={styles.userDetails}>
                  <Text style={styles.headerTitle}>{vendorName}</Text>
                  <Text style={styles.headerSubtitle}>Loading messages...</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading messages...</Text>
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
              {vendorImage ? (
                <Image source={{ uri: vendorImage }} style={styles.headerAvatar} />
              ) : (
                <LinearGradient
                  colors={["#8B5CF6", "#A855F7"]}
                  style={styles.headerAvatarPlaceholder}
                >
                  <Text style={styles.headerAvatarText}>
                    {vendorName?.charAt(0).toUpperCase() || 'V'}
                  </Text>
                </LinearGradient>
              )}
              <View style={styles.userDetails}>
                <Text style={styles.headerTitle}>{vendorName}</Text>
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-outline" size={64} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>Start the conversation</Text>
                <Text style={styles.emptySubtitle}>
                  Send a message to begin chatting with {vendorName}
                </Text>
              </View>
            }
          />
          
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type a message..."
                  placeholderTextColor="#64748B"
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                  maxLength={1000}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                  blurOnSubmit={false}
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
    marginTop: 30,
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
  userMessage: {
    alignSelf: 'flex-end',
  },
  vendorMessage: {
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
  userBubble: {
    backgroundColor: '#6366F1',
    borderTopRightRadius: 8,
  },
  vendorBubble: {
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
  userText: {
    color: '#FFF',
  },
  vendorText: {
    color: '#0F172A',
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end',
    fontWeight: '500',
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  vendorTime: {
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