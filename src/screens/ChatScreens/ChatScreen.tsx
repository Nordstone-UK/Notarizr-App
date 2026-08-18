import {useLazyQuery, useMutation} from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Actions,
  Bubble,
  Composer,
  GiftedChat,
  InputToolbar,
  Send,
} from 'react-native-gifted-chat';
import {launchImageLibrary} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import {useSelector} from 'react-redux';

import {SAVE_MESSAGE} from '../../../request/mutations/chat.mutation';
import {CREATE_CHAT} from '../../../request/mutations/createChat.mutation';
import {GET_ALL_MESSAGES} from '../../../request/queries/getAllMessages.query';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import UserAvatar from '../../components/UserAvatar/UserAvatar';
import useRegister from '../../hooks/useRegister';
import {
  connectSocket,
  socket,
  socketRequest,
  waitForSocketConnection,
} from '../../utils/Socket';
import {
  buildSessionInviteMedia,
  parseSessionInviteMedia,
} from '../../utils/sessionInvite';

const getMessageId = message => String(message?._id || message?.id || '');

const formatMessage = message => {
  const sessionInvite = parseSessionInviteMedia(message?.mediaUrl);

  return {
    _id: getMessageId(message),
    text: message?.text || '',
    sessionInvite,
    image: sessionInvite ? '' : message?.mediaUrl || message?.image || '',
    createdAt: new Date(message?.createdAt || Date.now()),
    user: {
      _id: String(message?.user?._id || message?.user || ''),
      name: [message?.user?.first_name, message?.user?.last_name]
        .filter(Boolean)
        .join(' '),
      avatar: message?.user?.profile_picture || '',
    },
  };
};

const mergeMessage = (current, incoming, temporaryId) => {
  const formatted = formatMessage(incoming);
  const filtered = current.filter(
    item => item._id !== temporaryId && item._id !== formatted._id,
  );
  return GiftedChat.append(filtered, [formatted]);
};

function CameraActionIcon() {
  return <Feather name="paperclip" size={21} color="#6E7685" />;
}

function ScrollToBottomIcon() {
  return <Feather name="chevron-down" size={20} color="#FD6D1F" />;
}

