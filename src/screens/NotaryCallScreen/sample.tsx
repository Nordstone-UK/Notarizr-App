export default function ChatScreen({ route, navigation }: any) {
  const [isInitialized, setIsInitialized] = useState(false); // Manage initialized state
  const [content, setContent] = useState<IMessage[]>([]); // Manage chat content

  const getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }
  };

  const { getAgoraCallToken } = useChatService();
  const token = useSelector(state => state.chats.chatToken);
  const { sender, receiver, chat, channel, voiceToken } = route.params;
  const appKey = '411048105#1224670';
  const uid = 0;
  const [channelName, setChannelName] = useState('');
  const [callToken, setCallToken] = useState('');
  const [chatToken, setChatToken] = useState(token);
  const [targetId, setTargetId] = useState(receiver?._id);
  const [username, setUsername] = useState(sender?._id);
  const chatClient = ChatClient.getInstance();
  const chatManager = chatClient.chatManager;

  const agoraEngineRef = useRef<IRtcEngine>(); // Agora engine instance

  const getVoiceToken = async () => {
    try {
      const { channelName, token } = await getAgoraCallToken(receiver._id);
      setChannelName(channelName);
      setCallToken(token);
    } catch (error) {
      console.log('API Error:', error);
    }
  };

  const retrieveConversation = async () => {
    chatManager
      .getAllConversations()
      .then(data => {
        const convID = data[0]?.convId;
        fetchHistoryMessages(convID, ChatConversationType.PeerChat);
      })
      .catch(reason => {
        console.log('Loading conversations failed', reason);
      });
  };

  const fetchHistoryMessages = async (convID: string, convType: number) => {
    try {
      const messages = await chatManager.fetchHistoryMessagesByOptions(convID, convType, { cursor: '', pageSize: 20 });
      const formattedMessages = formatMessages(messages.list);
      setContent(previousMessages => GiftedChat.append(previousMessages, formattedMessages));
    } catch (error) {
      console.error('Failed to fetch history messages:', error);
    }
  };

  const sendmsg = (newMessage: IMessage) => {
    const content = newMessage.text;

    if (!isInitialized) {
      console.log('Perform initialization first.');
      return;
    }

    let msg = ChatMessage.createTextMessage(targetId, content, ChatMessageChatType.PeerChat);

    const callback = new (class {
      onProgress(locaMsgId: any, progress: any) {
        console.log(`send message process: ${locaMsgId}, ${progress}`);
      }
      onError(locaMsgId: any, error: any) {
        console.log(`send message fail: ${locaMsgId}, ${JSON.stringify(error)}`);
      }
      onSuccess(message: { localMsgId: string }) {
        const newMessages = [
          {
            _id: message.localMsgId,
            text: content,
            createdAt: new Date(),
            user: { _id: sender?._id },
          },
        ];
        setContent(previousMessages => GiftedChat.append(previousMessages, newMessages));
      }
    })();

    chatManager
      .sendMessage(msg, callback)
      .then(() => console.log('Message sent: ' + msg.localMsgId))
      .catch(reason => console.log('Send failed: ' + JSON.stringify(reason)));
  };

  const formatMessages = (messageList: any[]) => {
    return messageList.map(message => ({
      _id: message.msgId,
      text: message.body?.content || '',
      createdAt: new Date(message.localTime),
      user: { _id: message.from },
    }));
  };

  useEffect(() => {

    const init = () => {
      const chatOptions = new ChatOptions({ autoLogin: true, appKey });
      chatClient.init(chatOptions).then(() => {
        console.log('Init success');
        setIsInitialized(true);
        const listener = {
          onConnected: () => {
            console.log('onConnected');
            retrieveConversation();
          },
        };
        chatClient.addConnectionListener(listener);
        login();
      });
    };

    const login = () => {
      chatClient
        .loginWithAgoraToken(username, chatToken)
        .then(() => console.log('Login success'))
        .catch(reason => console.log('Login failed: ' + JSON.stringify(reason)));
    };

    init();
    getVoiceToken();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title={receiver?.first_name + ' ' + receiver?.last_name}
        ProfilePic={{ uri: receiver?.profile_picture }}
        lastImg={channel ? require('../../../assets/voiceCallIcon.png') : null}
        lastImgPress={() =>
          navigation.navigate('VoiceCallScreen', { sender, receiver, channelName: channel, token: voiceToken })
        }
      />
      <View style={styles.bottonSheet}>
        <GiftedChat
          messages={content}
          onSend={newMessages => sendmsg(newMessages[0])}
          user={{ _id: sender?._id }}
          textInputProps={{
            style: { flex: 1, marginHorizontal: 10, color: 'black', fontSize: 16 },
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
});
