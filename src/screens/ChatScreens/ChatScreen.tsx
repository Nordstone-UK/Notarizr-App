import {useMutation} from '@apollo/client';
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
import {Actions, GiftedChat} from 'react-native-gifted-chat';
import {launchImageLibrary} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useDispatch, useSelector} from 'react-redux';

import {GET_CHAT_TOKEN} from '../../../request/mutations/getUserChatToken.mutation';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {setChatToken} from '../../features/chats/chatsSlice';
import useRegister from '../../hooks/useRegister';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import {socket} from '../../utils/Socket';

const AGORA_CHAT_APP_KEY = '411048105#1224670';

/**
 * Load the SDK when the chat screen is opened. A static import executes the
 * SDK's NativeEventEmitter while the app bundle is loading and produces an
 * unhelpful Hermes `ChatClient of undefined` crash when the native binary has
 * not yet been rebuilt. Loading it here lets us report/retry that state safely.
 */
function loadAgoraChatSdk() {
  try {
    const module = require('react-native-agora-chat');
    const sdk = module?.ChatClient ? module : module?.default;

    if (!sdk?.ChatClient || !sdk?.ChatMessage) {
      throw new Error('Agora Chat SDK is unavailable in this app build.');
    }

    return sdk;
  } catch (error: any) {
    const nativeMessage = error?.description || error?.message;
    throw new Error(
      nativeMessage ||
        'Agora Chat is not linked. Rebuild the native app after installing pods.',
    );
  }
}

function formatAgoraMessages(messageList: any[] = []) {
  return messageList
    .map(message => {
      const baseMessage = {
        _id: message.msgId || message.localMsgId,
        createdAt: new Date(
          message.serverTime || message.localTime || Date.now(),
        ),
        user: {_id: message.from},
      };

      if (message.body?.type === 'img') {
        return {
          ...baseMessage,
          image:
            message.body.remotePath ||
            message.body.thumbnailRemotePath ||
            message.body.localPath ||
            '',
        };
      }

      return {
        ...baseMessage,
        text:
          message.body?.type === 'txt'
            ? message.body.content || ''
            : '[Unsupported message type]',
      };
    })
    .filter(message => Boolean(message._id))
    .sort(
      (first, second) => second.createdAt.getTime() - first.createdAt.getTime(),
    );
}

function CameraActionIcon() {
  return (
    <Image
      source={require('../../../assets/camera1.png')}
      style={styles.imageIcon}
    />
  );
}

