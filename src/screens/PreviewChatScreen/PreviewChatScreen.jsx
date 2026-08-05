import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useMutation, useQuery} from '@apollo/client';
import moment from 'moment';
import {useSelector} from 'react-redux';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import ConversationHeader from '../../components/Messages/ConversationHeader';
import MessageBubble from '../../components/Messages/MessageBubble';
import MessageComposer from '../../components/Messages/MessageComposer';
import {
  MARK_CHAT_READ,
  SAVE_MESSAGE,
} from '../../../request/mutations/chat.mutation';
import {GET_ALL_MESSAGES} from '../../../request/queries/getAllMessages.query';

const INITIAL_MESSAGES = [
  {
    id: 'message-1',
    text: 'Hi Alex, I am Maya, the notary assigned to your appointment tomorrow.',
    time: '10:14 AM',
    outgoing: false,
  },
  {
    id: 'message-2',
    text: 'Hi Maya. Thanks for confirming. Is there anything I should prepare?',
    time: '10:16 AM',
    outgoing: true,
  },
  {
    id: 'message-3',
    text: 'Please have your photo ID and the unsigned original documents ready.',
    time: '10:17 AM',
    outgoing: false,
  },
  {
    id: 'message-4',
    text: 'Your mobile notary appointment is confirmed for 10:30 AM.',
    time: '10:18 AM',
    outgoing: false,
  },
];

export default function PreviewChatScreen({navigation, route}) {
  const conversation = route.params?.conversation;
  const user = useSelector(state => state.user.user);
  const previewMode = Boolean(conversation?.preview || user?.isHomePreview);
  const [previewMessages, setPreviewMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);
  const {data, refetch} = useQuery(GET_ALL_MESSAGES, {
    fetchPolicy: 'network-only',
    pollInterval: previewMode ? 0 : 5000,
    skip: previewMode || !conversation?.id,
    variables: {chatId: conversation?.id || ''},
  });
  const [saveMessage, {loading: sending}] = useMutation(SAVE_MESSAGE);
  const [markChatRead] = useMutation(MARK_CHAT_READ);

  const messages = useMemo(() => {
    if (previewMode) {
      return previewMessages;
    }

    return (data?.getAllMessages || [])
      .slice()
      .reverse()
      .map(message => {
        const numericDate = Number(message.createdAt);
        const date = moment(
          Number.isNaN(numericDate) ? message.createdAt : numericDate,
        );

        return {
          id: message._id,
          text: message.text,
          time: date.isValid() ? date.format('h:mm A') : '',
          outgoing: message.user?._id === user?._id,
        };
      });
  }, [data?.getAllMessages, previewMessages, previewMode, user?._id]);

  useEffect(() => {
    if (previewMode || !conversation?.id) {
      return;
    }

    markChatRead({variables: {chatId: conversation.id}}).catch(error =>
      console.error('Failed to mark chat as read:', error),
    );
  }, [conversation?.id, markChatRead, previewMode]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text) {
      return;
    }

    if (previewMode) {
      setPreviewMessages(current => [
        ...current,
        {
          id: `message-${Date.now()}`,
          text,
          time: 'Now',
          outgoing: true,
        },
      ]);
      setDraft('');
      requestAnimationFrame(() =>
        listRef.current?.scrollToEnd({animated: true}),
      );
      return;
    }

    const receiverId = conversation?.participant?._id;
    if (!conversation?.id || !receiverId) {
      Toast.show({
        type: 'error',
        text1: 'Message not sent',
        text2: 'This conversation is missing a recipient.',
      });
      return;
    }

    try {
      await saveMessage({
        variables: {chatId: conversation.id, receiverId, text},
      });
      setDraft('');
      await refetch();
      requestAnimationFrame(() =>
        listRef.current?.scrollToEnd({animated: true}),
      );
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Message not sent',
        text2: 'Check your connection and try again.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
        style={styles.flex}>
        <ConversationHeader
          conversation={conversation}
          navigation={navigation}
          onCall={() =>
            Toast.show({
              type: 'info',
              text1: 'Call Maya Chen',
              text2: 'Voice calling will be available near appointment time.',
            })
          }
        />
        <FlatList
          contentContainerStyle={styles.messages}
          data={messages}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.threadHeader}>
              <Text style={styles.dateLabel}>Today</Text>
              <View style={styles.notice}>
                <Text style={styles.noticeText}>
                  Messages are protected and linked to your booking.
                </Text>
              </View>
            </View>
          }
          ref={listRef}
          renderItem={({item}) => <MessageBubble message={item} />}
          showsVerticalScrollIndicator={false}
        />
        <MessageComposer
          onAttach={() =>
            Toast.show({
              type: 'info',
              text1: 'Attach a document',
              text2:
                'Documents already uploaded to this booking are available.',
            })
          }
          onChangeText={setDraft}
          onSend={sendMessage}
          sending={sending}
          value={draft}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dateLabel: {
    alignSelf: 'center',
    color: '#9298A2',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    marginBottom: 14,
  },
  flex: {
    flex: 1,
  },
  messages: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  notice: {
    alignSelf: 'center',
    backgroundColor: '#EBF7F0',
    borderRadius: 7,
    marginBottom: 22,
    maxWidth: '88%',
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  noticeText: {
    color: '#34805B',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  threadHeader: {
    paddingTop: 2,
  },
});
