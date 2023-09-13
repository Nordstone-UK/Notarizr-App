import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  View,
  TextInput,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import SplashScreen from 'react-native-splash-screen';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';

export default function ProfileDetailEditScreen({navigation}, props) {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <View style={styles.container}>
      <NavigationHeader Title="Profile Details" />
      <View>
        <Image
          source={require('../../../assets/Mask.png')}
          style={styles.picture}
        />
        <Image
          source={require('../../../assets/cameraIcon.png')}
          style={styles.camera}
        />
      </View>
      <Text style={styles.textheading}>Lamthao</Text>
      <Text style={styles.textsubheading}>lamthao@gmail.com</Text>
      <BottomSheetStyle>
        <ScrollView style={{marginVertical: heightToDp(10)}}>
          <LabelTextInput
            leftImageSoucre={require('../../../assets/NameIcon.png')}
            placeholder={'Enter your full name'}
            LabelTextInput={'Full Name'}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/phoneIcon.png')}
            placeholder={'Enter your phone number'}
            LabelTextInput={'Phone No.'}
            keyboardType="numeric"
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/calenderIcon.png')}
            placeholder={'Enter your date of birth'}
            LabelTextInput={'Date of Birth'}
            keyboardType="numeric"
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/locationIcon.png')}
            placeholder={'Enter your city'}
            LabelTextInput={'City'}
          />
          <View
            style={{
              marginTop: heightToDp(10),
            }}>
            <GradientButton
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              Title="Save Details"
              onPress={() => navigation.navigate('ProfilePictureScreen')}
            />
          </View>
        </ScrollView>
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2DC',
  },
  picture: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
  },
  camera: {
    position: 'absolute',
    left: widthToDp(55),
    top: heightToDp(20),
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    width: widthToDp(80),
    paddingVertical: heightToDp(2),
    alignSelf: 'center',
    borderRadius: 15,
    marginTop: heightToDp(5),
  },
  input: {
    alignSelf: 'center',
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    backgroundColor: '#fff',
    color: '#424242',
    marginLeft: widthToDp(3),
    width: widthToDp(80),
  },
  icon: {
    padding: widthToDp(2),
    marginTop: widthToDp(3),
  },
  conta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1, // Add any additional styling you want for the container
  },
  input: {
    flex: 1, // Take up all available space in the container
    padding: 8, // Adjust padding as needed
  },
  image: {
    width: 20,
    height: 20,
    marginRight: 10,
    position: 'absolute',
    right: 10, // Adjust the right position as needed
  },
  textheading: {
    fontSize: widthToDp(6),
    alignSelf: 'center',
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
  },
  textsubheading: {
    fontSize: widthToDp(4.5),
    alignSelf: 'center',
    color: Colors.TextColor,
    fontFamily: 'Manrope-Regular',
    marginBottom: heightToDp(2),
  },
});
