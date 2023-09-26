import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  View,
  TextInput,
  ScrollView,
  Alert,
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
import {useLazyQuery, useQuery} from '@apollo/react-hooks';
import {IS_EMAIL_VALID} from '../../../request/queries/isEmailValid.query';
import {GET_EMAIL_OTP} from '../../../request/queries/getEmailOTP.query';

export default function SignUpDetailScreen({navigation}, props) {
  const [fullName, setFullName] = useState('');
  const [number, setNumber] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState();
  const new_user = true;

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
    dispatch(ceredentailSet({firstName, lastName, number, city, email}));
    navigation.navigate('EmailVerification');
  }
  const [isEmailValid, {loading}] = useLazyQuery(IS_EMAIL_VALID);
  const [getEmailOtp, {loadingOTP}] = useLazyQuery(GET_EMAIL_OTP);
  const handleEmailOTP = async () => {
    return new Promise(() => {
      try {
        isEmailValid({
          variables: {email, new_user},
        }).then(response => {
          console.log(response?.data);

          if (response) {
            Alert.alert('OTP not sent');
          } else {
            Alert.alert('OTP Sent');
            separateFullName(fullName);
          }
        });
      } catch (error) {
        console.log(error);
      }
    });
  };
  const handleEmailValid = async () => {
    if (!email || !city || !number || !fullName) {
      Alert.alert('Please fill all the fields before submitting');
    } else {
      return new Promise(() => {
        try {
          isEmailValid({
            variables: {email},
          }).then(response => {
            setEmailValid(response?.data?.isEmailValid?.emailTaken);

            if (emailValid) {
              // console.log('Email Taken');
              Alert.alert('This email is already taken');
            } else {
              // console.log('Email Valid');
              handleEmailOTP();
              setEmailValid(false);
            }
          });
        } catch (error) {
          console.log(error);
        }
      });
    }
  };

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
              LabelTextInput={(emailValid && 'Email Taken') || 'Email Address'}
              onChangeText={text => setEmail(text)}
              Label={true}
              labelStyle={emailValid && {color: Colors.Red}}
              AdjustWidth={emailValid && {borderColor: Colors.Red}}
            />
            <LabelTextInput
              leftImageSoucre={require('../../../assets/NameIcon.png')}
              placeholder={'Enter your full name'}
              Label={true}
              LabelTextInput={'Full Name'}
              onChangeText={text => setFullName(text)}
            />
            <LabelTextInput
              leftImageSoucre={require('../../../assets/phoneIcon.png')}
              placeholder={'Enter your phone number'}
              LabelTextInput={'Phone No.'}
              Label={true}
              keyboardType="numeric"
              onChangeText={text => setNumber(text)}
            />
            <LabelTextInput
              leftImageSoucre={require('../../../assets/locationIcon.png')}
              Label={true}
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
                loading={loading}
                onPress={() => handleEmailValid()}
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
