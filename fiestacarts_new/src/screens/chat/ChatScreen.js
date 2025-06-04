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
} from 'react-native';
import { Text, Icon } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { getConversations, getVendorConversations } from '../../api/apiService';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatDistanceToNow } from 'date-fns';

export default function ChatScreen({ navigation }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = async () => {
    try {
      setError(null);
      const response = user.role === 'vendor' 
        ? await getVendorConversations()
        : await getConversations();

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
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const handleConversationPress = (conversation) => {
    navigation.navigate('ChatDetails', {
      conversationId: conversation.id,
      vendorName: user.role === 'vendor' ? conversation.user_name : conversation.vendor_name,
      vendorImage: user.role === 'vendor' ? conversation.user_image : conversation.vendor_image,
    });
  };

  const renderConversation = ({ item }) => {
    const name = user.role === 'vendor' ? item.user_name : item.vendor_name;
    const image = user.role === 'vendor' ? item.user_image : item.vendor_image;
    const unreadCount = item.unread_count || 0;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
      >
        <View style={styles.avatarContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.avatar} />
          ) : (
            <Icon name="person" type="material" size={24} color={colors.primary} />
          )}
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.conversationInfo}>
          <View style={styles.nameTimeContainer}>
            <Text style={styles.name}>{name}</Text>
            {item.last_message_at && (
              <Text style={styles.time}>
                {formatDistanceToNow(new Date(item.last_message_at), { addSuffix: true })}
              </Text>
            )}
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.last_message || 'No messages yet'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.white}
          translucent={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.white}
          translucent={true}
        />
        <View style={styles.errorContainer}>
          <ErrorMessage message={error} onRetry={fetchConversations} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
        translucent={true}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <View style={styles.container}>
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="chat" type="material" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubText}>
                Start chatting with {user.role === 'vendor' ? 'users' : 'vendors'} to see them here
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
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  listContainer: {
    padding: spacing.sm,
    paddingBottom: spacing.xl,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.sm,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadCount: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.subtitle,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  time: {
    ...typography.caption,
    color: colors.textLight,
  },
  lastMessage: {
    ...typography.body,
    color: colors.textLight,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textLight,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.xs,
    textAlign: 'center',
    opacity: 0.8,
  },
}); 