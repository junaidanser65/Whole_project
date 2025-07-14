import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  Platform,
  Text,
  TextInput,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { getVendorConversations } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';

export default function ChatScreen({ navigation }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const fetchConversations = async () => {
    try {
      setError(null);
      const response = await getVendorConversations();

      if (response.success) {
        setConversations(response.conversations);
      } else {
        setError('Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    
    // Animate entrance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchConversations();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const handleConversationPress = (conversation) => {
    navigation.navigate('ChatDetails', {
      conversationId: conversation.id,
      userName: conversation.user_name,
      userImage: conversation.user_image,
    });
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery('');
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      conversation.user_name?.toLowerCase().includes(query) ||
      conversation.last_message?.toLowerCase().includes(query)
    );
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const renderConversation = ({ item, index }) => {
    const unreadCount = item.unread_count || 0;
    const hasUnread = unreadCount > 0;

    return (
      <Animated.View 
        style={[
          styles.conversationWrapper,
          { 
            opacity: fadeAnim,
            transform: [{ 
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.conversationItem, hasUnread && styles.unreadConversation]}
          onPress={() => handleConversationPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.avatarContainer}>
            {item.user_image ? (
              <Image source={{ uri: item.user_image }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarText}>
                  {item.user_name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </LinearGradient>
            )}
            {hasUnread && (
              <View style={styles.onlineIndicator}>
                <View style={styles.onlineDot} />
              </View>
            )}
          </View>
          
          <View style={styles.conversationInfo}>
            <View style={styles.nameTimeContainer}>
              <Text style={[styles.name, hasUnread && styles.unreadName]}>
                {item.user_name}
              </Text>
              {item.last_message_at && (
                <Text style={styles.time}>
                  {formatTime(item.last_message_at)}
                </Text>
              )}
            </View>
            
            <View style={styles.messageContainer}>
              <Text 
                style={[styles.lastMessage, hasUnread && styles.unreadMessage]} 
                numberOfLines={1}
              >
                {item.last_message || 'No messages yet'}
              </Text>
              {hasUnread && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.chevronContainer}>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </View>
        </TouchableOpacity>
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
              <Text style={styles.headerTitle}>Messages</Text>
              <Text style={styles.headerSubtitle}>Stay connected with customers</Text>
            </View>
            
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
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
              <Text style={styles.headerTitle}>Messages</Text>
              <Text style={styles.headerSubtitle}>Stay connected with customers</Text>
            </View>
            
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchConversations}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              style={styles.retryButtonGradient}
            >
              <Ionicons name="refresh" size={16} color="#FFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Messages</Text>
            <Text style={styles.headerSubtitle}>
              {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleSearchToggle}
          >
            <Ionicons name={showSearch ? "close" : "search"} size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={styles.container}>
        <FlatList
          data={filteredConversations}
          renderItem={renderConversation}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6366F1"]}
              tintColor="#6366F1"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No matching conversations' : 'No conversations yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? `No conversations match "${searchQuery}"`
                  : 'Start chatting with customers to see conversations here'
                }
              </Text>
            </View>
          }
        />
      </View>
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
    paddingBottom: 20,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    padding: 20,
  },
  conversationWrapper: {
    marginBottom: 12,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  unreadConversation: {
    borderColor: '#6366F1',
    borderWidth: 1,
    shadowColor: '#6366F1',
    shadowOpacity: 0.1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  conversationInfo: {
    flex: 1,
  },
  nameTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  unreadName: {
    fontWeight: '700',
    color: '#6366F1',
  },
  time: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    color: '#0F172A',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCount: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  chevronContainer: {
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
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
  searchContainer: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
});