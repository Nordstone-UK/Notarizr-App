import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import { height, heightToDp, widthToDp } from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChatClient,
  ChatOptions,
  ChatMessageChatType,
  ChatMessage,
  ChatFetchMessageOptions,
  ChatConversation,
  ChatConversationType,
} from 'react-native-agora-chat';
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  ChannelProfileType,
} from 'react-native-agora';
import useChatService from '../../hooks/useChatService';
import { Token } from 'graphql';
import { GET_CHAT_TOKEN } from '../../../request/mutations/getUserChatToken.mutation';
import { useMutation } from '@apollo/client';
import { setChatToken } from '../../features/chats/chatsSlice';
import Toast from 'react-native-toast-message';
export default function ChatScreen({ route, navigation }: any) {
  const [getChatToken] = useMutation(GET_CHAT_TOKEN);
  const dispatch = useDispatch();
  const getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }
  };
  const { getAgoraCallToken } = useChatService();
  const token = useSelector(state => state.chats.chatToken);
  console.log("tokeren", token)
  const { sender, receiver, chat, channel, voiceToken } = route.params;
  console.log("sender", sender?._id)
  const appKey = '411048105#1224670';
  const uid = 0;
  const [channelName, setChannelName] = useState('');
  const [callToken, setCallToken] = useState('');
  const [chatToken, setchatToken] = React.useState(token);
  const [targetId, setTargetId] = React.useState(receiver?._id);
  const [username, setUsername] = React.useState(sender?._id);
  const [content, setContent] = React.useState([]);
  const chatClient = ChatClient.getInstance();
  const chatManager = chatClient.chatManager;
  const createIfNeed = true;
  const convType = ChatConversationType.PeerChat;
  let convID: string;
  const agoraEngineRef = useRef<IRtcEngine>(); // Agora engine instance
  const [isJoined, setIsJoined] = useState(false); // Indicates if the local user has joined the channel
  const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
  const [message, setMessage] = useState('');
  // console.log("contentes", content)
  const getVoiceToken = async () => {
    try {
      const { channelName, token } = await getAgoraCallToken(receiver._id);
      // console.log("tkfdfdfd", channelName, token)
      setChannelName(channelName);
      setCallToken(token);
    } catch (error) {
      console.log('API Error:', error);
    }
  };
  function showMessage(msg: string) {
    setMessage(msg);
  }
  const retreiveConverstation = async () => {
    chatManager
      .getAllConversations()
      .then(data => {
        // console.log("getconversationdate", data)
        convID = data[0]?.convId;
        console.log
        fetchHistoryMessages(convID, convType);
      })
      .catch(reason => {
        console.log('Loading conversations fails', reason);
      });
  };
  const fetchHistoryMessages = async () => {
    try {
      const convList = await chatManager.getAllConversations();
      console.log("consversatiocn", convList)
      if (convList && convList.length > 0) {
        const conversation = convList.find(conv => conv.convType === ChatConversationType.PeerChat && conv.convId === targetId);

        if (conversation) {
          const messages = await chatManager.fetchHistoryMessagesByOptions(conversation.convId, ChatConversationType.PeerChat, {
            cursor: '',
            pageSize: 100,
          });
          console.log("messsssagesss", messages.list.body)
          if (messages && messages.list) {
            const formattedMessages = formatMessages(messages.list);
            console.log("foramtedmessag", formattedMessages)
            setContent(previousMessages => GiftedChat.append(previousMessages, formattedMessages));
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch history messages:', error);
    }
  };
  useEffect(() => {

    const setMessageListener = () => {
      let msgListener = {
        onMessagesReceived(messages: string | any[]) {
          console.log('Received messages:', messages);
          for (let index = 0; index < messages.length; index++) {
            const newMessages = [
              {
                _id: messages[index].msgId,
                text: messages[index].body.content,
                createdAt: messages[index].localTime,
                user: {
                  _id: receiver?._id,
                },
              },
            ];
            setContent((previousMessages: any) =>
              GiftedChat.append(previousMessages, newMessages),
            );
          }
        },
        onCmdMessagesReceived: (messages: any) => { },
        onMessagesRead: (messages: any) => { },
        onGroupMessageRead: (groupMessageAcks: any) => { },
        onMessagesDelivered: (messages: any) => { },
        onMessagesRecalled: (messages: any) => { },
        onConversationsUpdate: () => { },
        onConversationRead: (from: any, to: any) => { },
      };
      chatManager.removeAllMessageListener();
      chatManager.addMessageListener(msgListener);
    };
    const init = () => {
      let o = new ChatOptions({
        autoLogin: false,
        appKey: appKey,
      });
      chatClient.removeAllConnectionListener();
      chatClient
        .init(o)
        .then(() => {
          console.log('init success');
          this.isInitialized = true;
          let listener = {
            onTokenWillExpire() {
              console.log('token expire.');
            },
            onTokenDidExpire() {
              console.log('token did expire');
            },
            onConnected() {
              console.log('onConnected');
              setMessageListener();
              retreiveConverstation();
            },
            onDisconnected(errorCode: string) {
              console.log('onDisconnected:' + errorCode);
            },
          };
          login();
          chatClient.addConnectionListener(listener);
        })
        .catch(error => {
          console.log(
            'init fail: ' +
            (error instanceof Object ? JSON.stringify(error) : error),
          );
        });
    };
    init();
    getVoiceToken();
  }, [chatClient, chatManager, appKey, getChatToken]);
  const refreshChatTokenAndRetryLogin = async () => {
    try {
      const { data } = await getChatToken();
      const newToken = data?.getUserChatToken?.token;

      if (newToken) {
        // Dispatch the new token
        dispatch(setChatToken(newToken));

        // Retry login
        await chatClient.loginWithAgoraToken(username, token);
        console.log('Login retry successful.');
      } else {
        console.error('Failed to fetch a new chat token.');
      }
    } catch (error) {
      console.error('Error refreshing token and retrying login:', error);
    }
  };
  const logout = () => {
    if (this.isInitialized === false || this.isInitialized === undefined) {
      console.log('Perform initialization first.');
      return;
    }
    console.log('start logout ...');
    chatClient
      .logout()
      .then(() => {
        console.log('logout success.');
      })
      .catch(reason => {
        console.log('logout fail:' + JSON.stringify(reason));
      });
  };
  const login = async () => {
    if (this.isInitialized === false || this.isInitialized === undefined) {
      console.log('Perform initialization first.');
      return;
    }
    chatClient
      .loginWithAgoraToken(username, chatToken)
      .then(() => {
        console.log('login operation success.');
      })
      .catch(reason => {
        if (reason.code === 108) {
          logout()
          refreshChatTokenAndRetryLogin();
        }
        else if (reason.code === 202) {
          logout()
          refreshChatTokenAndRetryLogin();
        }
        else if (reason.code === 104) {
          logout()
          refreshChatTokenAndRetryLogin();
        }
        else if (reason.code === 200) {
          // User already logged in, log out and retry login
          console.log('User already logged in, attempting to log out and retry login...');
          try {
            logout()
            console.log('Logout successful, retrying login...');
            login();
          } catch (logoutError) {
            console.error('Logout failed:', logoutError);
          }
        }
        else {
          console.error('Login failed for another reason:', reason);
        }
        console.log('login fail: ' + JSON.stringify(reason));
      });
  };
  const sendmsg = (newMessage: string) => {

    const chatType = ChatMessageChatType.PeerChat;
    const content = newMessage.text;
    console.log('Sending message:sss', this.isInitialized);

    if (this.isInitialized === false || this.isInitialized === undefined) {
      console.log('Perform initialization first.');
      return;
    }
    // const msg = ChatMessage.createSendMessage(content, targetId);

    let msg: ChatMessage;

    msg = ChatMessage.createTextMessage(targetId, content, chatType);

    // console.log('contentIIII', targetId);
    // let msg = ChatMessage.createTextMessage(
    //   targetId,
    //   content,
    //   ChatMessageChatType.PeerChat,
    // );
    const callback = new (class {
      onProgress(locaMsgId: any, progress: any) {
        console.log(`send message process: ${locaMsgId}, ${progress}`);

      }

      onError(locaMsgId: any, error: any) {
        console.log(
          `send message fail: ${locaMsgId}, ${JSON.stringify(error)}`,
        );
        if (error.code === 500) {
          try {
            // Perform relogin operation
            refreshChatTokenAndRetryLogin();
            Toast.show({
              type: 'error',
              text1: 'Message Failed',
              text2: 'Failed to send the message. Please try again.',
            });
          }
          // // Fetch the original message using locaMsgId or any stored reference
          // const message = getMessageById(locaMsgId); // Implement this function to retrieve the original message
          // console.log("messagere", message)
          // if (message) {
          //   message.status = 'pending';
          //   const resendCallback = new (class {
          //     onProgress(resendMsgId: string, resendProgress: any) {
          //       console.log(
          //         `Resending progress: ${resendMsgId}, ${resendProgress}`
          //       );
          //     }
          //     onError(resendMsgId: string, resendError: any) {
          //       console.error(
          //         `Resending failed: ${resendMsgId}, ${JSON.stringify(resendError)}`
          //       );
          //     }
          //     onSuccess(resendMsg: { localMsgId: string }) {
          //       console.log(`Resent successfully: ${resendMsg.localMsgId}`);
          //     }
          //   })();

          //   chatClient.chatManager.sendMessage(message, resendCallback);
          // } else {
          //   console.error(`Original message not found: ${localMsgId}`);
          // }
          catch (e) {
            console.error(`Error during relogin or resend: ${e.message}`);
          }
        }
      }
      onSuccess(message: { localMsgId: string }) {
        console.log('send message success: ' + message.localMsgId);

        const newMessages = [
          {
            _id: message.localMsgId,
            text: content,
            createdAt: new Date(),
            user: {
              _id: sender?._id,
            },
          },
        ];

        setContent((previousMessages: any) =>
          GiftedChat.append(previousMessages, newMessages),
        );
      }
    })();

    chatClient.chatManager
      .sendMessage(msg, callback)
      .then(() => {
        console.log('send message: ' + msg.localMsgId);
      })
      .catch(reason => {
        console.log('send fail: ' + JSON.stringify(reason));
      });
  };
  function getMessageById(localMsgId: string): ChatMessage | undefined {
    // Retrieve the original message from storage or memory using the local message ID.
    return chatMessageCache[localMsgId]; // Replace with actual retrieval logic
  }
  const formatMessages = (messageList: any[]) => {
    console.log('messageList', messageList);

    if (!messageList || !Array.isArray(messageList)) {
      return [];
    }

    return messageList.map(message => {
      return {
        _id: message.msgId,
        text: message.body?.content || '', // Use optional chaining to avoid errors if content is missing
        createdAt: new Date(message.serverTime),
        user: {
          _id: message.from,
        },
      };
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title={receiver?.first_name + ' ' + receiver?.last_name}
        ProfilePic={{ uri: receiver?.profile_picture }}
        lastImg={channel ? require('../../../assets/voiceCallIcon.png') : null}
        lastImgPress={() =>
          navigation.navigate('VoiceCallScreen', {
            sender: sender,
            receiver: receiver,
            channelName: channel,
            token: voiceToken,
          })
        }
      />
      <View style={styles.bottonSheet}>
        <GiftedChat
          messages={content}
          onSend={setContent => sendmsg(setContent[0])}
          user={{
            _id: sender?._id,
          }}
          textInputProps={{
            style: {
              flex: 1,
              marginHorizontal: 10,
              color: 'black',
              fontSize: 16,
            },
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.PinkBackground,
    flex: 1,
  },
  bottonSheet: {
    marginTop: widthToDp(2),
    backgroundColor: '#fff',
    borderRadius: 20,
    flex: 1,
    justifyContent: 'flex-end',
  },
  inputContainer: {
    width: widthToDp(90),
    backgroundColor: Colors.DullWhite,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    alignSelf: 'center',
    marginBottom: widthToDp(5),
  },
  input: {
    flex: 1,
    height: heightToDp(15),
    marginRight: 10,
    paddingHorizontal: 10,
  },
  icon: {
    width: widthToDp(7),
    height: heightToDp(7),
  },
  button: {
    paddingVertical: heightToDp(2),
    paddingHorizontal: heightToDp(2),
  },
});