export default function ChatScreen({route, navigation}: any) {
  const {
    sender: routeSender,
    receiver,
    channel,
    voiceToken,
  } = route.params || {};
  const authenticatedUser = useSelector((state: any) => state?.user?.user);
  const cachedToken = useSelector((state: any) => state?.chats?.chatToken);
  const sender = authenticatedUser?._id ? authenticatedUser : routeSender;
  const senderId = sender?._id;
  const receiverId = receiver?._id;

  const dispatch = useDispatch();
  const [getChatToken] = useMutation(GET_CHAT_TOKEN);
  const {handleCompression, uploadBlobToS3} = useRegister();

  const [messages, setMessages] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connectionState, setConnectionState] = useState<
    'connecting' | 'ready' | 'error'
  >('connecting');
  const [connectionError, setConnectionError] = useState('');
  const [connectionAttempt, setConnectionAttempt] = useState(0);

  const sdkRef = useRef<any>();
  const chatClientRef = useRef<any>();
  const chatManagerRef = useRef<any>();
  const cachedTokenRef = useRef(cachedToken);
  const connectionListenerRef = useRef<any>();
  const messageListenerRef = useRef<any>();
  const mountedRef = useRef(true);

  useEffect(() => {
    cachedTokenRef.current = cachedToken;
  }, [cachedToken]);

  const getFreshToken = useCallback(async () => {
    const {data} = await getChatToken();
    const nextToken = data?.getUserChatToken?.token;

    if (!nextToken) {
      throw new Error('The server did not return an Agora Chat token.');
    }

    dispatch(setChatToken(nextToken));
    return nextToken;
  }, [dispatch, getChatToken]);

  const fetchHistory = useCallback(async () => {
    const sdk = sdkRef.current;
    const chatManager = chatManagerRef.current;
    if (!sdk || !chatManager || !receiverId) {
      return;
    }

    try {
      const result = await chatManager.fetchHistoryMessagesByOptions(
        receiverId,
        sdk.ChatConversationType.PeerChat,
        {cursor: '', pageSize: 50},
      );

      if (mountedRef.current) {
        setMessages(formatAgoraMessages(result?.list));
      }
    } catch (error) {
      console.warn('Unable to load Agora Chat history:', error);
    }
  }, [receiverId]);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    const connect = async () => {
      if (!senderId || !receiverId) {
        setConnectionState('error');
        setConnectionError('The agent or client information is missing.');
        return;
      }

      setConnectionState('connecting');
      setConnectionError('');

      try {
        const sdk = loadAgoraChatSdk();
        const chatClient = sdk.ChatClient.getInstance();
        const chatManager = chatClient.chatManager;

        sdkRef.current = sdk;
        chatClientRef.current = chatClient;
        chatManagerRef.current = chatManager;

        await chatClient.init(
          new sdk.ChatOptions({
            appKey: AGORA_CHAT_APP_KEY,
            autoLogin: true,
          }),
        );

        if (cancelled) {
          return;
        }

        const renewToken = async () => {
          try {
            const nextToken = await getFreshToken();
            await chatClient.renewAgoraToken(nextToken);
          } catch (error) {
            console.warn('Unable to renew Agora Chat token:', error);
          }
        };

        const connectionListener = {
          onTokenWillExpire: renewToken,
          onTokenDidExpire: renewToken,
          onConnected: () => {
            if (mountedRef.current) {
              setConnectionState('ready');
            }
            fetchHistory();
          },
          onDisconnected: (errorCode: number) => {
            console.warn('Agora Chat disconnected:', errorCode);
          },
        };
        const messageListener = {
          onMessagesReceived: (incomingMessages: any[]) => {
            const peerMessages = incomingMessages.filter(
              message =>
                message.from === receiverId || message.to === receiverId,
            );
            if (peerMessages.length && mountedRef.current) {
              setMessages(previous =>
                GiftedChat.append(previous, formatAgoraMessages(peerMessages)),
              );
            }
          },
        };

        connectionListenerRef.current = connectionListener;
        messageListenerRef.current = messageListener;
        chatClient.addConnectionListener(connectionListener);
        chatManager.addMessageListener(messageListener);

        let loggedInUser = '';
        try {
          loggedInUser = await chatClient.getCurrentUsername();
        } catch (_) {
          // No prior login is a normal first-use state.
        }

        if (loggedInUser && loggedInUser !== senderId) {
          await chatClient.logout();
          loggedInUser = '';
        }

        if (!loggedInUser) {
          const loginToken = cachedTokenRef.current || (await getFreshToken());
          try {
            await chatClient.loginWithAgoraToken(senderId, loginToken);
          } catch (loginError: any) {
            // The cached Redux token may have expired while the app was open.
            if (
              cachedTokenRef.current &&
              [104, 108, 202, 500].includes(loginError?.code)
            ) {
              const freshToken = await getFreshToken();
              await chatClient.loginWithAgoraToken(senderId, freshToken);
            } else if (loginError?.code !== 200) {
              throw loginError;
            }
          }
        }

        if (!cancelled) {
          setConnectionState('ready');
          await fetchHistory();
        }
      } catch (error: any) {
        console.error('Agora Chat connection failed:', error);
        if (!cancelled) {
          setConnectionState('error');
          setConnectionError(
            error?.description ||
              error?.message ||
              'Unable to connect to Agora Chat.',
          );
        }
      }
    };

    connect();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      const client = chatClientRef.current;
      const manager = chatManagerRef.current;
      if (client && connectionListenerRef.current) {
        client.removeConnectionListener(connectionListenerRef.current);
      }
      if (manager && messageListenerRef.current) {
        manager.removeMessageListener(messageListenerRef.current);
      }
    };
  }, [connectionAttempt, fetchHistory, getFreshToken, receiverId, senderId]);

  const sendMessage = useCallback(
    async (outgoing: {text?: string; image?: any}) => {
      const sdk = sdkRef.current;
      const chatManager = chatManagerRef.current;

      if (connectionState !== 'ready' || !sdk || !chatManager || !receiverId) {
        Toast.show({
          type: 'error',
          text1: 'Chat is still connecting',
          text2: 'Please wait a moment and try again.',
        });
        return;
      }

      try {
        let message;
        let displayImage = '';
        if (outgoing.text?.trim()) {
          message = sdk.ChatMessage.createTextMessage(
            receiverId,
            outgoing.text.trim(),
            sdk.ChatMessageChatType.PeerChat,
          );
        } else if (outgoing.image?.uri) {
          const compressedImage = await handleCompression(outgoing.image.uri);
          displayImage = await uploadBlobToS3(compressedImage);
          message = sdk.ChatMessage.createImageMessage(
            receiverId,
            outgoing.image.uri,
            sdk.ChatMessageChatType.PeerChat,
            outgoing.image.fileName || 'image.jpg',
            outgoing.image.fileSize,
          );
        } else {
          return;
        }

        await new Promise<void>((resolve, reject) => {
          chatManager
            .sendMessage(message, {
              onProgress: () => {},
              onError: (_localId: string, error: any) => reject(error),
              onSuccess: (sentMessage: any) => {
                const optimisticMessage = outgoing.text
                  ? {
                      _id: sentMessage.localMsgId,
                      text: outgoing.text.trim(),
                      createdAt: new Date(),
                      user: {_id: senderId},
                    }
                  : {
                      _id: sentMessage.localMsgId,
                      image: displayImage || outgoing.image.uri,
                      createdAt: new Date(),
                      user: {_id: senderId},
                    };
                setMessages(previous =>
                  GiftedChat.append(previous, [optimisticMessage]),
                );
                resolve();
              },
            })
            .catch(reject);
        });

        socket.emit('send-message', {
          receiverId,
          text: outgoing.text?.trim() || 'Image sent',
          senderName: [sender?.first_name, sender?.last_name]
            .filter(Boolean)
            .join(' '),
        });
      } catch (error: any) {
        console.error('Agora Chat message failed:', error);
        Toast.show({
          type: 'error',
          text1: 'Message failed',
          text2: error?.description || 'Please try again.',
        });
      }
    },
    [
      connectionState,
      handleCompression,
      receiverId,
      sender,
      senderId,
      uploadBlobToS3,
    ],
  );

  const pickImages = useCallback(() => {
    launchImageLibrary({mediaType: 'photo', selectionLimit: 5}, response => {
      if (!response.didCancel && response.assets) {
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

  const receiverName = useMemo(
    () =>
      [receiver?.first_name, receiver?.last_name].filter(Boolean).join(' ') ||
      'Client',
    [receiver?.first_name, receiver?.last_name],
  );

  const renderChatActions = useCallback(
    (props: any) => (
      <Actions
        {...props}
        containerStyle={styles.actionContainer}
        icon={CameraActionIcon}
        onPressActionButton={pickImages}
      />
    ),
    [pickImages],
  );

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title={receiverName}
        ProfilePic={
          receiver?.profile_picture
            ? {uri: receiver.profile_picture}
            : require('../../../assets/UserIcon.png')
        }
        profileImgPress={() =>
          navigation.navigate('ChatingProfiledetailScreen', {receiver})
        }
        lastImg={channel ? require('../../../assets/voiceCallIcon.png') : null}
        lastImgPress={() =>
          navigation.navigate('VoiceCallScreen', {
            sender,
            receiver,
            channelName: channel,
            token: voiceToken,
          })
        }
      />

      <View style={styles.bottomSheet}>
        {connectionState === 'connecting' && (
          <View style={styles.connectionBanner}>
            <ActivityIndicator size="small" color={Colors.Primary} />
            <Text style={styles.connectionText}>Connecting securely…</Text>
          </View>
        )}
        {connectionState === 'error' && (
          <View style={[styles.connectionBanner, styles.errorBanner]}>
            <View style={styles.errorCopy}>
              <Text style={styles.errorTitle}>Chat could not connect</Text>
              <Text style={styles.errorText}>{connectionError}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setConnectionAttempt(value => value + 1)}
              style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <GiftedChat
          messages={messages}
          onSend={nextMessages => sendMessage({text: nextMessages[0]?.text})}
          user={{_id: senderId || 'agent'}}
          renderActions={renderChatActions}
          textInputProps={{
            value: inputMessage,
            onChangeText: setInputMessage,
            editable: connectionState === 'ready',
            style: styles.textInput,
          }}
          renderAccessory={() =>
            selectedImages.length ? (
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
                      <Text style={styles.closeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={handleSend}
                  style={styles.sendButton}>
                  <Icon name="send" size={17} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  bottomSheet: {
    flex: 1,
    marginTop: widthToDp(2),
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  connectionBanner: {
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E7EB',
    backgroundColor: '#FFF4EA',
  },
  connectionText: {
    color: '#7A818D',
    fontSize: 13,
  },
  errorBanner: {
    justifyContent: 'space-between',
    backgroundColor: '#FCEEEE',
  },
  errorCopy: {
    flex: 1,
    paddingVertical: 8,
  },
  errorTitle: {
    color: '#C44242',
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 2,
    color: '#7A818D',
    fontSize: 11,
  },
  retryButton: {
    marginLeft: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.Primary,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  imageIcon: {
    width: 28,
    height: 28,
  },
  textInput: {
    flex: 1,
    minHeight: heightToDp(5),
    maxHeight: heightToDp(12),
    marginHorizontal: 10,
    color: '#121826',
    fontSize: 16,
  },
  accessoryContainer: {
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  selectedImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
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
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 17,
  },
  sendButton: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: Colors.Primary,
  },
});
