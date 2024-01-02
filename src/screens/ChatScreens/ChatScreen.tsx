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
import React, {useState, useCallback, useEffect, useRef} from 'react';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import {GiftedChat, IMessage} from 'react-native-gifted-chat';
import {useSelector} from 'react-redux';
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
export default function ChatScreen({route, navigation}: any) {
  const getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }
  };
  const {getAgoraCallToken} = useChatService();
  const token = useSelector(state => state.chats.chatToken);
  const {receiver, sender} = route.params;
  const appKey = '411048105#1224670';
  const uid = 0;
  const [channelName, setChannelName] = useState('');
  const [callToken, setCallToken] = useState('');
  const [chatToken, setChatToken] = React.useState(token);
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
  const getVoiceToken = async () => {
    try {
      const {channelName, token} = await getAgoraCallToken(receiver._id);
      setChannelName(channelName);
      setCallToken(token);

      console.log('Channel Name:', channelName);
      console.log('Token:', token);
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
        convID = data[0]?.convId;
        // fetchHistoryMessages(convID, convType);
      })
      .catch(reason => {
        console.log('Loading conversations fails', reason);
      });
  };

  const fetchHistoryMessages = async (
    convID: string,
    convType: ChatConversationType,
  ) => {
    try {
      const result =
        await ChatClient.getInstance().chatManager.fetchHistoryMessagesByOptions(
          convID,
          convType,
          {
            cursor: '',
            pageSize: 100,
          },
        );
      console.log('Fetch history messages success', result?.list?.[0]?.body);
    } catch (error) {
      console.error('Fetch history messages failed', error);
    }
  };
  useEffect(() => {
    const setMessageListener = () => {
      let msgListener = {
        onMessagesReceived(messages: string | any[]) {
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
        onCmdMessagesReceived: (messages: any) => {},
        onMessagesRead: (messages: any) => {},
        onGroupMessageRead: (groupMessageAcks: any) => {},
        onMessagesDelivered: (messages: any) => {},
        onMessagesRecalled: (messages: any) => {},
        onConversationsUpdate: () => {},
        onConversationRead: (from: any, to: any) => {},
      };
      chatManager.removeAllMessageListener();
      chatManager.addMessageListener(msgListener);
    };
    const init = () => {
      let o = new ChatOptions({
        autoLogin: true,
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
          chatClient.addConnectionListener(listener);
          login();
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
  }, [chatClient, chatManager, appKey]);
  const login = () => {
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
        console.log('login fail: ' + JSON.stringify(reason));
      });
  };
  const sendmsg = (newMessage: IMessage) => {
    const content = newMessage.text;

    if (this.isInitialized === false || this.isInitialized === undefined) {
      console.log('Perform initialization first.');
      return;
    }

    console.log('content', content);
    let msg = ChatMessage.createTextMessage(
      targetId,
      content,
      ChatMessageChatType.PeerChat,
    );

    const callback = new (class {
      onProgress(locaMsgId: any, progress: any) {
        console.log(`send message process: ${locaMsgId}, ${progress}`);
      }
      onError(locaMsgId: any, error: any) {
        console.log(
          `send message fail: ${locaMsgId}, ${JSON.stringify(error)}`,
        );
      }
      onSuccess(message: {localMsgId: string}) {
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

    console.log('start send message ...');
    chatClient.chatManager
      .sendMessage(msg, callback)
      .then(() => {
        console.log('send message: ' + msg.localMsgId);
      })
      .catch(reason => {
        console.log('send fail: ' + JSON.stringify(reason));
      });
  };
  const formatMessages = (messageList: any[]) => {
    console.log('messageList', messageList);

    if (!messageList || !Array.isArray(messageList)) {
      return [];
    }

    return messageList.map(message => {
      return {
        _id: message.msgId,
        text: message.body[0]?.content || '', // Use optional chaining to avoid errors if content is missing
        createdAt: new Date(message.localTime),
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
        ProfilePic={{uri: receiver?.profile_picture}}
        lastImg={require('../../../assets/voiceCallIcon.png')}
        lastImgPress={() =>
          navigation.navigate('VoiceCallScreen', {
            sender: sender,
            receiver: receiver,
            ChannelName: channelName,
            CallToken: callToken,
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
