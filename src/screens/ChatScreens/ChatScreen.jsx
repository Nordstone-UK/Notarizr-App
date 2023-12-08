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
import {
  Bubble,
  Composer,
  GiftedChat,
  InputToolbar,
} from 'react-native-gifted-chat';
import {useSelector} from 'react-redux';
import RNImmediatePhoneCall from 'react-native-immediate-phone-call';
import useChatService from '../../hooks/useChatService';
import {socket} from '../../utils/Socket';

export default function ChatScreen({route}, props) {
  const userID = useSelector(state => state.user.user._id);
  const socketID = useSelector(state => state.user.socketID);
  const {user, chat} = route.params;
  const [messages, setMessages] = useState([]);
  const {allMessages, setAllMessages} = useState();
  const {handleGetMessages} = useChatService();
  const getMessages = async () => {
    const response = await handleGetMessages(chat);
    console.log('====================================');
    console.log(response);
    console.log('====================================');
  };
  socket.on('connection', () => {
    console.log('someone connected: ', socket?.id);
  });
  useEffect(() => {
    getMessages();
    if (socket) {
      socket.on('recieve-message', data => {
        socket.emit('message-recieved', data._id);

        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, data),
        );
      });
    }
  }, [socket]);
  const onSend = useCallback(() => {
    let randomID = uuid.v4();
    console.log('====================================');
    console.log('onsend');
    console.log('====================================');
    const socket_data = {
      _id: randomID,
      user: userID,
      chat: chat,
      text: messages,
      receiverId: user._id,
    };
    console.log('====================================');
    console.log(socket_data);
    console.log('====================================');
    if (socket) {
      socket.emit('send-message', socket_data, data => {
        console.log(data);
      });
    }
    // setMessages(previousMessages =>
    //   GiftedChat.append(previousMessages, socket_data),
    // );
  }, []);
  const renderSend = props => {
    return (
      <TouchableOpacity style={styles.button} onPress={onSend}>
        <Image
          source={require('../../../assets/send.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
    );
  };
  const renderBubble = props => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: Colors.inputBackground,
            maxWidth: widthToDp(65),
            padding: widthToDp(2),
          },
          right: {
            backgroundColor: Colors.Orange,
            maxWidth: widthToDp(65),
            padding: widthToDp(2),
          },
        }}
        textStyle={{
          left: {color: Colors.text},
          right: {color: dark ? Colors.text : Colors.white},
        }}
        containerStyle={{
          left: {width: widthToDp(65)},
          right: {width: widthToDp(65)},
        }}
      />
    );
  };

  const MessengerBarContainer = props => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: Colors.white,
          marginBottom: heightToDp(2),
          alignContent: 'center',
          justifyContent: 'center',
          borderWidth: 0,
          paddingTop: 6,
          borderTopColor: 'transparent',
        }}
      />
    );
  };

  // if (messageLoading || chatLoading) {
  //   return <LoadingComponent message={LOADING.text3} />;
  // }
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title={user.first_name + ' ' + user.last_name}
        ProfilePic={{uri: user.profile_picture}}
        // midImg={require('../../../assets/videoCallIcon.png')}
        // lastImg={require('../../../assets/voiceCallIcon.png')}
        // lastImgPress={() => voiceCall()}
      />
      <View style={styles.bottonSheet}>
        <GiftedChat
          messages={messages}
          renderSend={renderSend}
          onSend={onSend}
          user={{
            _id: userID,
          }}
          renderBubble={renderBubble}
          renderInputToolbar={MessengerBarContainer}
          infiniteScroll
          scrollToBottom
          renderComposer={props => (
            <Composer
              textInputStyle={{
                color: Colors.text,
              }}
              {...props}
            />
          )}
          showAvatarForEveryMessage={false}
          // renderChatEmpty={() => {
          //   return (
          //     <View style={styles.emptyStateCont}>
          //       <Text style={[styles.emptyTextStyle, {color: Colors.text}]}>
          //         No chats found
          //       </Text>
          //       <Text style={[styles.longEmptyText, {color: Colors.text}]}>
          //         {`Start Chatting with ${user.first_name} `}
          //       </Text>
          //     </View>
          //   );
          // }}
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
    backgroundColor: '#fff',
    borderRadius: 20,
    flex: 1,
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
  emptyStateCont: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: widthToDp(70),
    borderWidth: 1,
  },

  emptyTextStyle: {
    fontSize: widthToDp(4),
    fontWeight: '700',
  },
  longEmptyText: {
    fontSize: widthToDp(4),
    fontWeight: '400',
    color: '#4A4A4A',
    textAlign: 'center',
    padding: widthToDp(5),
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
