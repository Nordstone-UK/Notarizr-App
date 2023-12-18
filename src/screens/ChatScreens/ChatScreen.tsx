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
import {GiftedChat} from 'react-native-gifted-chat';
import {useSelector} from 'react-redux';
import RNImmediatePhoneCall from 'react-native-immediate-phone-call';
import useChatService from '../../hooks/useChatService';
import {socket} from '../../utils/Socket';
import {
  ChatClient,
  ChatOptions,
  ChatMessageChatType,
  ChatMessage,
  ChatGroupMessageAck,
  ChatMessageEventListener,
} from 'react-native-agora-chat';
import moment from 'moment';
export default function ChatScreen({route}: any, props: any) {
  const user = useSelector((state: any) => state.user.user);
  const title = 'AgoraChatQuickstart';
  const appKey = '411048105#1224670';
  // const [chatToken, setChatToken] = React.useState(
  //   '007eJxTYHgQ+UotOVJS+srVS8mPLiw9x3LnaAcHu4/Xg/QMXu3YI7sUGBKTUsxT0swNU1MNjEzMjEyTjJKTLc0tUw2NElOTTQxMcyMaUhsCGRlaDS6xMjKwMjACIYivwpCWZGCUbJ5koGuZYmmuawg0QTcp0TxV1yTFwjDNwDAxKS3ZAgCz+yhf',
  // );
  // const [targetId, setTargetId] = React.useState('Client0001');
  // const [username, setUsername] = React.useState('Agent0001');

  const [username, setUsername] = React.useState('Client0001');
  const [chatToken, setChatToken] = React.useState(
    '007eJxTYFiu5j3V6tjeK8/uhE0UuFNTbnK0eiXzdeEp5wJbX1VKZS1QYEhMSjFPSTM3TE01MDIxMzJNMkpOtjS3TDU0SkxNNjEwbY1oSG0IZGRY8PIqKyMDKwMjEIL4KgyGiUlJiZYGBrqWKZYWuoZAE3QTzQ0NdVPTkpLMjJIMzc0NEgEwKimg',
  );
  const [targetId, setTargetId] = React.useState('Agent0001');
  const [content, setContent] = React.useState([]);
  const chatClient = ChatClient.getInstance();
  const chatManager = chatClient.chatManager;
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
                  _id: 2, // Assuming the current user ID is 1
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
        // onMessagesRecalled: (messages: any) => {},
        onConversationsUpdate: () => {},
        onConversationRead: (from: any, to: any) => {},
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
            },
            onDisconnected(errorCode: string) {
              console.log('onDisconnected:' + errorCode);
            },
          };
          chatClient.addConnectionListener(listener);
        })
        .catch((error: any) => {
          console.log(
            'init fail: ' +
              (error instanceof Object ? JSON.stringify(error) : error),
          );
        });
    };
    init();
    login();

    // const listener = new ChatMessageEvent();
    // ChatClient.getInstance().chatManager.addMessageListener(listener);

    // ChatClient.getInstance().chatManager.removeMessageListener(listener);

    // ChatClient.getInstance().chatManager.removeAllMessageListener();
  }, [chatClient, chatManager, appKey]);
  // class ChatMessageEvent implements ChatMessageEventListener {
  //   onMessagesReceived(messages: ChatMessage[]): void {
  //     console.log(`onMessagesReceived: `, messages);
  //   }
  //   onCmdMessagesReceived(messages: ChatMessage[]): void {
  //     console.log(`onCmdMessagesReceived: `, messages);
  //   }
  //   onMessagesRead(messages: ChatMessage[]): void {
  //     console.log(`onMessagesRead: `, messages);
  //   }
  //   onGroupMessageRead(groupMessageAcks: ChatGroupMessageAck[]): void {
  //     console.log(`onGroupMessageRead: `, groupMessageAcks);
  //   }
  //   onMessagesDelivered(messages: ChatMessage[]): void {
  //     console.log(`onMessagesDelivered: ${messages.length}: `, messages);
  //   }
  //   onMessagesRecalled(messages: ChatMessage[]): void {
  //     console.log(`onMessagesRecalled: `, messages);
  //   }
  //   onConversationsUpdate(): void {
  //     console.log(`onConversationsUpdate: `);
  //   }
  //   onConversationRead(from: string, to?: string): void {
  //     console.log(`onConversationRead: `, from, to);
  //   }
  // }

  const login = () => {
    if (this.isInitialized === false || this.isInitialized === undefined) {
      console.log('Perform initialization first.');
      return;
    }
    chatClient
      .loginWithAgoraToken(username, chatToken)
      .then(() => {
        // console.log('login operation success.');
      })
      .catch(reason => {
        console.log('login fail: ' + JSON.stringify(reason));
      });
  };

  const sendmsg = (newMessage: any) => {
    // Assuming `content` is the message content obtained from the input area
    const content = newMessage.text;

    // Agora Chat SDK logic for sending messages
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

        // Update the `messages` state with the new message
        const newMessages = [
          {
            _id: message.localMsgId,
            text: content,
            createdAt: new Date(),
            user: {
              _id: 1, // Assuming the current user ID is 1
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
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title={user.first_name + ' ' + user.last_name}
        ProfilePic={{uri: user.profile_picture}}
      />
      <View style={styles.bottonSheet}>
        <GiftedChat
          messages={content}
          onSend={setContent => sendmsg(setContent[0])}
          user={{
            _id: 1, // user id
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
// const userID = useSelector(state => state.user.user._id);
// const socketID = useSelector(state => state.user.socketID);
// const {user, chat} = route.params;
// const [messages, setMessages] = useState([]);
// const {allMessages, setAllMessages} = useState();
// const {handleGetMessages} = useChatService();
// socket.on('connect', () => {
//   console.log(socket.id);
// });
// useEffect(() => {
//   handleGetMessages(chat);

//   if (socket) {
//     socket.on('recieve-message', data => {
//       console.log(data);
//       socket.emit('message-recieved', data._id);

//       setMessages(previousMessages =>
//         GiftedChat.append(previousMessages, data),
//       );
//     });
//   }
// }, [socket]);
// const onSend = useCallback(messages => {
//   console.log('====================================');
//   console.log('onsend');
//   console.log('====================================');
//   let socket_data = {
//     _id: socketID,
//     user: userID,
//     chat: chat,
//     text: messages,
//     receiverId: user._id,
//   };
//   console.log(socket_data);
//   try {
//     socket.emit('send-message', socket_data, data => {
//       console.log(data);
//     });
//   } catch (error) {
//     console.error(error);
//   }
// }, []);
// const renderSend = props => {
//   return (
//     <TouchableOpacity style={styles.button}>
//       <Image
//         source={require('../../../assets/send.png')}
//         style={styles.icon}
//       />
//     </TouchableOpacity>
//   );
