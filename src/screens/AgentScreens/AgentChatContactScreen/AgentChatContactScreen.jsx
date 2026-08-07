import React, {useCallback, useMemo, useState} from 'react';
import {useQuery} from '@apollo/client';
import {useIsFocused} from '@react-navigation/native';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {useSelector} from 'react-redux';
import moment from 'moment';
import ConversationRow from '../../../components/Messages/ConversationRow';
import MessagesEmptyState from '../../../components/Messages/MessagesEmptyState';
import MessagesHeader from '../../../components/Messages/MessagesHeader';
import {GET_ALL_CHATS} from '../../../../request/queries/getAllChats.query';

const formatMessageTime = createdAt => {
  if (!createdAt) {
    return '';
  }
  const numericDate = Number(createdAt);
  const date = moment(Number.isNaN(numericDate) ? createdAt : numericDate);
  return date.isValid() ? date.fromNow(true) : '';
};

const normalizeConversation = (item, currentUserId) => {
  const participant =
    item.users?.find(chatUser => chatUser._id !== currentUserId) ||
    item.users?.[0] ||
    {};
  const recipientId = item.isReadSendTo?._id;

  return {
    id: item._id,
    name:
      [participant.first_name, participant.last_name]
        .filter(Boolean)
        .join(' ') || 'Notarizr client',
    avatar: participant.profile_picture
      ? {uri: participant.profile_picture}
      : null,
    message: item.latestMessage?.text || 'Start the conversation',
    service: 'Client conversation',
    time: formatMessageTime(item.latestMessage?.createdAt),
    unreadCount: !item.isRead && recipientId === currentUserId ? 1 : 0,
    online: Boolean(participant.isOnline),
    participant,
    raw: item,
  };
};

export default function AgentChatContactScreen({navigation}) {
  const user = useSelector(state => state.user.user);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const {data, refetch} = useQuery(GET_ALL_CHATS, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    pollInterval: isFocused ? 30000 : 0,
  });

  const loadChats = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const conversations = useMemo(
    () =>
      (data?.getAllChat || []).map(item =>
        normalizeConversation(item, user?._id),
      ),
    [data?.getAllChat, user?._id],
  );

  const visibleConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return conversations.filter(conversation => {
      const matchesSearch =
        !query ||
        conversation.name.toLowerCase().includes(query) ||
        conversation.message.toLowerCase().includes(query);
      const matchesFilter = filter === 'all' || conversation.unreadCount > 0;
      return matchesSearch && matchesFilter;
    });
  }, [conversations, filter, search]);

  const unreadCount = conversations.reduce(
    (total, conversation) => total + (conversation.unreadCount > 0 ? 1 : 0),
    0,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <MessagesHeader
        filter={filter}
        onChangeFilter={setFilter}
        onChangeSearch={setSearch}
        search={search}
        subtitle="Conversations with your clients"
        totalCount={visibleConversations.length}
        unreadCount={unreadCount}
      />
      <FlatList
        data={visibleConversations}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <MessagesEmptyState
            audience="client"
            searching={search.trim().length > 0}
            unreadOnly={filter === 'unread'}
          />
        }
        refreshControl={
          <RefreshControl
            onRefresh={loadChats}
            refreshing={refreshing}
            tintColor="#FD6D1F"
          />
        }
        renderItem={({item, index}) => (
          <ConversationRow
            conversation={item}
            last={index === visibleConversations.length - 1}
            onPress={() =>
              navigation.navigate('PreviewChatScreen', {conversation: item})
            }
          />
        )}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  list: {flex: 1, backgroundColor: '#FFFFFF'},
});
