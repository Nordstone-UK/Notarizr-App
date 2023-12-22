import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import React, {useState, useCallback, useEffect} from 'react';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import {GiftedChat, IMessage} from 'react-native-gifted-chat';
import {useSelector} from 'react-redux';
import useChatService from '../../hooks/useChatService';
import {socket} from '../../utils/Socket';
import {
  ChatClient,
  ChatOptions,
  ChatMessageChatType,
  ChatMessage,
  ChatFetchMessageOptions,
  ChatConversation,
  ChatConversationType,
} from 'react-native-agora-chat';
export default function ChatScreen({route}) {
  // const conversation = [
  //   {
  //     attributes: ['Object'],
  //     body: [{content: 'Hello'}],
  //     chatType: 0,
  //     conversationId: '654a1aa24658e48139a20b91',
  //     deliverOnlineOnly: false,
  //     direction: 'send',
  //     from: '655f8cfda98b2aabe64ea94c',
  //     groupAckCount: 0,
  //     hasDeliverAck: false,
  //     hasRead: true,
  //     hasReadAck: false,
  //     isChatThread: false,
  //     isOnline: true,
  //     localMsgId: '1703068453426',
  //     localTime: 1703068453426,
  //     msgId: '1225958871747529526',
  //     needGroupAck: false,
  //     receiverList: 'undefined',
  //     serverTime: 1703005593207,
  //     status: 2,
  //     to: '654a1aa24658e48139a20b91',
  //   },
  //   {
  //     attributes: ['Object'],
  //     body: [{content: 'How are you?'}],
  //     chatType: 0,
  //     conversationId: '654a1aa24658e48139a20b91',
  //     deliverOnlineOnly: false,
  //     direction: 'rec',
  //     from: '654a1aa24658e48139a20b91',
  //     groupAckCount: 0,
  //     hasDeliverAck: false,
  //     hasRead: false,
  //     hasReadAck: false,
  //     isChatThread: false,
  //     isOnline: true,
  //     localMsgId: '1703068453430',
  //     localTime: 1703068453430,
  //     msgId: '1225958606168394594',
  //     needGroupAck: false,
  //     receiverList: 'undefined',
  //     serverTime: 1703005531376,
  //     status: 2,
  //     to: '655f8cfda98b2aabe64ea94c',
  //   },
  //   {
  //     attributes: ['Object'],
  //     body: [{content: 'Nice to meet you'}],
  //     chatType: 0,
  //     conversationId: '654a1aa24658e48139a20b91',
  //     deliverOnlineOnly: false,
  //     direction: 'rec',
  //     from: '654a1aa24658e48139a20b91',
  //     groupAckCount: 0,
  //     hasDeliverAck: false,
  //     hasRead: false,
  //     hasReadAck: false,
  //     isChatThread: false,
  //     isOnline: true,
  //     localMsgId: '1703068453430',
  //     localTime: 1703068453430,
  //     msgId: '1225958262235466546',
  //     needGroupAck: false,
  //     receiverList: 'undefined',
  //     serverTime: 1703005451296,
  //     status: 2,
  //     to: '655f8cfda98b2aabe64ea94c',
  //   },
  //   {
  //     attributes: ['Object'],
  //     body: [{content: "I'm doing well, thanks!"}],
  //     chatType: 0,
  //     conversationId: '654a1aa24658e48139a20b91',
  //     deliverOnlineOnly: false,
  //     direction: 'send',
  //     from: '655f8cfda98b2aabe64ea94c',
  //     groupAckCount: 0,
  //     hasDeliverAck: false,
  //     hasRead: true,
  //     hasReadAck: false,
  //     isChatThread: false,
  //     isOnline: true,
  //     localMsgId: '1703068453430',
  //     localTime: 1703068453430,
  //     msgId: '1225958187669134170',
  //     needGroupAck: false,
  //     receiverList: 'undefined',
  //     serverTime: 1703005433950,
  //     status: 2,
  //     to: '654a1aa24658e48139a20b91',
  //   },
  //   {
  //     attributes: ['Object'],
  //     body: [{content: "That's great to hear!"}],
  //     chatType: 0,
  //     conversationId: '654a1aa24658e48139a20b91',
  //     deliverOnlineOnly: false,
  //     direction: 'send',
  //     from: '655f8cfda98b2aabe64ea94c',
  //     groupAckCount: 0,
  //     hasDeliverAck: false,
  //     hasRead: true,
  //     hasReadAck: false,
  //     isChatThread: false,
  //     isOnline: true,
  //     localMsgId: '1703068453430',
  //     localTime: 1703068453430,
  //     msgId: '1225958098468871002',
  //     needGroupAck: false,
  //     receiverList: 'undefined',
  //     serverTime: 1703005413163,
  //     status: 2,
  //     to: '654a1aa24658e48139a20b91',
  //   },
  //   {
  //     attributes: ['Object'],
  //     body: [{content: "How's your day going?"}],
  //     chatType: 0,
  //     conversationId: '654a1aa24658e48139a20b91',
  //     deliverOnlineOnly: false,
  //     direction: 'rec',
  //     from: '654a1aa24658e48139a20b91',
  //     groupAckCount: 0,
  //     hasDeliverAck: false,
  //     hasRead: false,
  //     hasReadAck: false,
  //     isChatThread: false,
  //     isOnline: true,
  //     localMsgId: '1703068453430',
  //     localTime: 1703068453430,
  //     msgId: '1225958077853866802',
  //     needGroupAck: false,
  //     receiverList: 'undefined',
  //     serverTime: 1703005408368,
  //     status: 2,
  //     to: '655f8cfda98b2aabe64ea94c',
  //   },
  //   {
  //     attributes: ['Object'],
  //     body: [{content: "It's been a busy day"}],
  //     chatType: 0,
  //     conversationId: '654a1aa24658e48139a20b91',
  //     deliverOnlineOnly: false,
  //     direction: 'rec',
  //     from: '654a1aa24658e48139a20b91',
  //     groupAckCount: 0,
  //     hasDeliverAck: false,
  //     hasRead: false,
  //     hasReadAck: false,
  //     isChatThread: false,
  //     isOnline: true,
  //     localMsgId: '1703068453430',
  //     localTime: 1703068453430,
  //     msgId: '1225957978503383858',
  //     needGroupAck: false,
  //     receiverList: 'undefined',
  //     serverTime: 1703005385233,
  //     status: 2,
  //     to: '655f8cfda98b2aabe64ea94c',
  //   },
  //   {
  //     attributes: ['Object'],
  //     body: [{content: 'I can imagine! Anything exciting happening?'}],
  //     chatType: 0,
  //     conversationId: '654a1aa24658e48139a20b91',
  //     deliverOnlineOnly: false,
  //     direction: 'send',
  //     from: '655f8cfda98b2aabe64ea94c',
  //     groupAckCount: 0,
  //     hasDeliverAck: false,
  //     hasRead: true,
  //     hasReadAck: false,
  //     isChatThread: false,
  //     isOnline: true,
  //     localMsgId: '1703068453430',
  //     localTime: '1703068453430',
  //     to: '654a1aa24658e48139a20b91',
  //   },
  //   {
  //     attributes: ['Object'],
  //     body: [{content: 'Just the usual, work and stuff'}],
  //     chatType: 0,
  //     conversationId: '654a1aa24658e48139a20b91',
  //     deliverOnlineOnly: false,
  //     direction: 'send',
  //     from: '655f8cfda98b2aabe64ea94c',
  //     groupAckCount: 0,
  //     hasDeliverAck: false,
  //     hasRead: true,
  //     hasReadAck: false,
  //     isChatThread: false,
  //     isOnline: true,
  //     localMsgId: '1703068453430',
  //     localTime: 1703068453430,
  //     msgId: '1225957916150860634',
  //     needGroupAck: false,
  //     receiverList: 'undefined',
  //     serverTime: 1703005370727,
  //     status: 2,
  //     to: '654a1aa24658e48139a20b91',
  //   },
  //   {
  //     attributes: ['Object'],
  //     body: [{content: 'Sounds like a typical day'}],
  //     chatType: 0,
  //     conversationId: '654a1aa24658e48139a20b91',
  //     deliverOnlineOnly: false,
  //     direction: 'rec',
  //     from: '654a1aa24658e48139a20b91',
  //     groupAckCount: 0,
  //     hasDeliverAck: false,
  //     hasRead: false,
  //     hasReadAck: false,
  //     isChatThread: false,
  //     isOnline: true,
  //     localMsgId: '1703068453431',
  //     localTime: 1703068453431,
  //     msgId: '1225957875025709874',
  //     needGroupAck: false,
  //     receiverList: 'undefined',
  //     serverTime: 1703005361138,
  //     status: 2,
  //     to: '655f8cfda98b2aabe64ea94c',
  //   },
  // ];

  const token = useSelector(state => state.chats.chatToken);
  const {receiver, sender} = route.params;
  const appKey = '411048105#1224670';
  const [chatToken, setChatToken] = React.useState(token);
  const [targetId, setTargetId] = React.useState(receiver?._id);
  const [username, setUsername] = React.useState(sender?._id);
  const [content, setContent] = React.useState([]);
  const chatClient = ChatClient.getInstance();
  const chatManager = chatClient.chatManager;
  const createIfNeed = true;
  const convType = ChatConversationType.PeerChat;
  let convID: string;
  const functionName = () => {
    useEffect(() => {
      login();
    }, []);
  };

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
        })
        .catch(error => {
          console.log(
            'init fail: ' +
              (error instanceof Object ? JSON.stringify(error) : error),
          );
        });
    };
    init();
    login();
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
      />
      <View style={styles.bottonSheet}>
        <GiftedChat
          messages={content}
          onSend={setContent => sendmsg(setContent[0])}
          user={{
            _id: sender?._id, // user id
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
