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
import {useDispatch, useSelector} from 'react-redux';
import {ceredentailSet} from '../../features/register/registerSlice';

export default function SignUpDetailScreen({navigation}, props) {
  const [fullName, setFullName] = useState('');
  const [number, setNumber] = useState('');
  const [date, setDate] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    SplashScreen.hide();
  }, []);
  const dispatch = useDispatch();
  function separateFullName(fullName) {
    const nameArray = fullName.split(' ');
    let firstName = '';
    let lastName = '';
    if (nameArray.length === 1) {
      firstName = nameArray[0];
    } else if (nameArray.length >= 2) {
      lastName = nameArray.pop();
      firstName = nameArray.join(' ');
    }
    dispatch(ceredentailSet({firstName, lastName, number, date, city, email}));
    navigation.navigate('ProfilePictureScreen');
  }
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
              leftImageSoucre={require('../../../assets/emailIcon.png')}
              placeholder={'Enter your email address'}
              LabelTextInput={'Email Address'}
              onChangeText={text => setEmail(text)}
            />
            <LabelTextInput
              leftImageSoucre={require('../../../assets/NameIcon.png')}
              placeholder={'Enter your full name'}
              LabelTextInput={'Full Name'}
              onChangeText={text => setFullName(text)}
            />
            <LabelTextInput
              leftImageSoucre={require('../../../assets/phoneIcon.png')}
              placeholder={'Enter your phone number'}
              LabelTextInput={'Phone No.'}
              keyboardType="numeric"
              onChangeText={text => setNumber(text)}
            />
            {/* 
            <LabelTextInput
              leftImageSoucre={require('../../../assets/calenderIcon.png')}
              placeholder={'Enter your date of birth'}
              LabelTextInput={'Date of Birth'}
              keyboardType="numeric"
              onChangeText={text => setDate(text)}
            /> */}
            <LabelTextInput
              leftImageSoucre={require('../../../assets/locationIcon.png')}
              placeholder={'Enter your city'}
              LabelTextInput={'City'}
              onChangeText={text => setCity(text)}
            />
            <View
              style={{
                marginTop: heightToDp(10),
              }}>
              <GradientButton
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                Title="Continue"
                onPress={() => separateFullName(fullName)}
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
