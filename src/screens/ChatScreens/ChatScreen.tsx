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
  ChatFetchMessageOptions,
} from 'react-native-agora-chat';
export default function ChatScreen({route}) {
  const token = useSelector(state => state.chats.chatToken);
  const {receiver, sender} = route.params;
  const title = 'AgoraChatQuickstart';
  const appKey = '411048105#1224670';
  const [chatToken, setChatToken] = React.useState(token);
  const [targetId, setTargetId] = React.useState(receiver?._id);
  const [username, setUsername] = React.useState(sender?._id);
  const options = {};
  const [convID, setConId] = React.useState();
  const [convType, setConvType] = React.useState();
  const [content, setContent] = React.useState([]);
  const chatClient = ChatClient.getInstance();
  const chatManager = chatClient.chatManager;

  useEffect(() => {
    login();
  }, []);
  const retreiveConverstation = async () => {
    chatManager
      .fetchConversationsFromServerWithCursor('newest', 100)
      .then(data => {
        console.log('get conversions success', data);
        setConId(data?.list[0]?.convId);
        setConvType(data?.list[0]?.convType);
      })
      .catch(reason => {
        console.log('get conversions fail.', reason);
      })
      .then(() => {
        chatManager
          .fetchHistoryMessagesByOptions(convID, convType, {
            cursor: '',
            pageSize: 1,
            options: options as ChatFetchMessageOptions,
          })
          .then(result => {
            console.log('get history message success', result);
          })
          .catch(reason => {
            console.log('get history message fail.', reason);
          });
      });
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
                  _id: 2,
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
            onDisconnected(errorCode) {
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
  }, [chatClient, chatManager, appKey]);
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
  const sendmsg = newMessage => {
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
              _id: 1,
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
        Title={receiver?.first_name + ' ' + receiver?.last_name}
        ProfilePic={{uri: receiver?.profile_picture}}
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
