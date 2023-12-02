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

export default function ChatScreen({route}, props) {
  const userID = useSelector(state => state.user.user._id);
  const socketID = useSelector(state => state.user.socketID);
  const {user, chat} = route.params;
  const [messages, setMessages] = useState([]);
  const {allMessages, setAllMessages} = useState();
  const {handleGetMessages} = useChatService();

  useEffect(() => {
    handleGetMessages(chat);
    if (socket) {
      socket.on('recieve-message', data => {
        socket.emit('message-recieved', data._id);

        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, data),
        );
      });
    }
  }, [socket]);
  // const onSend = newMessages => {
  //   setMessages(previousMessages =>
  //     GiftedChat.append(previousMessages, newMessages),
  //   );
  // };
  const onSend = useCallback(messages => {
    console.log('====================================');
    console.log('onsend');
    console.log('====================================');
    let socket_data = {
      _id: socketID,
      user: userID,
      chat: chat,
      text: messages,
      receiverId: user._id,
    };

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
      <TouchableOpacity style={styles.button}>
        <Image
          source={require('../../../assets/send.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
    );
  };
  // const voiceCall = () => {
  //   RNImmediatePhoneCall.immediatePhoneCall(phone_number);
  // };
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
          onSend={messages => onSend(messages)}
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
