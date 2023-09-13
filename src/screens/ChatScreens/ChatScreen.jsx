import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
          <TextInput style={styles.input} placeholder="Enter your message" />
          <TouchableOpacity style={styles.button}>
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
    marginTop: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: widthToDp(5),
  },
  input: {
    flex: 1,
    height: 40,
    marginRight: 10,
    paddingHorizontal: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
});
