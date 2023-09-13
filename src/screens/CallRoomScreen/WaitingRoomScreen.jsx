import {Button, Image, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import GradientButton from '../../components/MainGradientButton/GradientButton';

export default function WaitingRoomScreen() {
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
            <Text style={styles.textHead}>Waiting Room</Text>
            <Text style={styles.textSubHead}>Next: Notary Room</Text>
          </View>
        </View>
        <Image
          source={require('../../../assets/profileIcon.png')}
          style={styles.profilePic}
        />
      </View>
      <View style={styles.buttonContainer}>
        <MainButton
          Title="Waiting Room"
          onPress={() => setSelected('waiting room')}
          colors={
            selected === 'waiting room'
              ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
              : [Colors.PinkBackground, Colors.PinkBackground]
          }
          styles={
            selected === 'waiting room'
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
      {screen ? (
        <View style={styles.SecondContainer}>
          <Image
            source={require('../../../assets/hourGlass.png')}
            style={styles.hourGlass}
          />
          <Text style={styles.textSession}>Session Starting soon...</Text>
          <Text style={styles.sessionDesc}>
            Thanks for completing the verification precess, please wait for the
            notary to start the session or return at your scheduled date & time
            to start your session. please have PIN written down and readily
            available priore to joining session.
          </Text>
          <View style={styles.btnContainer}>
            <View style={styles.btn}>
              <GradientButton
                Title="Back to add a participant page"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                styles={{fontSize: widthToDp(5)}}
              />
            </View>
            <View style={styles.btn}>
              <GradientButton
                Title="Session not Started"
                colors={[Colors.DisableButtonColor, Colors.DisableButtonColor]}
                styles={{fontSize: widthToDp(5), fontWeight: '700'}}
                onPress={() => setscreen(!screen)}
              />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.SecondContainer}>
          <Text style={styles.textSession}>Notary is Connected</Text>
          <Image
            source={require('../../../assets/Support.png')}
            style={styles.hourGlass}
          />
          <MainButton
            colors={['#fff', '#fff']}
            Title="Notary Officer"
            GradiStyles={{
              borderWidth: 2,
              borderColor: Colors.OrangeGradientEnd,
              borderRadius: 5,
              marginTop: heightToDp(5),
            }}
            styles={{
              color: Colors.Orange,
              fontSize: widthToDp(5),
              paddingHorizontal: widthToDp(2),
              paddingVertical: widthToDp(2),
            }}
          />
          <View style={styles.btncontain}>
            <GradientButton
              Title="Join your session now"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              onPress={() => setscreen(!screen)}
            />
          </View>
        </View>
      )}
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
    marginTop: heightToDp(10),
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
    flex: 1,
    justifyContent: 'flex-end',
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
