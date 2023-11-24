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
  SafeAreaView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {useDispatch} from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import {GET_PHONE_OTP} from '../../../request/queries/getPhoneOTP.query';
import {useLazyQuery} from '@apollo/client';
import {emailSet} from '../../features/register/registerSlice';
import Toast from 'react-native-toast-message';
import CustomToast from '../../components/CustomToast/CustomToast';

export default function LoginScreen({navigation}, props) {
  const [email, setEmail] = useState('');
  const [getPhoneOtp, {loading}] = useLazyQuery(GET_PHONE_OTP);
  const dispath = useDispatch();

  const handleGetPhoneOtp = () => {
    dispath(emailSet(email));
    try {
      getPhoneOtp({
        variables: {email},
      }).then(response => {
        if (response?.data?.getPhoneOTP?.status === '403') {
          Toast.show({
            type: 'error',
            text1: 'We are Sorry!',
            text2: 'This User is Blocked',
          });
        } else if (response?.data?.getPhoneOTP?.status === '401') {
          Toast.show({
            type: 'error',
            text1: 'Email does not exist!',
            text2: 'Please sign up for a new account',
          });
        } else if (response?.data?.getPhoneOTP?.status !== '200') {
          Toast.show({
            type: 'error',
            text1: 'OTP not sent!',
            text2: 'We encountered a problem please try again',
          });
        } else {
          Toast.show({
            type: 'success',
            text1: `OTP Sent on ${response.data.getPhoneOTP.phoneNumber}`,
            text2: '',
          });
          navigation.navigate('PhoneVerification', {
            message: response.data.getPhoneOTP.phoneNumber,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{backgroundColor: Colors.PinkBackground}}>
        <CompanyHeader
          Header="Welcome Back to Notarizr"
          subHeading="Hello there, sign in to continue!"
          HeaderStyle={{alignSelf: 'center'}}
          subHeadingStyle={{
            alignSelf: 'center',
            fontSize: 17,
            marginVertical: heightToDp(1.5),
            color: '#121826',
          }}
        />
        <BottomSheetStyle>
          <View style={{marginTop: heightToDp(5)}}>
            <LabelTextInput
              leftImageSoucre={require('../../../assets/emailIcon.png')}
              placeholder={'Enter your email address'}
              LabelTextInput={'Email Address'}
              onChangeText={text => setEmail(text)}
              keyboardType={'email-address'}
              Label={true}
            />
            <View
              style={{
                marginTop: heightToDp(10),
              }}>
              <GradientButton
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                Title="Login"
                viewStyle={props.viewStyle}
                GradiStyles={props.GradiStyles}
                onPress={() => handleGetPhoneOtp()}
                loading={loading}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginVertical: heightToDp(10),
              }}>
              <Text
                style={{
                  color: Colors.DullTextColor,
                }}>
                Don’t have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('SignupAsScreen')}>
                <Text style={{color: Colors.Orange}}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetStyle>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
