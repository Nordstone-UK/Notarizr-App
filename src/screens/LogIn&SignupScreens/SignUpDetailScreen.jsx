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

export default function SignUpDetailScreen({navigation}, props) {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <View style={styles.container}>
      <CompanyHeader
        Header="Profile Details"
        subHeading="Please provide us with your profile details"
        HeaderStyle={{alignSelf: 'center'}}
        subHeadingStyle={{
          alignSelf: 'center',
          fontSize: widthToDp(4.5),
          marginVertical: heightToDp(1.5),
          fontFamily: 'Manrope-Regular',
          color: '#121826',
        }}
      />
      <View style={styles.container}>
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
                Title="Continue"
                onPress={() => navigation.navigate('ProfilePictureScreen')}
              />
            </View>
          </ScrollView>
        </BottomSheetStyle>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
});
