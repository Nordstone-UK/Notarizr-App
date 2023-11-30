import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import React, {useState} from 'react';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import {GiftedChat} from 'react-native-gifted-chat';
import {useSelector} from 'react-redux';
import RNImmediatePhoneCall from 'react-native-immediate-phone-call';

export default function ChatScreen({route}, props) {
  const {user} = route.params;
  const [messages, setMessages] = useState([]);
  const onSend = newMessages => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, newMessages),
    );
  };
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
