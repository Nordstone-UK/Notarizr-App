import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useQuery} from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {useSelector} from 'react-redux';
import ConversationRow from '../../../components/Messages/ConversationRow';
import MessagesEmptyState from '../../../components/Messages/MessagesEmptyState';
import MessagesHeader from '../../../components/Messages/MessagesHeader';
import {GET_ALL_CHATS} from '../../../../request/queries/getAllChats.query';
import {normalizeChatConversation} from '../../../utils/chatUtils';
import {connectSocket, socket} from '../../../utils/Socket';

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
  });

  useEffect(() => {
    if (isFocused) {
      refetch().catch(error =>
        console.error('Failed to refresh notary chats:', error),
      );
    }
  }, [isFocused, refetch]);

  useEffect(() => {
    if (!isFocused) {
      return undefined;
    }

    const refreshConversations = () => {
      refetch().catch(error =>
        console.error('Failed to refresh notary chats:', error),
      );
    };
    AsyncStorage.getItem('token')
      .then(token => token && connectSocket(token))
      .catch(error => console.error('Failed to connect chat list:', error));
    socket.on('chat:conversation', refreshConversations);

    return () => socket.off('chat:conversation', refreshConversations);
  }, [isFocused, refetch]);

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
        normalizeChatConversation(item, user?._id, 'Client conversation'),
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
              navigation.navigate('ChatScreen', {
                conversation: item,
                chatId: item.id,
                sender: user,
                receiver: item.participant,
              })
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
