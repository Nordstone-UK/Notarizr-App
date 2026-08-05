import React, {useCallback, useMemo, useState} from 'react';
import {useQuery} from '@apollo/client';
import {useFocusEffect} from '@react-navigation/native';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {useSelector} from 'react-redux';
import moment from 'moment';
import ConversationRow from '../../components/Messages/ConversationRow';
import MessagesEmptyState from '../../components/Messages/MessagesEmptyState';
import MessagesHeader from '../../components/Messages/MessagesHeader';
import {GET_ALL_CHATS} from '../../../request/queries/getAllChats.query';

const PREVIEW_CONVERSATIONS = [
  {
    id: 'preview-chat-1',
    name: 'Maya Chen',
    avatar: require('../../../assets/agentPic.png'),
    message: 'Your mobile notary appointment is confirmed.',
    service: 'Mobile notary',
    time: '2m',
    unreadCount: 2,
    online: true,
    preview: true,
  },
  {
    id: 'preview-chat-2',
    name: 'Daniel Brooks',
    avatar: require('../../../assets/maleAgentPic.png'),
    message: 'I reviewed the documents you uploaded.',
    service: 'Remote online notary',
    time: '18m',
    unreadCount: 0,
    online: true,
    preview: true,
  },
  {
    id: 'preview-chat-3',
    name: 'Sofia Martinez',
    avatar: require('../../../assets/profilePicture.png'),
    message: 'Thank you. See you tomorrow at 10:30 AM.',
    service: 'Mobile notary',
    time: 'Yesterday',
    unreadCount: 0,
    online: false,
    preview: true,
  },
  {
    id: 'preview-chat-4',
    name: 'Jordan Lee',
    avatar: require('../../../assets/agentCardPic.png'),
    message: 'Please send the final ID page when ready.',
    service: 'Remote online notary',
    time: 'Mon',
    unreadCount: 1,
    online: false,
    preview: true,
  },
];
const EMPTY_CHATS = [];

const formatMessageTime = createdAt => {
  if (!createdAt) {
    return '';
  }

  const numericDate = Number(createdAt);
  const date = moment(Number.isNaN(numericDate) ? createdAt : numericDate);
  return date.isValid() ? date.fromNow(true) : '';
};

const normalizeConversation = (item, currentUserId) => {
  const participant = item.users?.[0] || {};
  const recipientId = item.isReadSendTo?._id;

  return {
    id: item._id,
    name: [participant.first_name, participant.last_name]
      .filter(Boolean)
      .join(' '),
    avatar: participant.profile_picture
      ? {uri: participant.profile_picture}
      : require('../../../assets/agentPic.png'),
    message: item.latestMessage?.text || 'Start the conversation',
    service: 'Notary conversation',
    time: formatMessageTime(item.latestMessage?.createdAt),
    unreadCount: !item.isRead && recipientId === currentUserId ? 1 : 0,
    online: Boolean(participant.isOnline),
    participant,
    raw: item,
  };
};

export default function ChatContactScreen({navigation}) {
  const user = useSelector(state => state.user.user);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [readPreviewIds, setReadPreviewIds] = useState([]);

  const previewMode = Boolean(user?.isHomePreview);
  const {data, refetch} = useQuery(GET_ALL_CHATS, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    pollInterval: previewMode ? 0 : 10000,
    skip: previewMode,
  });

  const loadChats = useCallback(async () => {
    if (previewMode) {
      return;
    }

    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to fetch client chats:', error);
    } finally {
      setRefreshing(false);
    }
  }, [previewMode, refetch]);

  useFocusEffect(
    useCallback(() => {
      if (!previewMode) {
        refetch().catch(error =>
          console.error('Failed to refresh chats:', error),
        );
      }
    }, [previewMode, refetch]),
  );

  const conversations = useMemo(() => {
    if (previewMode) {
      return PREVIEW_CONVERSATIONS.map(conversation =>
        readPreviewIds.includes(conversation.id)
          ? {...conversation, unreadCount: 0}
          : conversation,
      );
    }

    return (data?.getAllChat || EMPTY_CHATS).map(item =>
      normalizeConversation(item, user?._id),
    );
  }, [data?.getAllChat, previewMode, readPreviewIds, user?._id]);

  const visibleConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return conversations.filter(conversation => {
      const matchesSearch =
        !query ||
        conversation.name.toLowerCase().includes(query) ||
        conversation.message.toLowerCase().includes(query) ||
        conversation.service.toLowerCase().includes(query);
      const matchesFilter = filter === 'all' || conversation.unreadCount > 0;

      return matchesSearch && matchesFilter;
    });
  }, [conversations, filter, search]);

  const unreadCount = conversations.reduce(
    (total, conversation) => total + (conversation.unreadCount > 0 ? 1 : 0),
    0,
  );

  const openConversation = conversation => {
    if (conversation.preview) {
      setReadPreviewIds(current =>
        current.includes(conversation.id)
          ? current
          : [...current, conversation.id],
      );
    }

    navigation.navigate('PreviewChatScreen', {conversation});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <MessagesHeader
        filter={filter}
        onChangeFilter={setFilter}
        onChangeSearch={setSearch}
        search={search}
        totalCount={visibleConversations.length}
        unreadCount={unreadCount}
      />
      <FlatList
        data={visibleConversations}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({item, index}) => (
          <ConversationRow
            conversation={item}
            last={index === visibleConversations.length - 1}
            onPress={() => openConversation(item)}
          />
        )}
        ListEmptyComponent={
          <MessagesEmptyState
            searching={search.trim().length > 0}
            unreadOnly={filter === 'unread'}
          />
        }
        refreshControl={
          <RefreshControl
            enabled={!previewMode}
            onRefresh={loadChats}
            refreshing={refreshing}
            tintColor="#FD6D1F"
          />
        }
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  list: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