export default function ChatScreen({route, navigation}: any) {
  const {
    sender: routeSender,
    receiver: routeReceiver,
    conversation,
    chatId: routeChatId,
    channel,
    voiceToken,
  } = route.params || {};
  const authenticatedUser = useSelector((state: any) => state?.user?.user);
  const activeBooking = useSelector((state: any) => state?.booking?.booking);
  const sender = authenticatedUser?._id ? authenticatedUser : routeSender;
  const receiver = routeReceiver || conversation?.participant;
  const senderId = String(sender?._id || '');
  const receiverId = String(receiver?._id || '');
  const initialChatId = String(routeChatId || conversation?.id || '');

  const [createChat] = useMutation(CREATE_CHAT);
  const [saveMessageMutation] = useMutation(SAVE_MESSAGE);
  const [getMessageHistory] = useLazyQuery(GET_ALL_MESSAGES, {
    fetchPolicy: 'network-only',
  });
  const {handleCompression, uploadMedia} = useRegister();
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connectionState, setConnectionState] = useState<
    'connecting' | 'ready' | 'fallback' | 'error'
  >('connecting');
  const [connectionError, setConnectionError] = useState('');
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const chatIdRef = useRef(initialChatId);
  const mountedRef = useRef(true);

  const loadGraphQLHistory = useCallback(
    async chatId => {
      const {data} = await getMessageHistory({variables: {chatId}});
      if (mountedRef.current) {
        setMessages(
          (data?.getAllMessages || [])
            .map(formatMessage)
            .filter(item => item._id),
        );
      }
    },
    [getMessageHistory],
  );

  const joinAndLoad = useCallback(async chatId => {
    await socketRequest('chat:join', {chatId}, 6000);
    const response: any = await socketRequest('chat:history', {chatId}, 6000);
    if (mountedRef.current) {
      setMessages(
        (response.messages || []).map(formatMessage).filter(item => item._id),
      );
      setConnectionState('ready');
      setConnectionError('');
    }
    socketRequest('chat:read', {chatId}, 4000).catch(() => {});
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    const onMessage = payload => {
      const messageChatId = String(
        payload?.message?.chat?._id || payload?.message?.chat || '',
      );
      if (messageChatId !== chatIdRef.current || !payload?.message) {
        return;
      }
      setMessages(current =>
        mergeMessage(current, payload.message, payload.tempId),
      );
    };

    const enableFallback = async (chatId, error) => {
      try {
        await loadGraphQLHistory(chatId);
        if (!cancelled) {
          setConnectionState('fallback');
          setConnectionError(
            'Live updates are reconnecting. Messages still work.',
          );
        }
      } catch (historyError) {
        if (!cancelled) {
          setConnectionState('error');
          setConnectionError(
            historyError?.message || error?.message || 'Chat is unavailable.',
          );
        }
      }
    };

    const initialize = async () => {
      if (!senderId || !receiverId) {
        setConnectionState('error');
        setConnectionError('The agent or client information is missing.');
        return;
      }

      setConnectionState('connecting');
      setConnectionError('');

      try {
        let chatId = initialChatId;
        if (!chatId) {
          const result = await createChat({variables: {userId: receiverId}});
          chatId = String(result.data?.createChat?.chatID || '');
        }
        if (!chatId) {
          throw new Error('Unable to create this conversation.');
        }
        chatIdRef.current = chatId;

        // GraphQL history makes the conversation visible immediately while the
        // realtime socket completes its connection.
        await loadGraphQLHistory(chatId);
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('Your session expired. Please log in again.');
        }
        socket.off('chat:message', onMessage);
        socket.on('chat:message', onMessage);
        connectSocket(token);
        await waitForSocketConnection(6000);
        await joinAndLoad(chatId);
      } catch (error: any) {
        if (chatIdRef.current) {
          await enableFallback(chatIdRef.current, error);
        } else if (!cancelled) {
          setConnectionState('error');
          setConnectionError(error?.message || 'Unable to connect to chat.');
        }
      }
    };

    initialize();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      socket.off('chat:message', onMessage);
    };
  }, [
    connectionAttempt,
    createChat,
    initialChatId,
    joinAndLoad,
    loadGraphQLHistory,
    receiverId,
    senderId,
  ]);

  useEffect(() => {
    if (connectionState !== 'fallback' || !chatIdRef.current) {
      return undefined;
    }

    const pollingTimer = setInterval(() => {
      loadGraphQLHistory(chatIdRef.current).catch(() => {});
    }, 4000);

    return () => clearInterval(pollingTimer);
  }, [connectionState, loadGraphQLHistory]);

  const sendMessage = useCallback(
    async (outgoing: {text?: string; image?: any; sessionInvite?: any}) => {
      if (connectionState === 'connecting' || !chatIdRef.current) {
        Toast.show({
          type: 'info',
          text1: 'Opening conversation',
          text2: 'Please wait a moment.',
        });
        return false;
      }

      const tempId = `local-${Date.now()}-${Math.random()}`;
      let mediaUrl = outgoing.sessionInvite
        ? buildSessionInviteMedia(outgoing.sessionInvite)
        : '';
      try {
        if (outgoing.image?.uri) {
          const compressedImage = await handleCompression(outgoing.image.uri);
          mediaUrl = await uploadMedia(compressedImage, 'chat');
        }

        const text = outgoing.text?.trim() || (mediaUrl ? 'Image' : '');
        if (!text && !mediaUrl) {
          return false;
        }
        const optimisticMessage = {
          _id: tempId,
          text: outgoing.text?.trim() || '',
          image: outgoing.sessionInvite ? '' : mediaUrl,
          sessionInvite: outgoing.sessionInvite || null,
          createdAt: new Date(),
          user: {_id: senderId},
          pending: true,
        };
        setMessages(current => GiftedChat.append(current, [optimisticMessage]));

        if (connectionState === 'ready' && socket.connected) {
          try {
            const response: any = await socketRequest('chat:send', {
              chatId: chatIdRef.current,
              receiverId,
              text: outgoing.text?.trim() || '',
              mediaUrl,
              tempId,
            });
            setMessages(current =>
              mergeMessage(current, response.message, tempId),
            );
            return true;
          } catch (_) {
            setConnectionState('fallback');
          }
        }

        const {data} = await saveMessageMutation({
          variables: {
            chatId: chatIdRef.current,
            receiverId,
            text,
            mediaUrl,
          },
        });
        setMessages(current =>
          mergeMessage(current, data?.saveMessage, tempId),
        );
        return true;
      } catch (error: any) {
        setMessages(current => current.filter(item => item._id !== tempId));
        Toast.show({
          type: 'error',
          text1: 'Message failed',
          text2: error?.message || 'Please try again.',
        });
        return false;
      }
    },
    [
      connectionState,
      handleCompression,
      receiverId,
      saveMessageMutation,
      senderId,
      uploadMedia,
    ],
  );

  const pickImages = useCallback(() => {
    launchImageLibrary({mediaType: 'photo', selectionLimit: 5}, response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Toast.show({
          type: 'error',
          text1: 'Photo could not be selected',
          text2: response.errorMessage || 'Please try again.',
        });
        return;
      }
      if (response.assets) {
        setSelectedImages(previous => [...previous, ...response.assets!]);
      }
    });
  }, []);

  const handleSend = useCallback(async () => {
    const text = inputMessage.trim();
    if (text) {
      await sendMessage({text});
    }
    for (const image of selectedImages) {
      await sendMessage({image});
    }
    setInputMessage('');
    setSelectedImages([]);
  }, [inputMessage, selectedImages, sendMessage]);

  const openSessionInvite = useCallback(
    async invite => {
      const channelName =
        invite?.channel || activeBooking?.agora_channel_name || channel;
      const channelToken =
        invite?.token || activeBooking?.agora_channel_token || voiceToken;

      if (!channelName || !channelToken) {
        Toast.show({
          type: 'error',
          text1: 'Session is unavailable',
          text2: 'Open the booking and try joining again.',
        });
        return;
      }

      const isAgent = String(authenticatedUser?.account_type || '').includes(
        'agent',
      );
      const callParams = {
        uid: invite?.bookingId || activeBooking?._id,
        channel: channelName,
        token: channelToken,
        date: invite?.date || activeBooking?.date_of_booking,
        time: invite?.time || activeBooking?.time_of_booking,
        routeFrom: isAgent ? 'agent' : 'client',
      };

      if (String(invite?.joinedBy || '') !== senderId) {
        const displayName = [
          authenticatedUser?.first_name,
          authenticatedUser?.last_name,
        ]
          .filter(Boolean)
          .join(' ');
        await sendMessage({
          text: `${
            displayName || (isAgent ? 'Your notary' : 'Your client')
          } has joined the secure session.`,
          sessionInvite: {...invite, ...callParams, joinedBy: senderId},
        });
      }

      navigation.navigate(
        isAgent ? 'NotaryCallScreen' : 'AuthenticationScreen',
        callParams,
      );
    },
    [
      activeBooking,
      authenticatedUser,
      channel,
      navigation,
      sendMessage,
      senderId,
      voiceToken,
    ],
  );

  const receiverName = useMemo(
    () =>
      [receiver?.first_name, receiver?.last_name].filter(Boolean).join(' ') ||
      conversation?.name ||
      'Conversation',
    [conversation?.name, receiver?.first_name, receiver?.last_name],
  );

  const renderBubble = useCallback(
    props => {
      const invite = props.currentMessage?.sessionInvite;
      const position = props.position === 'right' ? 'right' : 'left';

      return (
        <View
          style={[
            styles.messageGroup,
            position === 'right' && styles.messageGroupRight,
          ]}>
          <Bubble
            {...props}
            bottomContainerStyle={{
              left: styles.bubbleBottom,
              right: styles.bubbleBottom,
            }}
            textStyle={{left: styles.leftText, right: styles.rightText}}
            timeTextStyle={{left: styles.leftTime, right: styles.rightTime}}
            wrapperStyle={{left: styles.leftBubble, right: styles.rightBubble}}
          />
          {invite ? (
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.8}
              onPress={() => openSessionInvite(invite)}
              style={[
                styles.joinSessionButton,
                position === 'right' && styles.joinSessionButtonRight,
              ]}>
              <Feather name="video" size={16} color="#FFFFFF" />
              <Text style={styles.joinSessionText}>Join session</Text>
              <Feather name="arrow-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}
        </View>
      );
    },
    [openSessionInvite],
  );

  const renderInputToolbar = useCallback(
    props => (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
      />
    ),
    [],
  );

  const renderSend = useCallback(
    props => (
      <Send {...props} alwaysShowSend containerStyle={styles.sendContainer}>
        <View style={styles.sendCircle}>
          <Feather name="arrow-up" size={20} color="#FFFFFF" />
        </View>
      </Send>
    ),
    [],
  );

  const renderComposer = useCallback(
    props => (
      <Composer
        {...props}
        textInputStyle={styles.textInput}
        placeholderTextColor="#A3A9B3"
      />
    ),
    [],
  );

  const renderChatEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyAvatar}>
          <Text style={styles.emptyInitials}>
            {(receiver?.first_name?.[0] || 'N').toUpperCase()}
            {(receiver?.last_name?.[0] || '').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.emptyTitle}>Start your conversation</Text>
        <Text style={styles.emptyText}>
          Message {receiverName} about your appointment or documents.
        </Text>
      </View>
    ),
    [receiver?.first_name, receiver?.last_name, receiverName],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationHeader
        Title={receiverName}
        ProfilePic={
          receiver?.profile_picture ? {uri: receiver.profile_picture} : null
        }
        ProfileName={receiverName}
        profileImgPress={() =>
          navigation.navigate('ChatingProfiledetailScreen', {receiver})
        }
        lastImg={
          receiver?._id ? require('../../../assets/voiceCallIcon.png') : null
        }
        lastImgPress={() =>
          navigation.navigate('VoiceCallScreen', {
            sender,
            receiver,
            channelName: channel,
            token: voiceToken,
          })
        }
      />

      <View style={styles.contextBar}>
        <View style={styles.onlineDot} />
        <Text style={styles.contextText}>
          {conversation?.service || 'Notarizr appointment'}
        </Text>
        <View style={styles.securePill}>
          <Feather name="shield" size={12} color="#168B58" />
          <Text style={styles.secureText}>Secure</Text>
        </View>
      </View>

      {connectionState === 'connecting' ? (
        <View style={styles.connectionBanner}>
          <ActivityIndicator size="small" color="#FD6D1F" />
          <Text style={styles.connectionText}>Loading messages...</Text>
        </View>
      ) : null}
      {connectionState === 'error' ? (
        <View style={styles.errorBanner}>
          <Feather name="alert-circle" size={16} color="#C44242" />
          <Text style={styles.errorText}>{connectionError}</Text>
          <TouchableOpacity
            onPress={() => setConnectionAttempt(value => value + 1)}>
            <Text style={styles.errorRetry}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.chatArea}>
        <GiftedChat
          alwaysShowSend
          bottomOffset={4}
          infiniteScroll
          isTyping={false}
          messages={messages}
          minComposerHeight={46}
          maxComposerHeight={46}
          minInputToolbarHeight={68}
          onSend={nextMessages => sendMessage({text: nextMessages[0]?.text})}
          placeholder="Write a message"
          renderActions={props => (
            <Actions
              {...props}
              containerStyle={styles.actionContainer}
              icon={CameraActionIcon}
              onPressActionButton={pickImages}
            />
          )}
          renderBubble={renderBubble}
          renderAvatar={props => (
            <UserAvatar
              name={props.currentMessage?.user?.name || receiverName}
              size={36}
              source={props.currentMessage?.user?.avatar}
            />
          )}
          renderChatEmpty={renderChatEmpty}
          renderComposer={renderComposer}
          renderInputToolbar={renderInputToolbar}
          renderSend={renderSend}
          scrollToBottom
          scrollToBottomComponent={ScrollToBottomIcon}
          text={inputMessage}
          onInputTextChanged={setInputMessage}
          textInputProps={{editable: connectionState !== 'connecting'}}
          user={{_id: senderId || 'user'}}
          renderAccessory={
            selectedImages.length
              ? () => (
                  <View style={styles.accessoryContainer}>
                    {selectedImages.map((asset, index) => (
                      <View
                        key={`${asset.uri}-${index}`}
                        style={styles.imageContainer}>
                        <Image
                          source={{uri: asset.uri}}
                          style={styles.selectedImage}
                        />
                        <TouchableOpacity
                          accessibilityLabel="Remove selected image"
                          onPress={() =>
                            setSelectedImages(previous =>
                              previous.filter(
                                (_, imageIndex) => imageIndex !== index,
                              ),
                            )
                          }
                          style={styles.closeButton}>
                          <Feather name="x" size={13} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity
                      onPress={handleSend}
                      style={styles.sendCircle}>
                      <Feather name="arrow-up" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )
              : undefined
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  contextBar: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E6E9ED',
    backgroundColor: '#F8F9FB',
  },
  onlineDot: {
    width: 7,
    height: 7,
    marginRight: 8,
    borderRadius: 4,
    backgroundColor: '#16A166',
  },
  contextText: {
    flex: 1,
    color: '#717987',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  securePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#EAF7F0',
  },
  secureText: {
    color: '#168B58',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  connectionBanner: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF7F0',
  },
  connectionText: {color: '#777F8B', fontSize: 11},
  errorBanner: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FCEEEE',
  },
  errorText: {flex: 1, color: '#984040', fontSize: 11},
  errorRetry: {
    color: '#C44242',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  chatArea: {flex: 1, backgroundColor: '#F7F8FA'},
  leftBubble: {
    maxWidth: '82%',
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E8ED',
  },
  rightBubble: {
    maxWidth: '82%',
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    backgroundColor: '#FD6D1F',
  },
  leftText: {color: '#1C2330', fontFamily: 'Manrope-Regular', fontSize: 14},
  rightText: {color: '#FFFFFF', fontFamily: 'Manrope-Regular', fontSize: 14},
  leftTime: {color: '#969DA8', fontSize: 9},
  rightTime: {color: '#FFE1D0', fontSize: 9},
  bubbleBottom: {marginTop: 1},
  messageGroup: {maxWidth: '86%', alignItems: 'flex-start'},
  messageGroupRight: {alignItems: 'flex-end'},
  joinSessionButton: {
    minWidth: 190,
    height: 46,
    marginTop: 6,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 12,
    backgroundColor: '#171D29',
  },
  joinSessionButtonRight: {backgroundColor: '#D95218'},
  joinSessionText: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    textAlign: 'center',
  },
  inputToolbar: {
    minHeight: 68,
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 5,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: '#E0E4E9',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
  },
  inputPrimary: {alignItems: 'center'},
  textInput: {
    marginHorizontal: 4,
    paddingTop: 12,
    color: '#1C2330',
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
  },
  actionContainer: {
    width: 42,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
  },
  sendContainer: {
    width: 52,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendCircle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#FD6D1F',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    transform: [{scaleY: -1}],
  },
  emptyAvatar: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: '#FFF0E7',
  },
  emptyInitials: {
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
  },
  emptyTitle: {
    marginTop: 18,
    color: '#1C2330',
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  emptyText: {
    maxWidth: 280,
    marginTop: 7,
    color: '#858D99',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  accessoryContainer: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF1',
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {position: 'relative'},
  selectedImage: {width: 52, height: 52, borderRadius: 8},
  closeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#C44242',
  },
});
