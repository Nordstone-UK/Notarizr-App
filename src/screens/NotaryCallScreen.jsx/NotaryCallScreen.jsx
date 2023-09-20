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
import {Slider} from '@miblanchard/react-native-slider';
import {Picker} from '@react-native-picker/picker';

export default function NotaryCallScreen({navigation}) {
  const [selected, setSelected] = useState('notary room');
  const [screen, setscreen] = useState(true);
  const [value, setValue] = useState(50);
  const [selectedDocument, setSelectDocument] = useState('');
  const handleTimezoneSelect = doc => {
    setSelectDocument(doc);
  };
  const displayValue = () => {
    return (
      <Text style={[styles.sessionDesc, {color: Colors.Orange}]}>
        {Math.floor(value)}%
      </Text>
    );
  };
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
        <View
          style={[
            styles.flexContainer,
            {
              alignItems: 'center',
              justifyContent: 'space-between',
              marginHorizontal: widthToDp(5),
            },
          ]}>
          <Text style={styles.sessionDesc}>0%</Text>

          <View style={styles.slideContainer}>
            <Slider
              value={value}
              onValueChange={value => setValue(value)}
              animateTransitions={true}
              maximumValue={100}
              minimumValue={20}
              thumbStyle={{backgroundColor: Colors.OrangeGradientStart}}
              thumbImage={require('../../../assets/thumb.png')}
              trackStyle={{height: heightToDp(3), borderRadius: 5}}
              minimumTrackStyle={{backgroundColor: Colors.Orange}}
              maximumTrackStyle={{backgroundColor: Colors.DisableColor}}
              trackClickable={true}
              renderBelowThumbComponent={displayValue}
            />
          </View>
          <Text style={styles.sessionDesc}>100%</Text>
        </View>
        <Text style={styles.textSession}>Document</Text>
        <View style={styles.picker}>
          <Picker
            selectedValue={selectedDocument}
            onValueChange={handleTimezoneSelect}>
            <Picker.Item
              label="Select a document"
              color={Colors.DullTextColor}
            />
            <Picker.Item label="Document 1" color={Colors.DullTextColor} />
            <Picker.Item label="Document 2" color={Colors.DullTextColor} />
            <Picker.Item label="Document 3" color={Colors.DullTextColor} />
          </Picker>
        </View>
        <Image
          source={require('../../../assets/image.png')}
          style={{alignSelf: 'center'}}
        />
        <View style={styles.btnContainer}>
          <GradientButton
            Title="Complete Session"
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            styles={{fontSize: widthToDp(5)}}
            onPress={() => navigation.navigate('AgentBookingComplete')}
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
  picker: {
    borderWidth: 2,
    borderColor: Colors.DisableColor,
    width: widthToDp(90),
    marginHorizontal: widthToDp(5),
    borderRadius: 15,
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
    color: Colors.TextColor,
    marginHorizontal: widthToDp(5),
    marginTop: heightToDp(10),
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
  },
  sessionDesc: {
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
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
  slideContainer: {
    flex: 1,
    marginHorizontal: widthToDp(5),
    alignItems: 'stretch',
    justifyContent: 'center',
  },
});
