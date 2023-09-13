import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <NavigationHeader
        Title="Brandon Roger"
        ProfilePic={require('../../../assets/userPic.png')}
        midImg={require('../../../assets/videoCallIcon.png')}
        lastImg={require('../../../assets/voiceCallIcon.png')}
      />
      <View style={styles.bottonSheet}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your message"
            value={newMessage}
            onChangeText={text => setNewMessage(text)}
          />
          <TouchableOpacity style={styles.button} onPress={handleSendMessage}>
            <Image
              source={require('../../../assets/send.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.PinkBackground,
  },
  bottonSheet: {
    height: '100%',
    marginTop: widthToDp(2),
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  inputContainer: {
    backgroundColor: 'silver',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    bottom: 10,
    borderRadius: 10,
  },
  input: {
    flex: 1,
    height: 40,
    marginRight: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#37A0A0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
});
