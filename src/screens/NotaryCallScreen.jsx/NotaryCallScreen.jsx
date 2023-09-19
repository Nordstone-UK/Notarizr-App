import {
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import GradientButton from '../../components/MainGradientButton/GradientButton';

export default function NotaryCallScreen() {
  const [selected, setSelected] = useState('waiting room');
  const [screen, setscreen] = useState(true);
  return (
    <View style={styles.container}>
      <View style={styles.NavbarContainer}>
        <View style={styles.NavContainer}>
          <Image
            source={require('../../../assets/waitingNav.png')}
            style={styles.waitingNav}
          />
          <View style={styles.NavTextContainer}>
            <Text style={styles.textHead}>Notary Room</Text>
          </View>
        </View>
        <Image
          source={require('../../../assets/profileIcon.png')}
          style={styles.profilePic}
        />
      </View>
      <View style={styles.buttonContainer}>
        <MainButton
          Title="Notary Room"
          onPress={() => setSelected('notary room')}
          colors={
            selected === 'notary room'
              ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
              : [Colors.PinkBackground, Colors.PinkBackground]
          }
          styles={
            selected === 'notary room'
              ? {
                  fontSize: widthToDp(4),
                  paddingHorizontal: widthToDp(7),
                  paddingVertical: widthToDp(3),
                }
              : {
                  fontSize: widthToDp(4),
                  paddingHorizontal: widthToDp(7),
                  paddingVertical: widthToDp(3),
                  color: Colors.TextColor,
                }
          }
          GradiStyles={{
            borderRadius: 0,
          }}
        />
        <MainButton
          Title="Participants"
          onPress={() => setSelected('participants')}
          colors={
            selected === 'participants'
              ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
              : [Colors.PinkBackground, Colors.PinkBackground]
          }
          styles={
            selected === 'participants'
              ? {
                  fontSize: widthToDp(4),
                  paddingHorizontal: widthToDp(7),
                  paddingVertical: widthToDp(3),
                }
              : {
                  fontSize: widthToDp(4),
                  paddingHorizontal: widthToDp(7),
                  paddingVertical: widthToDp(3),
                  color: Colors.TextColor,
                }
          }
          GradiStyles={{
            borderRadius: 0,
          }}
        />
      </View>

      <ScrollView style={styles.SecondContainer}>
        <View style={styles.flexContainer}>
          <Image
            source={require('../../../assets/Video1.png')}
            style={styles.hourGlass}
          />
          <Image
            source={require('../../../assets/Video2.png')}
            style={styles.hourGlass}
          />
          <View style={{flex: 0.2, justifyContent: 'space-evenly'}}>
            <TouchableOpacity style={styles.hourGlass}>
              <Image source={require('../../../assets/turnOffCamera.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.hourGlass}>
              <Image source={require('../../../assets/mic.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.hourGlass}>
              <Image source={require('../../../assets/callDrop.png')} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.textSession}>Session Starting soon...</Text>

        <View style={styles.btnContainer}>
          <GradientButton
            Title="Leave Room"
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            styles={{fontSize: widthToDp(5)}}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  NavbarContainer: {
    flexDirection: 'row',
    marginHorizontal: widthToDp(5),
    marginVertical: widthToDp(6),
    justifyContent: 'space-between',
  },
  NavContainer: {
    flexDirection: 'row',
    marginHorizontal: widthToDp(2),
    marginVertical: widthToDp(2),
  },
  waitingNav: {
    width: widthToDp(6),
    height: heightToDp(6),
    marginVertical: widthToDp(2),
  },
  profilePic: {
    marginVertical: widthToDp(2),
  },
  flexContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  NavTextContainer: {
    marginLeft: widthToDp(5),
  },
  textHead: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontWeight: '700',
    fontFamily: 'Manrope-Regular',
  },
  textSubHead: {
    color: Colors.TextColor,
    fontSize: widthToDp(3.5),
    fontWeight: '700',
    marginLeft: widthToDp(2),
    fontFamily: 'Manrope-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  SecondContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  hourGlass: {
    alignSelf: 'center',
  },
  textSession: {
    color: Colors.Orange,
    alignSelf: 'center',
    marginTop: heightToDp(10),
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
  },
  sessionDesc: {
    color: Colors.DullTextColor,
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: heightToDp(5),
    fontSize: widthToDp(3.5),
    width: widthToDp(80),
    fontFamily: 'Manrope-Regular',
  },
  btnContainer: {
    marginVertical: widthToDp(5),
  },
  btn: {
    marginVertical: heightToDp(2),
  },
  btncontain: {
    flex: 1,
    justifyContent: 'flex-end',
    marginVertical: heightToDp(5),
  },
});
