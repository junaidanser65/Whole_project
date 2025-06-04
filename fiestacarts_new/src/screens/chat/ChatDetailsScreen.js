import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Text, Icon, Input } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { getMessages, sendMessage } from '../../api/apiService';
import ErrorMessage from '../../components/common/ErrorMessage';
import { API_URL } from '../../api/config';

export default function ChatDetailsScreen({ route, navigation }) {
  const { conversationId, vendorName, vendorImage } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    fetchMessages();
    setupWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [conversationId]);

  const setupWebSocket = () => {
    try {
      const wsUrl = `ws://${API_URL.replace('http://', '').replace('/api', '')}/ws`;
      console.log('Connecting to WebSocket:', wsUrl);
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        // Register for this conversation
        ws.current.send(JSON.stringify({
          type: 'register',
          conversationId
        }));
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          // Handle different message types
          switch (data.type) {
            case 'new_message':
              if (data.conversationId === conversationId) {
                setMessages(prev => {
                  // Check if message already exists
                  const messageExists = prev.some(msg => msg.id === data.message.id);
                  if (messageExists) return prev;
                  return [...prev, data.message];
                });
                scrollToBottom();
              }
              break;
            case 'connection_established':
              console.log('WebSocket connection established');
              break;
            default:
              console.log('Unknown WebSocket message type:', data.type);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
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
      setError(null);
      const response = await getMessages(conversationId);
      if (response.success) {
        setMessages(response.messages);
        scrollToBottom();
      } else {
        setError('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      const response = await sendMessage(conversationId, message.trim());
      if (response.success) {
        // Don't add the message here since it will come through WebSocket
        setMessage('');
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
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender_type === 'user';

    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.vendorMessageContainer
      ]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            {vendorImage ? (
              <Image 
                source={{ uri: vendorImage }} 
                style={styles.avatar}
              />
            ) : (
              <Icon name="person" type="material" size={20} color={colors.primary} />
            )}
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.vendorMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.vendorMessageText
          ]}>
            {item.message}
          </Text>
          <Text style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.vendorTimestamp
          ]}>
            {new Date(item.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <ErrorMessage message={error} onRetry={fetchMessages} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={colors.white}
        translucent={true}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.vendorName}>{vendorName}</Text>
            <Text style={styles.status}>Online</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => `msg-${item.id}`}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
          />

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <Input
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
              containerStyle={styles.inputWrapper}
              inputContainerStyle={styles.inputField}
              inputStyle={styles.input}
              disabled={sending}
              rightIcon={
                <TouchableOpacity 
                  onPress={handleSend}
                  style={styles.sendButton}
                  disabled={!message.trim() || sending}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Icon
                      name="send"
                      size={24}
                      color={message.trim() ? colors.primary : colors.textLight}
                    />
                  )}
                </TouchableOpacity>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  headerInfo: {
    flex: 1,
  },
  vendorName: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: 2,
  },
  status: {
    ...typography.caption,
    color: colors.textLight,
  },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: '85%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  vendorMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  messageBubble: {
    padding: spacing.sm,
    borderRadius: 16,
    maxWidth: '100%',
    minWidth: 60,
  },
  userMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  vendorMessageBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    ...typography.body,
    marginBottom: spacing.xs,
    lineHeight: 20,
    fontSize: 14,
  },
  userMessageText: {
    color: colors.white,
  },
  vendorMessageText: {
    color: colors.text,
  },
  timestamp: {
    ...typography.caption,
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  vendorTimestamp: {
    color: colors.textLight,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.xs,
  },
  inputWrapper: {
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  inputField: {
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 0,
    height: 36,
    minHeight: 36,
  },
  input: {
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.xs,
    fontSize: 14,
  },
  sendButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
}); 