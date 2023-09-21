import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';

export default function MapArrivalScreen({navigation}, props) {
  return (
    <View style={styles.container}>
      <NavigationHeader
        Title="Brandon Roger"
        ProfilePic={require('../../../assets/profileIcon.png')}
        midImg={require('../../../assets/videoCallIcon.png')}
        lastImg={require('../../../assets/voiceCallIcon.png')}
      />
      <ScrollView style={styles.bottonSheet}>
        <View style={styles.inputContainer}>
          <Image source={require('../../../assets/arriving.png')} />
        </View>
      </ScrollView>
      <View style={styles.button}>
        <GradientButton
          Title="Arriving by 1:30 PM"
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          onPress={() => navigation.navigate('FinalBookingScreen')}
        />
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
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  inputContainer: {
    marginTop: widthToDp(5),
    alignItems: 'center',
  },

  button: {
    marginVertical: widthToDp(5),
  },
});
